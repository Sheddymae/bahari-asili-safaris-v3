const RESEND_API = 'https://api.resend.com/emails';

export interface EmailAttachment {
  filename: string;
  content: string; // base64
}

/** Send an email via Resend. Returns true on success, false otherwise (never throws). */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY;
  const sender = process.env.EMAIL_SENDER || 'Bahari Asili Safaris <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('EMAIL_API_KEY not set — skipping email send to', to);
    return false;
  }

  try {
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
    if (!res.ok) {
      console.error('Resend send failed:', res.status, await res.text().catch(() => ''));
    }
    return res.ok;
  } catch (err) {
    console.error('Resend send error:', err);
    return false;
  }
}
