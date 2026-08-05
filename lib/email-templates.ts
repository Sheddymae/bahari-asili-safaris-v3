import type { Booking } from './supabase';

/** "Your Bahari Asili Safaris Booking is Confirmed" — sent when admin approves a reservation. */
export function buildConfirmationEmailHtml(booking: Booking): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const guests = `${booking.adults} Adult${booking.adults !== 1 ? 's' : ''}${
    booking.children > 0 ? ` + ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : ''
  }`;
  const travelDate = new Date(booking.arrival_date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const amount = booking.total_price ? `KES ${Number(booking.total_price).toLocaleString()}` : 'To be confirmed';
  const paymentStatus = (booking.payment_status || 'unpaid').toUpperCase();
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1f2937; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0e7490 0%, #06b6d4 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">BAHARI ASILI SAFARIS</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 13px;">Watamu, Kenya · Founded by Shadrack Safari</p>
      </div>

      <div style="background: #fff7ed; padding: 20px 32px; border-left: 4px solid #f97316;">
        <p style="margin: 0; color: #ea580c; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">✓ Booking Confirmed</p>
        <p style="margin: 4px 0 0; font-size: 15px; color: #7c2d12;">Dear ${fullName}, thank you — your reservation is confirmed!</p>
      </div>

      <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Reservation Number</p>
        <p style="font-size: 26px; font-weight: 800; color: #0e7490; margin: 0 0 20px;">${booking.booking_ref}</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600; width: 40%;">Package</td><td style="padding: 10px 0; font-weight: 600; color: #f97316;">${booking.safari_name}</td></tr>
          <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Travel Date</td><td style="padding: 10px 0; font-weight: 600;">${travelDate}</td></tr>
          <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Guests</td><td style="padding: 10px 0;">${guests}</td></tr>
          ${booking.hotel_name ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Hotel</td><td style="padding: 10px 0;">${booking.hotel_name}</td></tr>` : ''}
          ${booking.pickup_location ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Pickup Location</td><td style="padding: 10px 0;">${booking.pickup_location}</td></tr>` : ''}
          <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Amount</td><td style="padding: 10px 0; font-weight: 700; color: #0e7490;">${amount}</td></tr>
          <tr><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Payment Status</td><td style="padding: 10px 0;"><span style="background: #f0fdf4; color: #15803d; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;">${paymentStatus}</span></td></tr>
        </table>

        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <p style="margin: 0; font-size: 13.5px; color: #0369a1;">Your <strong>invoice</strong> and <strong>travel voucher</strong> are attached as PDFs to this email. Please bring the voucher (printed or on your phone) on the day of travel.</p>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px dashed #e5e7eb;">
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;"><strong style="color: #1f2937;">Emergency Contact:</strong> +254 101 923 355 (WhatsApp)</p>
          <p style="font-size: 13px; color: #6b7280; margin: 0;"><strong style="color: #1f2937;">Terms:</strong> Please review the terms and conditions included in your invoice PDF.</p>
        </div>
      </div>

      <div style="background: #111827; padding: 24px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #e5e7eb; font-size: 13px; margin: 0 0 4px; font-weight: 600;">Bahari Asili Safaris · Watamu, Kenya</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">sheddymae02@gmail.com · +254 101 923 355 · bahari-asili-safaris.vercel.app</p>
        <p style="color: #6b7280; font-size: 11px; margin: 10px 0 0;">© 2026 Bahari Asili Safaris, Watamu. Founded by Shadrack Safari. Designed by Sheddy Mae.</p>
      </div>
    </div>
  `;
}

