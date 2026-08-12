import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, uploadDocumentPDF } from '@/lib/supabase-admin';
import { generatePremiumInvoicePDF } from '@/lib/invoice-generator';
import { generateVoucherPDF } from '@/lib/voucher-generator';
import { sendEmail } from '@/lib/email';
import {
  buildConfirmationEmailHtml,
  buildAdminCancellationEmailHtml,
  buildAdminPaymentReceivedEmailHtml,
} from '@/lib/email-templates';
import type { Booking } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.from('bookings').select('*').eq('id', params.id).maybeSingle();
    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation: data });
  } catch (err) {
    console.error('Get reservation error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

// PATCH body: { action: 'approve' | 'reject' | 'complete' | 'generate_invoice' | 'generate_voucher' | 'update', ...fields }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err) {
    console.error('Patch reservation: Supabase admin client unavailable:', err);
    return NextResponse.json({ success: false, error: 'Server is missing Supabase configuration.' }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    const { data: booking, error: fetchError } = await admin
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .maybeSingle<Booking>();

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }

    const emailApiKey = process.env.EMAIL_API_KEY;
    const adminEmail = process.env.EMAIL_TO;
    if (!emailApiKey) console.error('EMAIL_API_KEY not set — admin/customer emails will be skipped.');
    if (!adminEmail) console.error('EMAIL_TO not set — internal admin notifications will be skipped.');

    if (action === 'approve') {
      const updates: Partial<Booking> = {
        reservation_status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      };
      if (typeof body.total_price === 'number') updates.total_price = body.total_price;
      if (typeof body.payment_status === 'string') updates.payment_status = body.payment_status;
      if (!booking.invoice_status || ['draft', 'quoted', 'sent'].includes(booking.invoice_status)) {
        updates.invoice_status = 'confirmed';
      }
      if (!booking.invoice_number) updates.invoice_number = `INV-${booking.booking_ref}`;

      const merged: Booking = { ...booking, ...updates };

      const [invoice, voucher] = await Promise.all([
        generatePremiumInvoicePDF(merged as any),
        generateVoucherPDF(merged),
      ]);

      const [invoiceUrl, voucherUrl] = await Promise.all([
        uploadDocumentPDF(admin, `invoices/${merged.booking_ref}.pdf`, invoice.base64),
        uploadDocumentPDF(admin, `vouchers/${merged.booking_ref}.pdf`, voucher.base64),
      ]);

      updates.invoice_generated = true;
      updates.voucher_generated = true;
      if (invoiceUrl) updates.invoice_url = invoiceUrl;
      if (voucherUrl) updates.voucher_url = voucherUrl;

      const { data: updated, error: updateError } = await admin
        .from('bookings')
        .update(updates)
        .eq('id', params.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Approve update error:', updateError.message);
        return NextResponse.json({ success: false, error: 'Failed to update reservation.' }, { status: 500 });
      }

      const emailSent = emailApiKey
        ? await sendEmail(
            merged.email,
            'Your Bahari Asili Safaris Booking is Confirmed',
            buildConfirmationEmailHtml(merged),
            [
              { filename: `Invoice-${merged.booking_ref}.pdf`, content: invoice.base64 },
              { filename: `Voucher-${merged.booking_ref}.pdf`, content: voucher.base64 },
            ]
          )
        : false;

      return NextResponse.json({ success: true, reservation: updated, emailSent });
    }

    if (action === 'reject') {
      const updates: Partial<Booking> = { reservation_status: 'cancelled', admin_notes: body.reason || booking.admin_notes };
      const { data: updated, error: updateError } = await admin
        .from('bookings')
        .update(updates)
        .eq('id', params.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Reject update error:', updateError.message);
        return NextResponse.json({ success: false, error: 'Failed to update reservation.' }, { status: 500 });
      }

      if (emailApiKey && adminEmail) {
        await sendEmail(
          adminEmail,
          `Reservation Cancelled — ${booking.booking_ref}`,
          buildAdminCancellationEmailHtml({ ...booking, ...updates })
        );
      }

      return NextResponse.json({ success: true, reservation: updated });
    }

    if (action === 'complete') {
      const { data: updated, error: updateError } = await admin
        .from('bookings')
        .update({ reservation_status: 'completed' })
        .eq('id', params.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Complete update error:', updateError.message);
        return NextResponse.json({ success: false, error: 'Failed to update reservation.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, reservation: updated });
    }

    if (action === 'generate_invoice' || action === 'generate_voucher') {
      const isInvoice = action === 'generate_invoice';
      const { base64 } = isInvoice
        ? await generatePremiumInvoicePDF(booking as any)
        : await generateVoucherPDF(booking);

      const path = isInvoice ? `invoices/${booking.booking_ref}.pdf` : `vouchers/${booking.booking_ref}.pdf`;
      const url = await uploadDocumentPDF(admin, path, base64);

      const updates: Partial<Booking> = isInvoice
        ? { invoice_generated: true, ...(url ? { invoice_url: url } : {}), ...(!booking.invoice_number ? { invoice_number: `INV-${booking.booking_ref}` } : {}) }
        : { voucher_generated: true, ...(url ? { voucher_url: url } : {}) };

      const { data: updated, error: updateError } = await admin
        .from('bookings')
        .update(updates)
        .eq('id', params.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Generate document update error:', updateError.message);
        return NextResponse.json({ success: false, error: 'Failed to save generated document.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, reservation: updated, url });
    }

    if (action === 'record_payment') {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: 'A valid payment amount is required.' }, { status: 400 });
      }

      const newAmountPaid = (booking.amount_paid || 0) + amount;
      const total = booking.total_price || 0;
      const newBalance = Math.max(0, total - newAmountPaid);

      let newInvoiceStatus = booking.invoice_status || 'draft';
      let newPaymentStatus = booking.payment_status || 'unpaid';
      if (total > 0 && newAmountPaid >= total) {
        newInvoiceStatus = 'paid';
        newPaymentStatus = 'paid';
      } else if (newAmountPaid > 0) {
        newInvoiceStatus = 'partially_paid';
        newPaymentStatus = 'partial';
      }

      const updates: Partial<Booking> = {
        amount_paid: newAmountPaid,
        balance_due: newBalance,
        invoice_status: newInvoiceStatus,
        payment_status: newPaymentStatus,
        payment_method: body.payment_method || booking.payment_method,
        payment_date: new Date().toISOString(),
      };

      const { data: updated, error: updateError } = await admin
        .from('bookings')
        .update(updates)
        .eq('id', params.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Record payment error:', updateError.message);
        return NextResponse.json({ success: false, error: 'Failed to record payment.' }, { status: 500 });
      }

      if (newInvoiceStatus === 'paid' && emailApiKey && adminEmail) {
        await sendEmail(
          adminEmail,
          `Payment Received — ${booking.booking_ref}`,
          buildAdminPaymentReceivedEmailHtml(updated as Booking)
        );
      }

      return NextResponse.json({ success: true, reservation: updated });
    }

// Generic field update — used by "Save Changes"
const allowedFields = [
  'admin_notes',
  'payment_status',
  'total_price',
  'hotel_name',
  'pickup_location',
  'nationality',
  'reservation_status',
  'invoice_status',
  'invoice_number',
  'deposit_amount',
  'due_date',
];

const updates: Record<string, any> = {};

for (const field of allowedFields) {
  if (Object.prototype.hasOwnProperty.call(body, field)) {
    updates[field] = body[field];
  }
}

if (Object.keys(updates).length === 0) {
  return NextResponse.json(
    {
      success: false,
      error: 'No valid fields to update.',
    },
    { status: 400 }
  );
}

// Normalize numeric fields
if ('total_price' in updates) {
  const total = Number(updates.total_price);

  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Total price must be a valid number greater than or equal to 0.',
      },
      { status: 400 }
    );
  }

  updates.total_price = total;
}

if ('deposit_amount' in updates) {
  const deposit = Number(updates.deposit_amount);

  if (!Number.isFinite(deposit) || deposit < 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Deposit amount must be a valid number greater than or equal to 0.',
      },
      { status: 400 }
    );
  }

  updates.deposit_amount = deposit;
}

