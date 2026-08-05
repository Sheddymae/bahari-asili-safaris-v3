import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-only client using the service-role key — bypasses RLS entirely.
// NEVER import this from a Client Component or expose the key to the browser.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

const DOCUMENTS_BUCKET = 'documents';

/**
 * Upload a base64-encoded PDF to the `documents` storage bucket and return its
 * public URL. Returns null (never throws) so a storage hiccup never blocks an
 * approve/resend action — the email attachment still goes out either way.
 */
export async function uploadDocumentPDF(
  admin: SupabaseClient,
  path: string,
  base64: string
): Promise<string | null> {
  try {
    const bytes = Buffer.from(base64, 'base64');
    const { error } = await admin.storage.from(DOCUMENTS_BUCKET).upload(path, bytes, {
      contentType: 'application/pdf',
      upsert: true,
    });
    if (error) {
      console.error('Document upload error:', error.message);
      return null;
    }
    const { data } = admin.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('Document upload exception:', err);
    return null;
  }
}