/** Internal admin notification, sent for every new submission across all booking types. */
export function buildAdminNotificationEmailHtml(booking: Booking): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const rows: [string, string][] = [
    ['Reservation Number', booking.booking_ref],
    ['Booking Date', booking.created_at ? new Date(booking.created_at).toLocaleString('en-GB') : '—'],
    ['Customer Name', fullName],
    ['Email', booking.email],
    ['Phone / WhatsApp', booking.whatsapp || '—'],
    ['Nationality', booking.nationality || '—'],
    ['Adults', String(booking.adults)],
    ['Children', String(booking.children)],
    ['Travel Date', booking.arrival_date],
    ['Tour Selected', booking.safari_name],
    ['Hotel', booking.hotel_name || '—'],
    ['Pickup Location', booking.pickup_location || '—'],
    ['Special Requests', booking.message || '—'],
    ['Total Price', booking.total_price ? `KES ${Number(booking.total_price).toLocaleString()}` : 'TBD'],
    ['Payment Status', (booking.payment_status || 'unpaid').toUpperCase()],
    ['Booking Status', (booking.reservation_status || 'pending').toUpperCase()],
  ];

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #0e7490; padding: 20px 24px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">🔔 NEW RESERVATION — ${booking.booking_ref}</h2>
      </div>
      <div style="padding: 20px 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${rows
            .map(
              ([label, value]) =>
                `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 6px 0; color: #6b7280; width: 42%;">${label}</td><td style="padding: 6px 0; font-weight: 600;">${value}</td></tr>`
            )
            .join('')}
        </table>
        <p style="margin-top: 20px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bahari-asili-safaris.vercel.app'}/admin" style="background: #0e7490; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">Open Admin Dashboard →</a></p>
      </div>
    </div>
  `;
}

/** Sent to the admin inbox whenever a reservation is cancelled. */
export function buildAdminCancellationEmailHtml(booking: Booking): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #dc2626; padding: 18px 24px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 17px;">✕ Reservation Cancelled — ${booking.booking_ref}</h2>
      </div>
      <div style="padding: 18px 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <p style="font-size: 14px; margin: 0 0 6px;"><strong>${booking.first_name} ${booking.last_name}</strong> (${booking.email})</p>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px;">Package: ${booking.safari_name}</p>
        <p style="font-size: 13px; color: #6b7280; margin: 0;">Travel date: ${booking.arrival_date}</p>
        ${booking.admin_notes ? `<p style="font-size: 13px; color: #6b7280; margin: 12px 0 0;"><strong>Note:</strong> ${booking.admin_notes}</p>` : ''}
      </div>
    </div>
  `;
}

/** Sent to the admin inbox whenever a reservation's payment status changes to "paid". */
export function buildAdminPaymentReceivedEmailHtml(booking: Booking): string {
  const amount = booking.total_price ? `KES ${Number(booking.total_price).toLocaleString()}` : 'Amount not set';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #16a34a; padding: 18px 24px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 17px;">💰 Payment Received — ${booking.booking_ref}</h2>
      </div>
      <div style="padding: 18px 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <p style="font-size: 14px; margin: 0 0 6px;"><strong>${booking.first_name} ${booking.last_name}</strong> (${booking.email})</p>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px;">Package: ${booking.safari_name}</p>
        <p style="font-size: 15px; font-weight: 700; color: #16a34a; margin: 12px 0 0;">${amount}</p>
      </div>
    </div>
  `;
}

// ---------- Shared branded shell ----------
function emailShell(bodyHtml: string, headerLabel: string, headerColor: string = '#0e7490'): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1f2937; background: #ffffff;">
      <div style="background: linear-gradient(135deg, ${headerColor} 0%, #06b6d4 100%); padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">BAHARI ASILI SAFARIS</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 12px;">${headerLabel}</p>
      </div>
      <div style="padding: 28px 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
        ${bodyHtml}
      </div>
      <div style="background: #111827; padding: 24px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #e5e7eb; font-size: 13px; margin: 0 0 4px; font-weight: 600;">Bahari Asili Safaris · Watamu, Kenya</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">sheddymae02@gmail.com · +254 101 923 355 · bahari-asili-safaris.vercel.app</p>
      </div>
    </div>
  `;
}

function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d;
  }
}

function fmtKES(n?: number | null): string {
  return n != null ? `KES ${Number(n).toLocaleString()}` : 'To be confirmed';
}

/** "Quote sent" email — sent before a reservation is confirmed. */
export function buildQuoteEmailHtml(booking: Booking): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const body = `
    <p style="font-size: 15px; margin: 0 0 16px;">Dear ${fullName},</p>
    <p style="font-size: 14px; color: #4b5563; margin: 0 0 20px;">Thank you for your interest — here's your quote for <strong style="color: #f97316;">${booking.safari_name}</strong>.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Reservation Ref</td><td style="padding: 10px 0; font-weight: 700; color: #0e7490;">${booking.booking_ref}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Travel Date</td><td style="padding: 10px 0;">${fmtDate(booking.arrival_date)}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Guests</td><td style="padding: 10px 0;">${booking.adults} Adults${booking.children > 0 ? ` + ${booking.children} Children` : ''}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Quoted Amount</td><td style="padding: 10px 0; font-weight: 700; color: #0e7490; font-size: 16px;">${fmtKES(booking.total_price)}</td></tr>
      ${booking.deposit_amount ? `<tr><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Deposit to Confirm</td><td style="padding: 10px 0; font-weight: 600;">${fmtKES(booking.deposit_amount)}</td></tr>` : ''}
    </table>
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px; margin-top: 20px;">
      <p style="margin: 0; font-size: 13px; color: #9a3412;">This quote is valid for 7 days. Reply to this email or WhatsApp us on +254 101 923 355 to confirm your booking.</p>
    </div>
  `;
  return emailShell(body, 'Your Safari Quote', '#f97316');
}

