import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generatePremiumInvoicePDF } from '@/lib/invoice-generator';
import { generateVoucherPDF } from '@/lib/voucher-generator';
import { sendEmail } from '@/lib/email';
import { buildConfirmationEmailHtml } from '@/lib/email-templates';
import type { Booking } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`admin-resend:${ip}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'Too many resend requests, slow down.' }, { status: 429 });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: booking, error } = await admin
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .maybeSingle<Booking>();

    if (error || !booking) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }

    const [invoice, voucher] = await Promise.all([
      generatePremiumInvoicePDF(booking as any),
      generateVoucherPDF(booking),
    ]);

    const emailSent = await sendEmail(
      booking.email,
      'Your Bahari Asili Safaris Booking is Confirmed',
      buildConfirmationEmailHtml(booking),
      [
        { filename: `Invoice-${booking.booking_ref}.pdf`, content: invoice.base64 },
        { filename: `Voucher-${booking.booking_ref}.pdf`, content: voucher.base64 },
      ]
    );

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    console.error('Resend confirmation error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
