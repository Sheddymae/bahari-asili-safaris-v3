'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Send, CheckCircle, AlertCircle, Download, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { safaris, excursions } from '@/lib/tours-data';
import AuthModal from '@/components/AuthModal';
import InquiryStatusDisplay from '@/components/InquiryStatusDisplay';

const WHATSAPP_NUMBER = '254101923355';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTour?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  adults: string;
  children: string;
  arrivalDate: string;
  safari: string;
  message: string;
}

// Formats kids_ages array for display: [5, 9] → "5, 9 anni"
export function formatKidsAges(ages: number[] | null | undefined, locale: string): string {
  if (!ages || ages.length === 0) return '';
  const anni = locale === 'it' ? 'anni' : locale === 'fr' ? 'ans' : 'yrs';
  return ages.join(', ') + ' ' + anni;
}

async function generateVoucherPDF(booking: {
  bookingRef: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  adults: number;
  children: number;
  kidsAges: number[];
  arrivalDate: string;
  safariName: string;
  parks: string[];
  days: number;
  message: string;
}): Promise<{ dataUrl: string; base64: string }> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;

  doc.setTextColor(240, 244, 248);
  doc.setFontSize(72);
  doc.setFont('helvetica', 'bold');
  doc.text('BAHARI', W / 2, 160, { align: 'center', angle: 30 });

  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, W, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BAHARI ASILI SAFARIS', 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Watamu, Kenya  ·  +254 101 923 355  ·  sheddymae02@gmail.com', 14, 27);
  doc.setFontSize(8);
  doc.setTextColor(200, 235, 245);
  doc.text('Founded by Shadrack Safari  ·  Designed by Sheddy Mae', 14, 35);

  doc.setFillColor(249, 115, 22);
  doc.rect(0, 42, W, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BOOKING REFERENCE', 14, 52);
  doc.setFontSize(18);
  doc.text(booking.bookingRef, 14, 61);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Meeting Point: Watamu, Kenya', W - 14, 52, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('Emergency: +254 101 923 355', W - 14, 61, { align: 'right' });

  let y = 78;

  const sectionTitle = (title: string) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 5, W - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(14, 116, 144);
    doc.text(title.toUpperCase(), 16, y);
    y += 8;
  };

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text(value || '—', 70, y);
    y += 7;
  };

  sectionTitle('Client Details');
  row('Full Name',      `${booking.firstName} ${booking.lastName}`);
  row('Email',          booking.email);
  row('WhatsApp',       booking.whatsapp || '—');
  row('Adults',         String(booking.adults));

  const childrenLabel = booking.children > 0 && booking.kidsAges.length > 0
    ? `${booking.children}  (Età / Ages: ${booking.kidsAges.join(', ')} anni)`
    : String(booking.children);
  row('Bambini / Children', childrenLabel);
  y += 4;

  sectionTitle('Travel Details');
  row('Safari / Tour',  booking.safariName);
  row('Arrival Date',   booking.arrivalDate);
  row('Duration',       booking.days > 0 ? `${booking.days} days` : 'Day excursion');
  row('Parks Included', booking.parks.join(' · ') || '—');
  if (booking.message) {
    row('Special Requests', '');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(booking.message, W - 90);
    doc.text(lines, 70, y - 7);
    y += Math.max(0, (lines.length - 1) * 5);
  }
  y += 4;

  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, W - 28, 18, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(249, 115, 22);
  doc.text('TERMS', 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('Voucher – present on arrival  ·  Subject to availability  ·  Non-transferable', 18, y + 14);

  doc.setFillColor(17, 24, 39);
  doc.rect(0, 275, W, 22, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('WhatsApp: +254 101 923 355  ·  Email: sheddymae02@gmail.com  ·  Watamu, Kenya', W / 2, 284, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('© 2026 Bahari Asili Safaris. Founded by Shadrack Safari. Designed by Sheddy Mae.', W / 2, 292, { align: 'center' });

  const dataUrl = doc.output('datauristring');
  const base64 = dataUrl.split(',')[1];
  return { dataUrl, base64 };
}

export default function BookingModal({ isOpen, onClose, selectedTour }: BookingModalProps) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [bookingRef, setBookingRef] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [kidsAges, setKidsAges] = useState<(number | '')[]>([]);
  const [kidsAgesError, setKidsAgesError] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    adults: '2',
    children: '0',
    arrivalDate: '',
    safari: selectedTour || '',
    message: '',
  });

  // Sync kidsAges array length with children count
  useEffect(() => {
    const count = Math.min(Math.max(parseInt(form.children) || 0, 0), 10);
    setKidsAges(prev => {
      if (prev.length === count) return prev;
      if (count < prev.length) return prev.slice(0, count);
      return [...prev, ...Array(count - prev.length).fill('')];
    });
    setKidsAgesError(false);
  }, [form.children]);

  // Auto-fill from user profile
  useEffect(() => {
    if (user && isOpen) {
      const meta = user.user_metadata || {};
      const fullName: string = meta.full_name || '';
      const parts = fullName.trim().split(' ');
      setForm(prev => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        whatsapp: meta.whatsapp || prev.whatsapp,
      }));
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (selectedTour) setForm(prev => ({ ...prev, safari: selectedTour }));
  }, [selectedTour]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStatus('idle');
      setBookingRef('');
      setShowAuthPrompt(false);
      setKidsAgesError(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKidsAgeChange = (index: number, value: string) => {
    setKidsAges(prev => {
      const next = [...prev];
      next[index] = value === '' ? '' : parseInt(value);
      return next;
    });
    setKidsAgesError(false);
  };

  const getSafariDetails = (name: string) => {
    const s = safaris.find(s => s.name === name);
    if (s) return { parks: s.parks, days: s.days };
    return { parks: [], days: 0 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all child ages are selected
    const childCount = parseInt(form.children) || 0;
    if (childCount > 0 && kidsAges.some(a => a === '')) {
      setKidsAgesError(true);
      return;
    }

    setStatus('loading');

    try {
      const resolvedAges = kidsAges.filter((a): a is number => a !== '');
      const safariDetails = getSafariDetails(form.safari);

      // Submit to the server — it is the single source of truth for saving the
      // booking and generating the reservation number. (Previously this modal
      // also inserted directly into Supabase from the client with its own
      // separately-generated ref, which created a duplicate row with a
      // mismatched reference number every time someone booked.)
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          whatsapp: form.whatsapp,
          adults: parseInt(form.adults),
          children: childCount,
          kidsAges: resolvedAges,
          arrivalDate: form.arrivalDate,
          safariName: form.safari,
          message: form.message,
          userId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.bookingRef) {
        throw new Error(data.error || 'Booking could not be saved.');
      }

      const ref: string = data.bookingRef;
      setBookingRef(ref);
      setEmailSent(data.emailSent === true);

      // Generate the voucher PDF using the confirmed reservation number and
      // auto-download it for the customer.
      const { dataUrl } = await generateVoucherPDF({
        bookingRef: ref,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        whatsapp: form.whatsapp,
        adults: parseInt(form.adults),
        children: childCount,
        kidsAges: resolvedAges,
        arrivalDate: form.arrivalDate,
        safariName: form.safari,
        parks: safariDetails.parks,
        days: safariDetails.days,
        message: form.message,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${ref}.pdf`;
      a.click();

      if (!user) setShowAuthPrompt(true);
      setStatus('success');
    } catch (err) {
      console.error('Booking error:', err);
      setStatus('error');
    }
  };

  const buildWhatsAppMsg = () => {
    const childCount = parseInt(form.children) || 0;
    const agesStr = childCount > 0 && kidsAges.length > 0
      ? ` (Ages: ${kidsAges.join(', ')})`
      : '';
    const lines = [
      `*Booking – Bahari Asili Safaris*`,
      bookingRef ? `Ref: ${bookingRef}` : '',
      `Name: ${form.firstName} ${form.lastName}`,
      `Email: ${form.email}`,
      `Adults: ${form.adults} | Children: ${form.children}${agesStr}`,
      `Safari: ${form.safari}`,
      `Date: ${form.arrivalDate}`,
      form.message ? `Notes: ${form.message}` : '',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  };

  if (!isOpen) return null;

  const childCount = parseInt(form.children) || 0;
  const allSafariNames = safaris.map(s => ({ name: s.name, days: s.days }));

  const childAgeLabel = (i: number) =>
    locale === 'it'
      ? `Età Bambino ${i + 1}`
      : locale === 'fr'
        ? `Âge Enfant ${i + 1}`
        : `Child ${i + 1} Age`;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-hero w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10">
            <div>
              <h2 className="font-poppins font-bold text-xl text-gray-900">{t.booking.title}</h2>
              <p className="font-inter text-gray-500 text-sm mt-0.5">{t.booking.subtitle}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Guest banner */}
          {!user && status === 'idle' && (
            <div className="mx-6 mt-4 bg-ocean-50 border border-ocean-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <UserPlus className="w-4 h-4 text-ocean-600 flex-shrink-0 mt-0.5" />
              <p className="font-inter text-sm text-ocean-800">
                <button onClick={() => setAuthModalOpen(true)} className="font-semibold underline">Sign up</button> to save your vouchers and track bookings, or continue as guest below.
              </p>
            </div>
          )}

          {/* Success */}
          {status === 'success' ? (
            <div className="px-6 py-10">
              <div className="mb-6">
                <InquiryStatusDisplay
                  bookingRef={bookingRef}
                  firstName={form.firstName}
                  email={form.email}
                  whatsapp={form.whatsapp}
                  emailSent={emailSent}
                  status="pending"
                />
              </div>
              {showAuthPrompt && !user && (
                <div className="bg-ocean-50 border border-ocean-200 rounded-xl px-4 py-4 mb-4 text-left">
                  <div className="flex items-start gap-3">
                    <UserPlus className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-inter font-semibold text-ocean-800 text-sm mb-1">Create account to save this booking</p>
                      <p className="font-inter text-xs text-ocean-600 mb-3">Access your vouchers anytime and track all your bookings.</p>
                      <button onClick={() => setAuthModalOpen(true)} className="font-inter text-sm font-semibold text-white bg-ocean-700 hover:bg-ocean-800 px-4 py-2 rounded-lg transition-colors">
                        Create Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-poppins font-semibold text-sm py-3 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <button onClick={() => { setStatus('idle'); onClose(); }} className="flex-1 bg-ocean-700 hover:bg-ocean-800 text-white font-poppins font-semibold text-sm py-3 rounded-xl transition-all">
                  OK
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.firstName} <span className="text-safari-500">*</span></label>
                  <input type="text" name="firstName" required value={form.firstName} onChange={handleChange} placeholder={t.booking.firstNamePlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50" />
                </div>
                <div>
                  <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.lastName} <span className="text-safari-500">*</span></label>
                  <input type="text" name="lastName" required value={form.lastName} onChange={handleChange} placeholder={t.booking.lastNamePlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.email} <span className="text-safari-500">*</span></label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder={t.booking.emailPlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50" />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.whatsapp}</label>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder={t.booking.whatsappPlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50" />
              </div>

              {/* Adults + Children */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.adults}</label>
                  <input type="number" name="adults" min="1" max="30" value={form.adults} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50" />
                </div>
                <div>
                  <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.children}</label>
                  <input type="number" name="children" min="0" max="10" value={form.children} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50" />
                </div>
              </div>

              {/* Dynamic child age dropdowns */}
              {childCount > 0 && (
                <div className={`rounded-2xl border p-4 space-y-3 transition-all ${kidsAgesError ? 'border-red-300 bg-red-50' : 'border-safari-200 bg-safari-50'}`}>
                  <p className="font-inter text-sm font-semibold text-gray-700">
                    {locale === 'it' ? 'Età dei bambini' : locale === 'fr' ? 'Âge des enfants' : 'Children ages'} <span className="text-safari-500">*</span>
                  </p>
                  <div className={`grid gap-3 ${childCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {kidsAges.map((age, i) => (
                      <div key={i}>
                        <label className="font-inter text-xs font-medium text-gray-600 block mb-1">
                          {childAgeLabel(i)}
                        </label>
                        <select
                          value={age === '' ? '' : String(age)}
                          onChange={e => handleKidsAgeChange(i, e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2.5 font-inter text-sm text-gray-800 outline-none focus:ring-2 transition-all bg-white cursor-pointer ${
                            kidsAgesError && age === ''
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                              : 'border-gray-200 focus:border-ocean-600 focus:ring-ocean-100'
                          }`}
                        >
                          <option value="">
                            {locale === 'it' ? '— Seleziona età —' : locale === 'fr' ? '— Sélectionner —' : '— Select age —'}
                          </option>
                          {Array.from({ length: 18 }, (_, n) => (
                            <option key={n} value={String(n)}>
                              {n} {locale === 'it' ? 'anni' : locale === 'fr' ? 'ans' : 'yrs'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  {kidsAgesError && (
                    <p className="font-inter text-xs text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {locale === 'it'
                        ? 'Seleziona l\'età di ogni bambino prima di procedere.'
                        : locale === 'fr'
                          ? 'Veuillez sélectionner l\'âge de chaque enfant.'
                          : 'Please select an age for each child before submitting.'}
                    </p>
                  )}
                </div>
              )}

              {/* Arrival date */}
              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.arrivalDate} <span className="text-safari-500">*</span></label>
                <input type="date" name="arrivalDate" required value={form.arrivalDate} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50 cursor-pointer" />
              </div>

              {/* Safari select */}
              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.safari} <span className="text-safari-500">*</span></label>
                <select name="safari" required value={form.safari} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50 cursor-pointer">
                  <option value="">{t.booking.safariPlaceholder}</option>
                  <optgroup label="Safaris">
                    {allSafariNames.map(s => <option key={s.name} value={s.name}>{s.name} — {s.days} {t.tours.days}</option>)}
                  </optgroup>
                  <optgroup label="Excursions">
                    {excursions.map(e => <option key={e.id} value={e.nameIt}>{e.nameIt}</option>)}
                  </optgroup>
                  <option value="Transfer aeroporto">Transfer aeroporto / Airport transfer</option>
                  <option value="Altro / Other">Altro / Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">{t.booking.message}</label>
                <textarea name="message" rows={3} value={form.message} onChange={handleChange} placeholder={t.booking.messagePlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 transition-all bg-gray-50 resize-none" />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="font-inter text-sm text-red-600">{t.booking.error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg()}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-poppins font-semibold text-sm py-3.5 rounded-xl transition-all hover:shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.booking.whatsappBtn}
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-safari-500 hover:bg-safari-600 disabled:opacity-60 text-white font-poppins font-semibold text-sm py-3.5 rounded-xl transition-all hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {locale === 'it' ? 'Invio...' : locale === 'fr' ? 'Envoi...' : 'Sending...'}
                    </span>
                  ) : t.booking.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
}
