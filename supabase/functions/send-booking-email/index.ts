import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingPayload {
  bookingRef: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  adults: number;
  children: number;
  kidsAges?: number[];
  arrivalDate: string;
  safariName: string;
  message: string;
  pdfBase64: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured", emailSent: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: BookingPayload = await req.json();
    const {
      bookingRef, firstName, lastName, email,
      whatsapp, adults, children, kidsAges,
      arrivalDate, safariName, message, pdfBase64,
    } = payload;

    const fullName = `${firstName} ${lastName}`;
    const subject = `Your Bahari Asili Voucher – ${bookingRef}`;

    // Build children display string
    const childrenDisplay = children > 0 && kidsAges && kidsAges.length > 0
      ? `${children} (Ages: ${kidsAges.join(", ")} yrs)`
      : String(children);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <div style="background: #0e7490; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Bahari Asili Safaris</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Watamu, Kenya · Founded by Shadrack Safari</p>
        </div>
        <div style="background: #fff7ed; padding: 20px;">
          <p style="margin: 0; color: #f97316; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
          <p style="font-size: 28px; font-weight: 800; color: #0e7490; margin: 4px 0;">${bookingRef}</p>
        </div>
        <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
          <h2 style="color: #0e7490; font-size: 18px; margin-top: 0;">Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${fullName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 6px 0;">${email}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">WhatsApp</td><td style="padding: 6px 0;">${whatsapp || "—"}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Safari / Tour</td><td style="padding: 6px 0; font-weight: 600; color: #f97316;">${safariName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Arrival Date</td><td style="padding: 6px 0; font-weight: 600;">${arrivalDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Adults</td><td style="padding: 6px 0;">${adults}</td></tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Bambini / Children</td>
              <td style="padding: 6px 0;">${childrenDisplay}</td>
            </tr>
            ${message ? `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Message</td><td style="padding: 6px 0;">${message}</td></tr>` : ""}
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

    const recipients = [
      { email: "sheddymae02@gmail.com", name: "Bahari Asili Safaris" },
      { email, name: fullName },
    ];

    const attachment = pdfBase64 ? [{
      filename: `${bookingRef}.pdf`,
      content: pdfBase64,
    }] : [];

    let allSent = true;
    for (const recipient of recipients) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bahari Asili Safaris <onboarding@resend.dev>",
          to: [recipient.email],
          subject,
          html: htmlBody,
          attachments: attachment,
        }),
      });

      if (!res.ok) {
        allSent = false;
        const err = await res.text();
        console.error(`Failed to send to ${recipient.email}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ emailSent: allSent, bookingRef }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: String(err), emailSent: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
