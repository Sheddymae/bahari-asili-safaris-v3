import { NextRequest, NextResponse } from 'next/server';
import { type Quotation } from '@/lib/supabase';

const RESEND_API = 'https://api.resend.com/emails';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildQuotationEmailHtml(q: Quotation & { createdDate: string }): string {
  const subtotal = (q.accommodation_cost || 0) + (q.park_fees || 0) + (q.guide_cost || 0) + (q.transport_cost || 0) + (q.meals_cost || 0) + (q.other_costs || 0);
  const afterDiscount = subtotal - (q.discount || 0);
  const total = afterDiscount + (q.tax || 0);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #0e7490 0%, #06b6d4 100%); padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Bahari Asili Safaris</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Watamu, Kenya · Premium Safari Experiences</p>
      </div>

      <div style="background: #f0fdf4; padding: 20px 32px; border-top: 4px solid #22c55e;">
        <p style="margin: 0; color: #15803d; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Quotation Reference</p>
        <p style="font-size: 32px; font-weight: 800; color: #0e7490; margin: 8px 0;">${q.quotation_ref}</p>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">Valid until: ${new Date(new Date(q.createdDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>

      <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb;">
        <h2 style="color: #0e7490; font-size: 20px; margin: 0 0 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">Guest Details</h2>
        <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280; width: 40%;">Name</td>
            <td style="padding: 12px 0; color: #1f2937;">${q.first_name} ${q.last_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Email</td>
            <td style="padding: 12px 0; color: #1f2937;">${q.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">WhatsApp</td>
            <td style="padding: 12px 0; color: #1f2937;">${q.whatsapp || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Guests</td>
            <td style="padding: 12px 0; color: #1f2937;">${q.adults} Adults${q.children > 0 ? `, ${q.children} Children` : ''}</td>
          </tr>
        </table>

        <h2 style="color: #0e7490; font-size: 20px; margin: 24px 0 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">Travel Itinerary</h2>
        <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280; width: 40%;">Destination</td>
            <td style="padding: 12px 0; color: #1f2937; font-weight: 600;">${q.destination}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Arrival Date</td>
            <td style="padding: 12px 0; color: #1f2937;">${new Date(q.arrival_date).toLocaleDateString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Departure Date</td>
            <td style="padding: 12px 0; color: #1f2937;">${new Date(q.departure_date).toLocaleDateString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Duration</td>
            <td style="padding: 12px 0; color: #1f2937;">${q.duration_nights} nights</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Activities</td>
            <td style="padding: 12px 0; color: #1f2937;">${q.activities.join(', ')}</td>
          </tr>
        </table>

        <h2 style="color: #0e7490; font-size: 20px; margin: 24px 0 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">Cost Breakdown</h2>
        <table style="width: 100%; margin-bottom: 24px; font-size: 14px; border-collapse: collapse;">
          ${q.accommodation_cost ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Accommodation</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.accommodation_cost.toLocaleString()}</td></tr>` : ''}
          ${q.park_fees ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Park Fees</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.park_fees.toLocaleString()}</td></tr>` : ''}
          ${q.guide_cost ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Guide & Vehicle</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.guide_cost.toLocaleString()}</td></tr>` : ''}
          ${q.transport_cost ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Transport & Transfers</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.transport_cost.toLocaleString()}</td></tr>` : ''}
          ${q.meals_cost ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Meals</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.meals_cost.toLocaleString()}</td></tr>` : ''}
          ${q.other_costs ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Other Services</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.other_costs.toLocaleString()}</td></tr>` : ''}
          <tr style="border-bottom: 2px solid #0e7490; font-weight: 600;">
            <td style="padding: 12px 0;">Subtotal</td>
            <td style="padding: 12px 0; text-align: right;">KES ${subtotal.toLocaleString()}</td>
          </tr>
          ${q.discount ? `<tr style="border-bottom: 1px solid #f3f4f6; color: #22c55e;"><td style="padding: 12px 0;">Discount</td><td style="padding: 12px 0; text-align: right;">-KES ${q.discount.toLocaleString()}</td></tr>` : ''}
          ${q.tax ? `<tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 12px 0; color: #6b7280;">Tax & Fees</td><td style="padding: 12px 0; text-align: right; color: #1f2937;">KES ${q.tax.toLocaleString()}</td></tr>` : ''}
          <tr style="background: #f9fafb;">
            <td style="padding: 16px 0; font-weight: 700; font-size: 16px; color: #0e7490;">TOTAL</td>
            <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 16px; color: #0e7490;">KES ${total.toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Next Steps:</strong></p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #1e40af;">1. Review the quotation above<br/>2. Confirm dates and guests<br/>3. Reply to confirm or ask questions<br/>4. Upon acceptance, we'll send an invoice and booking confirmation</p>
        </div>

        ${q.terms ? `<div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 12px; color: #6b7280;"><strong>Terms & Conditions:</strong><br/>${q.terms}</div>` : ''}
      </div>

      <div style="background: #111827; padding: 24px; text-align: center; border-radius: 0 0 12px 12px;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">WhatsApp: +254101923355 | Email: sheddymae02@gmail.com</p>
        <p style="color: #6b7280; font-size: 11px; margin: 12px 0 0;">© 2026 Bahari Asili Safaris, Watamu. All rights reserved.</p>
      </div>
    </div>
  `;
}

async function sendEmail(
  apiKey: string,
  sender: string,
  to: string,
  subject: string,
  html: string,
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
    }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const quotation: Quotation = {
      quotation_ref: body.quotation_ref,
      booking_ref: body.booking_ref,
      first_name: String(body.first_name || '').trim(),
      last_name: String(body.last_name || '').trim(),
      email: String(body.email || '').trim(),
      whatsapp: String(body.whatsapp || '').trim(),
      adults: parseInt(body.adults) || 1,
      children: parseInt(body.children) || 0,
      kids_ages: body.kids_ages || [],
      arrival_date: body.arrival_date,
      departure_date: body.departure_date,
      duration_nights: parseInt(body.duration_nights) || 1,
      destination: String(body.destination || '').trim(),
      activities: Array.isArray(body.activities) ? body.activities : [],
      accommodation_type: body.accommodation_type,
      accommodation_cost: body.accommodation_cost,
      park_fees: body.park_fees,
      guide_cost: body.guide_cost,
      transport_cost: body.transport_cost,
      meals_cost: body.meals_cost,
      other_costs: body.other_costs,
      discount: body.discount,
      tax: body.tax,
      total_cost: body.total_cost,
      currency: body.currency || 'KES',
      terms: body.terms,
      status: 'sent',
      user_id: body.user_id,
    };

    if (!isValidEmail(quotation.email)) {
      return NextResponse.json({ success: false, error: 'Valid email is required.' }, { status: 400 });
    }

    // Send quotation email
    const apiKey = process.env.EMAIL_API_KEY;
    const sender = process.env.EMAIL_SENDER || 'Bahari Asili Safaris <onboarding@resend.dev>';
    const html = buildQuotationEmailHtml({ ...quotation, createdDate: new Date().toISOString() });

    let emailSent = false;
    if (apiKey) {
      emailSent = await sendEmail(
        apiKey,
        sender,
        quotation.email,
        `Your Bahari Asili Safari Quotation – ${quotation.quotation_ref}`,
        html,
      );
    }

    return NextResponse.json({ success: true, quotation_ref: quotation.quotation_ref, emailSent });
  } catch (err) {
    console.error('Quotation API error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to generate quotation. Please try again.' },
      { status: 500 },
    );
  }
}
