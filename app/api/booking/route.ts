import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVoucherPDF } from '@/lib/voucher-generator';
import type { Booking } from '@/lib/supabase';

// Vercel serverless route — handles booking submission, saves to Supabase,
// sends the booking voucher email to the owner + client, and sends a
// review-request email to the client. Uses Resend (free tier).

const RESEND_API = 'https://api.resend.com/emails';

// ---------- helpers ----------

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Build the booking/voucher HTML email body
function buildBookingEmailHtml(d: {
  bookingRef: string;
  fullName: string;
  email: string;
  whatsapp: string;
  safariName: string;
  arrivalDate: string;
  adults: number;
  childrenDisplay: string;
  message: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #0e7490; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Bahari Asili Safaris</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Watamu, Kenya · Founded by Shadrack Safari</p>
      </div>
      <div style="background: #fff7ed; padding: 20px;">
        <p style="margin: 0; color: #f97316; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
        <p style="font-size: 28px; font-weight: 800; color: #0e7490; margin: 4px 0;">${d.bookingRef}</p>
      </div>
      <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <h2 style="color: #0e7490; font-size: 18px; margin-top: 0;">Booking Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${d.fullName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 6px 0;">${d.email}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">WhatsApp</td><td style="padding: 6px 0;">${d.whatsapp || '—'}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Safari / Tour</td><td style="padding: 6px 0; font-weight: 600; color: #f97316;">${d.safariName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Arrival Date</td><td style="padding: 6px 0; font-weight: 600;">${d.arrivalDate}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Adults</td><td style="padding: 6px 0;">${d.adults}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Bambini / Children</td><td style="padding: 6px 0;">${d.childrenDisplay}</td></tr>
          ${d.message ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Message</td><td style="padding: 6px 0;">${d.message}</td></tr>` : ''}
        </table>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #15803d;">Your PDF voucher is attached. Please present it on arrival in Watamu.</p>
        </div>
      </div>
      <div style="background: #111827; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">WhatsApp: +254101923355 · sheddymae02@gmail.com</p>
        <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0;">© 2026 Bahari Asili Safaris, Watamu. Founded by Shadrack Safari. Designed by Sheddy Mae.</p>
      </div>
    </div>
  `;
}

// Build the review-request HTML email body (sent to the client)
function buildReviewEmailHtml(d: {
  fullName: string;
  bookingRef: string;
  safariName: string;
}): string {
  const reviewLink = `https://bahari-asili-safaris.vercel.app/?review=${encodeURIComponent(d.bookingRef)}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #0e7490; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">How was your safari, ${d.fullName}?</h1>
      </div>
      <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; margin: 0 0 16px;">Thank you for booking <strong style="color: #f97316;">${d.safariName}</strong> with Bahari Asili Safaris (Ref: ${d.bookingRef}).</p>
        <p style="font-size: 15px; margin: 0 0 20px;">We'd love your feedback! Please rate your experience on a scale of 0–10:</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151;">Value for Money</td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="display: inline-block; padding: 6px 14px; background: #f0fdf4; border-radius: 8px; font-weight: 700; color: #15803d;">____ / 10</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151;">Value of Services</td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="display: inline-block; padding: 6px 14px; background: #f0fdf4; border-radius: 8px; font-weight: 700; color: #15803d;">____ / 10</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151;">Staff</td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="display: inline-block; padding: 6px 14px; background: #f0fdf4; border-radius: 8px; font-weight: 700; color: #15803d;">____ / 10</span>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${reviewLink}" style="display: inline-block; background: #0e7490; color: white; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 10px; font-size: 15px;">Share Your Review</a>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin: 0;">You can also leave a review on our Google Business page or TripAdvisor. Your feedback helps us improve and helps other travelers discover the real Kenya.</p>
      </div>
      <div style="background: #111827; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">WhatsApp: +254101923355 · sheddymae02@gmail.com</p>
        <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0;">© 2026 Bahari Asili Safaris, Watamu. Founded by Shadrack Safari. Designed by Sheddy Mae.</p>
      </div>
    </div>
  `;
}

// Send an email via Resend; returns true on success
async function sendEmail(
  apiKey: string,
  sender: string,
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: string }[],
): Promise<boolean> {
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender,
      to: [to],
      subject,
      html,
      attachments: attachments || [],
    }),
  });
  return res.ok;
}