/** Payment reminder — sent for reservations with an outstanding balance. */
export function buildPaymentReminderEmailHtml(booking: Booking): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const balance = booking.balance_due ?? (booking.total_price ? Number(booking.total_price) - (booking.amount_paid || 0) : null);
  const body = `
    <p style="font-size: 15px; margin: 0 0 16px;">Dear ${fullName},</p>
    <p style="font-size: 14px; color: #4b5563; margin: 0 0 20px;">This is a friendly reminder about the outstanding balance on your upcoming safari.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Reservation Ref</td><td style="padding: 10px 0; font-weight: 700; color: #0e7490;">${booking.booking_ref}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Package</td><td style="padding: 10px 0;">${booking.safari_name}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Travel Date</td><td style="padding: 10px 0;">${fmtDate(booking.arrival_date)}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Total Amount</td><td style="padding: 10px 0;">${fmtKES(booking.total_price)}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Paid So Far</td><td style="padding: 10px 0;">${fmtKES(booking.amount_paid)}</td></tr>
      ${booking.due_date ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Due Date</td><td style="padding: 10px 0; font-weight: 600;">${fmtDate(booking.due_date)}</td></tr>` : ''}
      <tr><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Balance Due</td><td style="padding: 10px 0; font-weight: 800; color: #dc2626; font-size: 17px;">${fmtKES(balance)}</td></tr>
    </table>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-top: 20px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b;">Please settle the balance to secure your reservation. Contact us on WhatsApp (+254 101 923 355) for payment options.</p>
    </div>
  `;
  return emailShell(body, 'Payment Reminder', '#dc2626');
}

/** Pre-departure reminder — sent X days before the travel date. */
export function buildPreDepartureReminderEmailHtml(booking: Booking): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const body = `
    <p style="font-size: 15px; margin: 0 0 16px;">Dear ${fullName},</p>
    <p style="font-size: 14px; color: #4b5563; margin: 0 0 20px;">Your safari is coming up soon! Here's a quick reminder of your trip details.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Reservation Ref</td><td style="padding: 10px 0; font-weight: 700; color: #0e7490;">${booking.booking_ref}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Package</td><td style="padding: 10px 0;">${booking.safari_name}</td></tr>
      <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Travel Date</td><td style="padding: 10px 0; font-weight: 700;">${fmtDate(booking.arrival_date)}</td></tr>
      ${booking.pickup_location ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Pickup Location</td><td style="padding: 10px 0;">${booking.pickup_location}</td></tr>` : ''}
    </table>
    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin-top: 20px;">
      <p style="margin: 0; font-size: 13px; color: #0369a1;">Your voucher and invoice were sent when your booking was confirmed — let us know if you need them resent. Emergency contact: +254 101 923 355 (WhatsApp).</p>
    </div>
  `;
  return emailShell(body, 'Your Trip is Coming Up', '#0e7490');
}

/** Review request — sent after trip completion. */
export function buildReviewRequestEmailHtml(booking: Booking): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const body = `
    <p style="font-size: 15px; margin: 0 0 16px;">Dear ${fullName},</p>
    <p style="font-size: 14px; color: #4b5563; margin: 0 0 20px;">We hope you had an unforgettable time on your <strong>${booking.safari_name}</strong>! Would you mind sharing a few words about your experience? It helps other travelers — and means a lot to our small team.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://wa.me/254101923355?text=${encodeURIComponent(`Hi! Here's my review for my ${booking.safari_name} trip: `)}" style="background: #0e7490; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Share Your Experience →</a>
    </div>
  `;
  return emailShell(body, 'How Was Your Safari?', '#16a34a');
}

/** Wraps an admin's free-form custom message in the branded shell. */
export function buildCustomEmailHtml(booking: Booking, messageHtml: string): string {
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const body = `
    <p style="font-size: 15px; margin: 0 0 16px;">Dear ${fullName},</p>
    <div style="font-size: 14px; color: #374151; line-height: 1.7;">${messageHtml}</div>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">Reservation Ref: ${booking.booking_ref}</p>
  `;
  return emailShell(body, 'A Message From Bahari Asili Safaris', '#0e7490');
}
