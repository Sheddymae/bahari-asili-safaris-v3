import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback to placeholder values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key_for_development';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Booking {
  id?: number;
  booking_ref: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  adults: number;
  children: number;
  arrival_date: string;
  safari_name: string;
  message: string;
  email_sent?: boolean;
  reservation_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  user_id?: string | null;
  voucher_path?: string | null;
  kids_ages?: number[] | null;
  created_at?: string;
  booking_type?: 'safari' | 'excursion' | 'hotel' | 'transfer' | 'custom' | 'contact';
  nationality?: string | null;
  pickup_location?: string | null;
  hotel_name?: string | null;
  total_price?: number | null;
  payment_status?: 'unpaid' | 'partial' | 'paid';
  admin_notes?: string | null;
  invoice_generated?: boolean;
  voucher_generated?: boolean;
  invoice_url?: string | null;
  voucher_url?: string | null;
  confirmed_at?: string | null;
  updated_at?: string;
  invoice_status?: 'draft' | 'quoted' | 'sent' | 'confirmed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  invoice_number?: string | null;
  deposit_amount?: number | null;
  amount_paid?: number;
  balance_due?: number | null;
  payment_method?: string | null;
  payment_date?: string | null;
  due_date?: string | null;
}

export interface EmailLog {
  id?: number;
  booking_id: number;
  email_type: 'confirmation' | 'quote' | 'payment_reminder' | 'pre_departure_reminder' | 'review_request' | 'custom';
  subject: string;
  recipient: string;
  success?: boolean;
  error_message?: string | null;
  sent_at?: string;
}

export interface Quotation {
  id?: number;
  quotation_ref: string;
  booking_ref?: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  adults: number;
  children: number;
  kids_ages?: number[] | null;
  arrival_date: string;
  departure_date: string;
  duration_nights: number;
  destination: string;
  activities: string[];
  accommodation_type?: string;
  accommodation_cost?: number;
  park_fees?: number;
  guide_cost?: number;
  transport_cost?: number;
  meals_cost?: number;
  other_costs?: number;
  discount?: number;
  tax?: number;
  total_cost: number;
  currency: string;
  terms?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  user_id?: string | null;
  created_at?: string;
  sent_at?: string;
  expires_at?: string;
}

export async function getBookingRefSequence(dateStr: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('arrival_date', dateStr);
    return (count ?? 0) + 1;
  } catch (error) {
    // Return default sequence number if database is not available
    return 1;
  }
}

export function buildBookingRef(arrivalDate: string, seq: number): string {
  const d = new Date(arrivalDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const n = String(seq).padStart(3, '0');
  return `BA-${y}${m}${day}-${n}`;
}

export async function saveBooking(booking: Booking): Promise<{ data: Booking | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .maybeSingle();
    return { data, error };
  } catch (error) {
    // Return error if database is not available
    console.warn('Booking save attempted with placeholder Supabase instance');
    return { data: null, error: new Error('Database not configured') };
  }
}

// Note: quotation persistence (saveQuotation/getQuotationByRef/etc.) was removed —
// /api/quotation only emails a quotation PDF, it never wrote to a `quotations` table,
// and nothing else in the app called these. The `Quotation` interface above is still
// used to type that route's request body.