// ---------- route handler ----------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- validation ---
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const safariName = String(body.safariName || '').trim();
    const arrivalDate = String(body.arrivalDate || '').trim();
    const adults = parseInt(body.adults) || 1;
    const children = parseInt(body.children) || 0;
    const kidsAges: number[] = Array.isArray(body.kidsAges) ? body.kidsAges : [];
    const message = String(body.message || '').trim();
    const userId = body.userId || null;

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Valid email is required.' }, { status: 400 });
    }
    if (!safariName) {
      return NextResponse.json({ success: false, error: 'Safari selection is required.' }, { status: 400 });
    }
    if (!arrivalDate) {
      return NextResponse.json({ success: false, error: 'Arrival date is required.' }, { status: 400 });
    }

    // --- generate booking ref ---
    const d = new Date(arrivalDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    // Use service-role client to bypass RLS for server-side insert
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase environment variables.', {
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceKey,
  });

  return NextResponse.json(
    {
      success: false,
      error: 'Booking service is temporarily unavailable.',
    },
    { status: 500 }
  );
}

let bookingRef = `BA-${y}${m}${day}-001`;

const admin = createClient(supabaseUrl, serviceKey);

// Count existing bookings for this date
const { count, error: countError } = await admin
  .from('bookings')
  .select('id', { count: 'exact', head: true })
  .eq('arrival_date', arrivalDate);

if (countError) {
  console.error('Supabase count error:', countError);

  return NextResponse.json(
    {
      success: false,
      error: countError.message,
      code: countError.code,
      details: countError.details,
      hint: countError.hint,
    },
    { status: 500 }
  );
}

const seq = (count ?? 0) + 1;
bookingRef = `BA-${y}${m}${day}-${String(seq).padStart(3, '0')}`;

const { error: saveError } = await admin
  .from('bookings')
  .insert({
    booking_ref: bookingRef,
    first_name: firstName,
    last_name: lastName,
    email,
    whatsapp,
    adults,
    children,
    kids_ages: children > 0 ? kidsAges : null,
    arrival_date: arrivalDate,
    safari_name: safariName,
    message,
    reservation_status: 'pending',
    payment_status: 'unpaid',
    user_id: userId,
  });

if (saveError) {
  console.error('Supabase insert error:', saveError);

  return NextResponse.json(
    {
      success: false,
      error: saveError.message,
      code: saveError.code,
      details: saveError.details,
      hint: saveError.hint,
    },
    { status: 500 }
  );
}

    // --- send emails via Resend ---
    const apiKey = process.env.EMAIL_API_KEY;
    const sender = process.env.EMAIL_SENDER || 'Bahari Asili Safaris <onboarding@resend.dev>';
    const ownerEmail = process.env.EMAIL_TO;
    if (!ownerEmail) {
      console.error('EMAIL_TO is not set — admin notification email cannot be delivered.');
    }

    const fullName = `${firstName} ${lastName}`;
    const childrenDisplay = children > 0 && kidsAges.length > 0
      ? `${children} (Ages: ${kidsAges.join(', ')} yrs)`
      : String(children);

    const bookingHtml = buildBookingEmailHtml({
      bookingRef, fullName, email, whatsapp, safariName, arrivalDate, adults, childrenDisplay, message,
    });

    let attachment: { filename: string; content: string }[] = [];
    try {
      const voucherBooking: Booking = {
        booking_ref: bookingRef,
        first_name: firstName,
        last_name: lastName,
        email,
        whatsapp,
        adults,
        children,
        kids_ages: children > 0 ? kidsAges : null,
        arrival_date: arrivalDate,
        safari_name: safariName,
        message,
        reservation_status: 'pending',
      };
      const { base64 } = await generateVoucherPDF(voucherBooking);
      attachment = [{ filename: `${bookingRef}.pdf`, content: base64 }];
    } catch (pdfErr) {
      console.error('Voucher PDF generation failed (email will send without attachment):', pdfErr);
    }

    let emailSent = false;

    if (apiKey) {
      // 1. Booking email to owner
      const ownerOk = ownerEmail
        ? await sendEmail(apiKey, sender, ownerEmail, `New Booking – ${bookingRef}`, bookingHtml, attachment)
        : false;
      // 2. Booking email to client (voucher copy)
      const clientOk = await sendEmail(apiKey, sender, email, `Your Bahari Asili Voucher – ${bookingRef}`, bookingHtml, attachment);
      // 3. Review-request email to client
      const reviewHtml = buildReviewEmailHtml({ fullName, bookingRef, safariName });
      await sendEmail(apiKey, sender, email, `How was your safari? Share your review – ${bookingRef}`, reviewHtml);

      emailSent = ownerOk || clientOk;
    } else {
      console.warn('EMAIL_API_KEY not set — skipping email send');
    }

    return NextResponse.json({ success: true, bookingRef, emailSent });
  } catch (err) {
    console.error('Booking API error:', err);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again or WhatsApp us.' },
      { status: 500 },
    );
  }
}