// Normalize payment status
if ('payment_status' in updates) {
  const validPaymentStatuses = ['unpaid', 'partial', 'paid'];

  if (!validPaymentStatuses.includes(updates.payment_status)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid payment status.',
      },
      { status: 400 }
    );
  }
}

// Normalize reservation status
if ('reservation_status' in updates) {
  const validReservationStatuses = [
    'pending',
    'confirmed',
    'cancelled',
    'completed',
  ];

  if (!validReservationStatuses.includes(updates.reservation_status)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid reservation status.',
      },
      { status: 400 }
    );
  }
}

const wasUnpaid = booking.payment_status !== 'paid';

const { data: updated, error: updateError } = await admin
  .from('bookings')
  .update(updates)
  .eq('id', params.id)
  .select()
  .maybeSingle();

if (updateError) {
  console.error('========================================');
  console.error('SAVE CHANGES FAILED');
  console.error('Booking ID:', params.id);
  console.error('Updates:', updates);
  console.error('Supabase error:', updateError);
  console.error('========================================');

  return NextResponse.json(
    {
      success: false,
      error: updateError.message || 'Failed to update reservation.',
      details: updateError.details || null,
      hint: updateError.hint || null,
      code: updateError.code || null,
    },
    { status: 500 }
  );
}

if (!updated) {
  return NextResponse.json(
    {
      success: false,
      error: 'Reservation was not updated.',
    },
    { status: 404 }
  );
}

// If payment was changed from unpaid/partial to paid,
// notify the admin.
if (
  wasUnpaid &&
  updates.payment_status === 'paid' &&
  emailApiKey &&
  adminEmail
) {
  try {
    await sendEmail(
      adminEmail,
      `Payment Received — ${booking.booking_ref}`,
      buildAdminPaymentReceivedEmailHtml(updated as Booking)
    );
  } catch (emailError) {
    console.error('Payment notification email failed:', emailError);
  }
}

return NextResponse.json({
  success: true,
  reservation: updated,
});

    // "Admin receives ... Every payment" — fire when payment_status transitions to 'paid'.
    if (wasUnpaid && updates.payment_status === 'paid' && emailApiKey && adminEmail && updated) {
      await sendEmail(
        adminEmail,
        `Payment Received — ${booking.booking_ref}`,
        buildAdminPaymentReceivedEmailHtml(updated as Booking)
      );
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    console.error('Patch reservation error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('bookings').delete().eq('id', params.id);
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete reservation.' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete reservation error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
