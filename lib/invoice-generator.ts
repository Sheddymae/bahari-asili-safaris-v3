import type { Booking } from './supabase';

export interface InvoiceData extends Booking {
  accommodation_cost?: number;
  park_fees?: number;
  guide_cost?: number;
  transport_cost?: number;
  meals_cost?: number;
  other_costs?: number;
  discount?: number;
  tax?: number;
  parks?: string[];
}

/**
 * Generate a premium invoice PDF using jsPDF
 * Includes detailed cost breakdown, terms, and professional branding
 */
export async function generatePremiumInvoicePDF(invoice: InvoiceData): Promise<{ dataUrl: string; base64: string }> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width
  const MARGIN = 14;
  const COLOR_PRIMARY = [14, 116, 144]; // #0e7490 (ocean)
  const COLOR_ACCENT = [249, 115, 22]; // #f97316 (safari)
  const COLOR_TEXT = [31, 41, 55]; // #1f2937
  const COLOR_LIGHT = [107, 114, 128]; // #6b7280

  let y = 14;

  // ===== HEADER =====
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, W, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('BAHARI ASILI SAFARIS', MARGIN, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Watamu, Kenya  ·  +254 101 923 355  ·  sheddymae02@gmail.com', MARGIN, 24);

  doc.setFontSize(8);
  doc.setTextColor(200, 235, 245);
  doc.text('Founded by Shadrack Safari  ·  Designed by Sheddy Mae', MARGIN, 32);

  // ===== STATUS BANNER =====
  doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.rect(0, 42, W, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BOOKING REFERENCE', MARGIN, 48);

  doc.setFontSize(16);
  doc.text(invoice.booking_ref || '', MARGIN, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const status = invoice.reservation_status === 'confirmed' ? 'CONFIRMED' : 'PENDING QUOTATION';
  doc.setTextColor(255, 255, 255);
  doc.text('Status: ' + status, W - MARGIN, 55, { align: 'right' });

  y = 68;

  // ===== CLIENT DETAILS SECTION =====
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y - 3, W - 2 * MARGIN, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('CLIENT DETAILS', MARGIN + 2, y + 2);

  y += 10;

  const row = (label: string, value: string, indent = 0) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
    doc.text(label, MARGIN + indent, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    const maxWidth = W - MARGIN - 70 - indent;
    const textLines = doc.splitTextToSize(value || '—', maxWidth);
    doc.text(textLines, 80 + indent, y);

    y += Math.max(5, textLines.length * 4);
  };

  row('Full Name', `${invoice.first_name} ${invoice.last_name}`);
  row('Email', invoice.email);
  row('WhatsApp', invoice.whatsapp || '—');
  row('Guests', `${invoice.adults} Adults${invoice.children > 0 ? ` + ${invoice.children} Children` : ''}`);
  if (invoice.children > 0 && invoice.kids_ages?.length) {
    row('Children Ages', `${invoice.kids_ages.join(', ')} years`);
  }

  y += 6;

  // ===== TRAVEL DETAILS SECTION =====
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y - 3, W - 2 * MARGIN, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('TRAVEL DETAILS', MARGIN + 2, y + 2);

  y += 10;

  row('Safari / Tour', invoice.safari_name);
  row('Arrival Date', new Date(invoice.arrival_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
  
  if ((invoice as any).departure_date) {
    row('Departure Date', new Date((invoice as any).departure_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
  }

  if ((invoice as any).parks && (invoice as any).parks.length > 0) {
    row('Parks / Destinations', (invoice as any).parks.join(', '));
  }

  if (invoice.message) {
    row('Special Requests', invoice.message);
  }

  y += 6;

  // ===== COST BREAKDOWN SECTION =====
  if ((invoice as InvoiceData).accommodation_cost || (invoice as InvoiceData).park_fees || (invoice as InvoiceData).guide_cost) {
    doc.setFillColor(248, 250, 252);
    doc.rect(MARGIN, y - 3, W - 2 * MARGIN, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text('COST BREAKDOWN', MARGIN + 2, y + 2);

    y += 10;

    const costs = [
      { label: 'Accommodation', value: (invoice as InvoiceData).accommodation_cost },
      { label: 'Park Fees & Permits', value: (invoice as InvoiceData).park_fees },
      { label: 'Guide & Vehicle', value: (invoice as InvoiceData).guide_cost },
      { label: 'Transport & Transfers', value: (invoice as InvoiceData).transport_cost },
      { label: 'Meals & Catering', value: (invoice as InvoiceData).meals_cost },
      { label: 'Other Services', value: (invoice as InvoiceData).other_costs },
    ];

    let subtotal = 0;
    costs.forEach(cost => {
      if (cost.value && cost.value > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
        doc.text(cost.label, MARGIN + 2, y);

        doc.setTextColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
        doc.text(`KES ${cost.value.toLocaleString()}`, W - MARGIN - 2, y, { align: 'right' });

        subtotal += cost.value;
        y += 5;
      }
    });

    // Subtotal
    doc.setDrawColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 2, y, W - MARGIN - 2, y);
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text('Subtotal', MARGIN + 2, y);
    doc.text(`KES ${subtotal.toLocaleString()}`, W - MARGIN - 2, y, { align: 'right' });

    y += 6;

    // Discounts & Taxes
    const discount = (invoice as InvoiceData).discount || 0;
    const tax = (invoice as InvoiceData).tax || 0;
    const total = subtotal - discount + tax;

    if (discount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(34, 197, 94); // Green for discount
      doc.text('Discount', MARGIN + 2, y);
      doc.text(`-KES ${discount.toLocaleString()}`, W - MARGIN - 2, y, { align: 'right' });
      y += 5;
    }

    if (tax > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      doc.text('Tax & Service Charge', MARGIN + 2, y);
      doc.text(`KES ${tax.toLocaleString()}`, W - MARGIN - 2, y, { align: 'right' });
      y += 5;
    }

    // Total
    doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
    doc.rect(MARGIN, y - 2, W - 2 * MARGIN, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL QUOTATION', MARGIN + 2, y + 3);
    doc.text(`KES ${total.toLocaleString()}`, W - MARGIN - 2, y + 3, { align: 'right' });

    y += 12;
  }

  // ===== TERMS & CONDITIONS =====
  y += 2;
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y - 3, W - 2 * MARGIN, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('IMPORTANT INFORMATION', MARGIN + 2, y + 2);

  y += 10;

  const termsText = [
    '• This is a quotation for safari services. It is not a confirmed booking until payment is received.',
    '• Availability is subject to confirmation. We will confirm dates within 24-48 hours.',
    '• A 30% deposit is required to hold your dates. Final payment is due 2 weeks before arrival.',
    '• Cancellations made 30+ days before arrival: Full refund. 15-29 days: 50% refund. Less than 15 days: No refund.',
    '• All park fees and permits are included. Travel insurance is recommended.',
    '• Children under 5 travel free (no separate vehicle required). Children 5-12 charged at 70% of adult rate.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);

  termsText.forEach(term => {
    const lines = doc.splitTextToSize(term, W - 2 * MARGIN - 4);
    lines.forEach((line: string) => {
      if (y > 260) {
        // Add new page if needed
        doc.addPage();
        y = 14;
      }
      doc.text(line, MARGIN + 2, y);
      y += 3.5;
    });
  });

  y += 4;

  // ===== FOOTER =====
  doc.setDrawColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, W - MARGIN, y);

  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_LIGHT[0], COLOR_LIGHT[1], COLOR_LIGHT[2]);
  doc.text('To confirm this quotation, please reply to this email or WhatsApp us at +254 101 923 355', MARGIN, y);
  y += 4;
  doc.text('Questions? Email: sheddymae02@gmail.com', MARGIN, y);

  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('© 2026 Bahari Asili Safaris, Watamu, Kenya. Founded by Shadrack Safari. Designed by Sheddy Mae.', W / 2, y, { align: 'center' });

  // Generate both dataUrl and base64
  const dataUrl = doc.output('dataurlstring') as string;
  const pdf = doc.output('arraybuffer');
  const binary = new Uint8Array(pdf);
  let base64 = '';
  for (let i = 0; i < binary.length; i++) {
    base64 += String.fromCharCode(binary[i]);
  }
  const base64String = btoa(base64);

  return { dataUrl, base64: base64String };
}
