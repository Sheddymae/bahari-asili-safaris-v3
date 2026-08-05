import type { Booking } from './supabase';

/**
 * Generate a travel voucher PDF using jsPDF. Works both server-side (API
 * routes, Node runtime) and client-side — jsPDF and its output() methods
 * (dataurlstring / arraybuffer) work in both environments.
 */
export async function generateVoucherPDF(booking: Booking): Promise<{ dataUrl: string; base64: string }> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const MARGIN = 14;
  const COLOR_PRIMARY = [14, 116, 144]; // #0e7490
  const COLOR_ACCENT = [249, 115, 22]; // #f97316
  const COLOR_TEXT = [31, 41, 55];
  const COLOR_LIGHT = [107, 114, 128];

  let y = 14;

  // ===== HEADER =====
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, W, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BAHARI ASILI SAFARIS', MARGIN, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Watamu, Kenya  ·  +254 101 923 355  ·  sheddymae02@gmail.com', MARGIN, 27);
  doc.setFontSize(8);
  doc.setTextColor(200, 235, 245);
  doc.text('Founded by Shadrack Safari  ·  Designed by Sheddy Mae', MARGIN, 35);

  // ===== TRAVEL VOUCHER BANNER =====
  doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.rect(0, 42, W, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TRAVEL VOUCHER · RESERVATION', MARGIN, 50);
  doc.setFontSize(17);
  doc.text(booking.booking_ref || '', MARGIN, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const statusLabel = (booking.reservation_status || 'pending').toUpperCase();
  doc.text(`STATUS: ${statusLabel}`, W - MARGIN, 58, { align: 'right' });

  y = 72;

  const sectionHeader = (label: string) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(MARGIN, y - 3, W - 2 * MARGIN, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(label, MARGIN + 2, y + 2);
    y += 10;
  };

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
    doc.text(label, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    const maxWidth = W - MARGIN - 70;
    const lines = doc.splitTextToSize(value || '—', maxWidth);
    doc.text(lines, 80, y);
    y += Math.max(5, lines.length * 4);
  };

  // ===== TRAVELER DETAILS =====
  sectionHeader('TRAVELER DETAILS');
  row('Full Name', `${booking.first_name} ${booking.last_name}`);
  row('Email', booking.email);
  row('WhatsApp / Phone', booking.whatsapp || '—');
  if (booking.nationality) row('Nationality', booking.nationality);
  row('Guests', `${booking.adults} Adults${booking.children > 0 ? ` + ${booking.children} Children` : ''}`);
  if (booking.children > 0 && booking.kids_ages?.length) {
    row('Children Ages', `${booking.kids_ages.join(', ')} years`);
  }

  y += 4;

  // ===== TOUR / PICKUP DETAILS =====
  sectionHeader('TOUR & PICKUP DETAILS');
  row('Tour / Safari', booking.safari_name);
  row(
    'Travel Date',
    new Date(booking.arrival_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  );
  if (booking.hotel_name) row('Hotel', booking.hotel_name);
  if (booking.pickup_location) row('Pickup Location', booking.pickup_location);
  if (booking.message) row('Special Requests', booking.message);

  y += 4;

  // ===== EMERGENCY CONTACT =====
  sectionHeader('EMERGENCY CONTACT (BAHARI ASILI SAFARIS)');
  row('WhatsApp / Phone', '+254 101 923 355');
  row('Email', 'sheddymae02@gmail.com');

  y += 6;

  // ===== NOTE BOX =====
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(MARGIN, y, W - 2 * MARGIN, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61);
  doc.text('Please present this voucher (printed or on your phone) to your guide on arrival.', MARGIN + 4, y + 6);
  doc.text('Pickup time will be confirmed via WhatsApp the evening before travel.', MARGIN + 4, y + 11);

  y += 26;

  // ===== FOOTER =====
  doc.setDrawColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
  doc.text('Company Stamp / Authorized Signature: ______________________', MARGIN, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    '© 2026 Bahari Asili Safaris, Watamu, Kenya. Founded by Shadrack Safari. Designed by Sheddy Mae.',
    W / 2,
    y,
    { align: 'center' }
  );

  const dataUrl = doc.output('dataurlstring') as string;
  const pdf = doc.output('arraybuffer');
  const binary = new Uint8Array(pdf);
  let bin = '';
  for (let i = 0; i < binary.length; i++) bin += String.fromCharCode(binary[i]);
  const base64String = btoa(bin);

  return { dataUrl, base64: base64String };
}
