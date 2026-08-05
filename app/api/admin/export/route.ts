import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const bookingType = searchParams.get('booking_type') || '';
    const search = searchParams.get('search')?.trim() || '';

    let query = admin.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('reservation_status', status);
    if (bookingType) query = query.eq('booking_type', bookingType);
    if (search) {
      const like = `%${search}%`;
      query = query.or(
        [
          `booking_ref.ilike.${like}`,
          `first_name.ilike.${like}`,
          `last_name.ilike.${like}`,
          `email.ilike.${like}`,
        ].join(',')
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to export reservations.' }, { status: 500 });
    }

    const headers = [
      'Reservation Number', 'Customer Name', 'Email', 'Phone', 'Nationality',
      'Adults', 'Children', 'Travel Date', 'Tour', 'Hotel', 'Pickup Location',
      'Amount', 'Payment Status', 'Booking Status', 'Booking Date',
    ];

    const lines = [headers.join(',')];
    for (const b of data || []) {
      lines.push(
        [
          csvEscape(b.booking_ref),
          csvEscape(`${b.first_name} ${b.last_name}`),
          csvEscape(b.email),
          csvEscape(b.whatsapp),
          csvEscape(b.nationality),
          csvEscape(b.adults),
          csvEscape(b.children),
          csvEscape(b.arrival_date),
          csvEscape(b.safari_name),
          csvEscape(b.hotel_name),
          csvEscape(b.pickup_location),
          csvEscape(b.total_price),
          csvEscape(b.payment_status),
          csvEscape(b.reservation_status),
          csvEscape(b.created_at),
        ].join(',')
      );
    }

    const csv = lines.join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
