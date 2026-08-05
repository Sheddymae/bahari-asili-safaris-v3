import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generatePremiumInvoicePDF } from '@/lib/invoice-generator';
import { generateVoucherPDF } from '@/lib/voucher-generator';
import { sendEmail } from '@/lib/email';
import {
  buildConfirmationEmailHtml,
  buildQuoteEmailHtml,
  buildPaymentReminderEmailHtml,
  buildPreDepartureReminderEmailHtml,
  buildReviewRequestEmailHtml,
  buildCustomEmailHtml,
} from '@/lib/email-templates';
import type { Booking } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const SUBJECTS: Record<string, (b: Booking) => string> = {
  confirmation: (b) => 'Your Bahari Asili Safaris Booking is Confirmed',
  quote: (b) => `Your Safari Quote — ${b.booking_ref}`,
  payment_reminder: (b) => `Payment Reminder — ${b.booking_ref}`,
  pre_departure_reminder: (b) => `Your Safari is Coming Up — ${b.booking_ref}`,
  review_request: (b) => `How Was Your ${b.safari_name}?`,
};

// GET /api/admin/reservations/[id]/send-email — email send history for this reservation
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('email_logs')
      .select('*')
      .eq('booking_id', params.id)
      .order('sent_at', { ascending: false });
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to load email history.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, logs: data });
  } catch (err) {
    console.error('Email history error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}

// POST body: { type: 'confirmation'|'quote'|'payment_reminder'|'pre_departure_reminder'|'review_request'|'custom', subject?, message? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`admin-send-email:${ip}`, 30, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'Too many emails sent, slow down.' }, { status: 429 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err) {
    console.error('Send email: Supabase admin client unavailable:', err);
    return NextResponse.json({ success: false, error: 'Server is missing Supabase configuration.' }, { status: 500 });
  }

  const emailApiKey = process.env.EMAIL_API_KEY;
  if (!emailApiKey) {
    console.error('EMAIL_API_KEY not set — cannot send admin-triggered emails.');
    return NextResponse.json({ success: false, error: 'Email sending is not configured on the server.' }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type as string;
    const validTypes = ['confirmation', 'quote', 'payment_reminder', 'pre_departure_reminder', 'review_request', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid email type.' }, { status: 400 });
    }

    const { data: booking, error: fetchError } = await admin
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .maybeSingle<Booking>();

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }

    let subject: string;
    let html: string;
    let attachments: { filename: string; content: string }[] = [];

    if (type === 'custom') {
      subject = String(body.subject || `Message from Bahari Asili Safaris — ${booking.booking_ref}`);
      const messageHtml = String(body.message || '').replace(/\n/g, '<br/>');
      if (!messageHtml.trim()) {
        return NextResponse.json({ success: false, error: 'Message body is required for a custom email.' }, { status: 400 });
      }
      html = buildCustomEmailHtml(booking, messageHtml);
    } else if (type === 'confirmation') {
      subject = SUBJECTS.confirmation(booking);
      html = buildConfirmationEmailHtml(booking);
      const [invoice, voucher] = await Promise.all([
        generatePremiumInvoicePDF(booking as any),
        generateVoucherPDF(booking),
      ]);
      attachments = [
        { filename: `Invoice-${booking.booking_ref}.pdf`, content: invoice.base64 },
        { filename: `Voucher-${booking.booking_ref}.pdf`, content: voucher.base64 },
      ];
    } else if (type === 'quote') {
      subject = SUBJECTS.quote(booking);
      html = buildQuoteEmailHtml(booking);
    } else if (type === 'payment_reminder') {
      subject = SUBJECTS.payment_reminder(booking);
      html = buildPaymentReminderEmailHtml(booking);
    } else if (type === 'pre_departure_reminder') {
      subject = SUBJECTS.pre_departure_reminder(booking);
      html = buildPreDepartureReminderEmailHtml(booking);
    } else {
      subject = SUBJECTS.review_request(booking);
      html = buildReviewRequestEmailHtml(booking);
    }

    const success = await sendEmail(booking.email, subject, html, attachments);

    await admin.from('email_logs').insert({
      booking_id: booking.id,
      email_type: type,
      subject,
      recipient: booking.email,
      success,
      error_message: success ? null : 'Resend API returned a non-OK response — see server logs for details.',
    });

    // Quote emails move the invoice into the "sent" state so quoted-vs-confirmed
    // revenue reporting reflects reality.
    if (type === 'quote' && booking.invoice_status === 'draft') {
      await admin.from('bookings').update({ invoice_status: 'quoted' }).eq('id', booking.id);
    }

    return NextResponse.json({ success, emailSent: success });
  } catch (err) {
    console.error('Send email error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
