'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, BookOpen, Download, Settings, LogOut, Phone, Mail,
  Calendar, Users, CheckCircle, Clock, FileText, MessageCircle,
  ChevronRight, Anchor, Shield, Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Booking } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

const WHATSAPP_NUMBER = '254101923355';

type Tab = 'bookings' | 'vouchers' | 'settings' | 'profile';

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === 'confirmed';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-inter font-semibold ${
      isConfirmed
        ? 'bg-green-100 text-green-700'
        : 'bg-amber-100 text-amber-700'
    }`}>
      {isConfirmed ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {isConfirmed ? 'Confirmed' : 'Pending'}
    </span>
  );
}

async function downloadVoucherForBooking(booking: Booking) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;

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
  doc.text(booking.booking_ref, 14, 61);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Status: ' + (booking.reservation_status === 'confirmed' ? 'CONFIRMED' : 'PENDING'), W - 14, 61, { align: 'right' });

  let y = 78;

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

  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 5, W - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(14, 116, 144);
  doc.text('CLIENT DETAILS', 16, y);
  y += 8;

  row('Full Name', `${booking.first_name} ${booking.last_name}`);
  row('Email', booking.email);
  row('WhatsApp', booking.whatsapp || '—');
  row('Adults', String(booking.adults));
  const childrenVal = booking.children > 0 && booking.kids_ages && booking.kids_ages.length > 0
    ? `${booking.children}  (Età / Ages: ${booking.kids_ages.join(', ')} anni)`
    : String(booking.children);
  row('Bambini / Children', childrenVal);
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 5, W - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(14, 116, 144);
  doc.text('TRAVEL DETAILS', 16, y);
  y += 8;

  row('Safari / Tour', booking.safari_name);
  row('Arrival Date', booking.arrival_date);
  if (booking.message) row('Special Requests', booking.message);

  doc.setFillColor(17, 24, 39);
  doc.rect(0, 275, W, 22, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('WhatsApp: +254 101 923 355  ·  Email: sheddymae02@gmail.com  ·  Watamu, Kenya', W / 2, 284, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('© 2026 Bahari Asili Safaris. Founded by Shadrack Safari. Designed by Sheddy Mae.', W / 2, 292, { align: 'center' });

  doc.save(`${booking.booking_ref}.pdf`);
}

export default function AccountPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', whatsapp: '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ newPassword: '', confirmPassword: '' });
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      setAuthOpen(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setProfileForm({
        fullName: meta.full_name || '',
        whatsapp: meta.whatsapp || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'bookings') {
      fetchBookings();
    }
  }, [user, activeTab]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setBookings(data as Booking[]);
    setBookingsLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    await supabase.auth.updateUser({
      data: {
        full_name: profileForm.fullName,
        whatsapp: profileForm.whatsapp,
      },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleChangePassword = async () => {
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsMsg('Passwords do not match.');
      return;
    }
    if (settingsForm.newPassword.length < 6) {
      setSettingsMsg('Password must be at least 6 characters.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: settingsForm.newPassword });
    if (error) setSettingsMsg(error.message);
    else {
      setSettingsMsg('Password updated successfully!');
      setSettingsForm({ newPassword: '', confirmPassword: '' });
    }
  };

  const buildWhatsAppMsg = (booking: Booking) => {
    const msg = [
      '*Bahari Asili Safaris — Booking Inquiry*',
      `Ref: ${booking.booking_ref}`,
      `Name: ${booking.first_name} ${booking.last_name}`,
      `Safari: ${booking.safari_name}`,
      `Date: ${booking.arrival_date}`,
    ].join('\n');
    return encodeURIComponent(msg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-inter text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-ocean-600" />
          </div>
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-2">Sign in to continue</h2>
          <p className="font-inter text-gray-500 text-sm mb-6">Access your bookings, vouchers and account settings.</p>
          <button
            onClick={() => setAuthOpen(true)}
            className="bg-ocean-700 hover:bg-ocean-800 text-white font-poppins font-semibold px-8 py-3 rounded-xl transition-all"
          >
            Sign In / Sign Up
          </button>
          <a href="/" className="block mt-4 font-inter text-sm text-gray-400 hover:text-gray-600">
            Back to homepage
          </a>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signin" />
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Traveler';
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'bookings', label: 'My Bookings', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'vouchers', label: 'My Vouchers', icon: <FileText className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-safari-500 rounded-full flex items-center justify-center">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <span className="font-poppins font-bold text-ocean-700 text-base">Bahari Asili</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="font-inter text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button
              onClick={async () => { await signOut(); router.push('/'); }}
              className="flex items-center gap-1.5 font-inter text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-ocean-700 to-ocean-900 rounded-3xl p-6 sm:p-8 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-poppins font-bold text-2xl sm:text-3xl">
                Welcome back, {displayName}
              </h1>
              <p className="font-inter text-white/70 text-sm mt-1">{user.email}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-inter">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
                </div>
                <a href="/" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="font-inter">Back to homepage</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-ocean-700 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-medium text-sm bg-white text-red-500 hover:bg-red-50 border border-gray-200 transition-all whitespace-nowrap ml-auto"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins font-bold text-gray-900 text-xl">My Bookings</h2>
              <a href="/" className="font-inter text-sm text-ocean-700 font-medium hover:text-ocean-800">
                + New booking
              </a>
            </div>

            {bookingsLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-8 h-8 border-3 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-inter text-gray-400 text-sm">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="font-poppins font-semibold text-gray-700 text-lg mb-2">No bookings yet</h3>
                <p className="font-inter text-gray-400 text-sm mb-4">Your bookings will appear here after you book a safari or excursion.</p>
                <a href="/" className="inline-flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-poppins font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                  Explore Safaris
                </a>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-3.5 text-left font-inter font-semibold text-xs text-gray-500 uppercase tracking-wide">Ref</th>
                        <th className="px-5 py-3.5 text-left font-inter font-semibold text-xs text-gray-500 uppercase tracking-wide">Safari / Tour</th>
                        <th className="px-5 py-3.5 text-left font-inter font-semibold text-xs text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="px-5 py-3.5 text-left font-inter font-semibold text-xs text-gray-500 uppercase tracking-wide">Guests</th>
                        <th className="px-5 py-3.5 text-left font-inter font-semibold text-xs text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3.5 text-left font-inter font-semibold text-xs text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-poppins font-bold text-safari-600 text-sm">{b.booking_ref}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-inter font-medium text-gray-800 text-sm truncate max-w-[180px]">{b.safari_name}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-inter">{b.arrival_date}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-inter">
                                {b.adults}A
                                {b.children > 0 && (
                                  <> {b.children}C{b.kids_ages && b.kids_ages.length > 0 ? ` (${b.kids_ages.join(', ')} yrs)` : ''}</>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={b.reservation_status || 'pending'} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => downloadVoucherForBooking(b)}
                                className="flex items-center gap-1.5 text-ocean-700 hover:text-ocean-900 text-xs font-inter font-semibold bg-ocean-50 hover:bg-ocean-100 px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Voucher
                              </button>
                              <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg(b)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-green-700 hover:text-green-900 text-xs font-inter font-semibold bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="font-poppins font-bold text-safari-600 text-sm">{b.booking_ref}</span>
                          <p className="font-inter font-medium text-gray-800 text-sm mt-0.5">{b.safari_name}</p>
                        </div>
                        <StatusBadge status={b.reservation_status || 'pending'} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.arrival_date}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {b.adults} adults
                          {b.children > 0 && (
                            <>, {b.children} children{b.kids_ages && b.kids_ages.length > 0 ? ` (${b.kids_ages.join(', ')} yrs)` : ''}</>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadVoucherForBooking(b)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-ocean-700 text-xs font-semibold bg-ocean-50 px-3 py-2 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Voucher
                        </button>
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg(b)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 text-green-700 text-xs font-semibold bg-green-50 px-3 py-2 rounded-lg"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="space-y-4">
            <h2 className="font-poppins font-bold text-gray-900 text-xl">My Vouchers</h2>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="font-poppins font-semibold text-gray-700 text-lg mb-2">No vouchers yet</h3>
                <p className="font-inter text-gray-400 text-sm">Your booking vouchers will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-ocean-700 to-ocean-900 px-4 py-5 text-white">
                      <p className="font-inter text-xs text-white/60 mb-1">Booking Reference</p>
                      <p className="font-poppins font-black text-xl text-safari-300">{b.booking_ref}</p>
                    </div>
                    <div className="px-4 py-4">
                      <p className="font-inter font-semibold text-gray-800 text-sm mb-1 truncate">{b.safari_name}</p>
                      <p className="font-inter text-gray-400 text-xs flex items-center gap-1.5 mb-3">
                        <Calendar className="w-3 h-3" />
                        {b.arrival_date}
                      </p>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={b.reservation_status || 'pending'} />
                        <button
                          onClick={() => downloadVoucherForBooking(b)}
                          className="flex items-center gap-1.5 text-ocean-700 hover:text-ocean-900 text-xs font-semibold font-inter transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-lg space-y-6">
            <h2 className="font-poppins font-bold text-gray-900 text-xl">Profile</h2>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-inter text-sm text-gray-400 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <p className="font-inter text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>

              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.whatsapp}
                    onChange={e => setProfileForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+254101923355"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 bg-gray-50"
                  />
                </div>
              </div>

              {profileSaved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="font-inter text-sm text-green-700">Profile saved successfully.</p>
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                className="w-full bg-ocean-700 hover:bg-ocean-800 text-white font-poppins font-semibold py-3 rounded-xl transition-all"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-lg space-y-6">
            <h2 className="font-poppins font-bold text-gray-900 text-xl">Settings</h2>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-poppins font-semibold text-gray-800">Change Password</h3>

              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">New Password</label>
                <input
                  type="password"
                  value={settingsForm.newPassword}
                  onChange={e => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 bg-gray-50"
                />
              </div>

              <div>
                <label className="font-inter text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={settingsForm.confirmPassword}
                  onChange={e => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm text-gray-800 outline-none focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 bg-gray-50"
                />
              </div>

              {settingsMsg && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
                  settingsMsg.includes('success') ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                }`}>
                  {settingsMsg.includes('success')
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <Eye className="w-4 h-4 text-red-500" />
                  }
                  <p className={`font-inter text-sm ${settingsMsg.includes('success') ? 'text-green-700' : 'text-red-600'}`}>{settingsMsg}</p>
                </div>
              )}

              <button
                onClick={handleChangePassword}
                className="w-full bg-ocean-700 hover:bg-ocean-800 text-white font-poppins font-semibold py-3 rounded-xl transition-all"
              >
                Update Password
              </button>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
              <h3 className="font-poppins font-semibold text-red-800 mb-2">Sign Out</h3>
              <p className="font-inter text-sm text-red-600 mb-4">You will be signed out on this device.</p>
              <button
                onClick={async () => { await signOut(); router.push('/'); }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-poppins font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
