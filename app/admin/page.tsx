'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Anchor, LogOut, Search, Download, Bell, Loader2, X, Check, XCircle,
  Mail, Eye, Trash2, RefreshCw, TrendingUp, Calendar, Clock, CheckCircle2,
} from 'lucide-react';
import type { Booking } from '@/lib/supabase';

interface Stats {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  revenue: number;
  quotedRevenue: number;
  confirmedRevenue: number;
  outstandingBalance: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('unpaid');
  const [editTotalPrice, setEditTotalPrice] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [emailType, setEmailType] = useState('quote');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  useEffect(() => {
    if (selected) {
      setEditNotes(selected.admin_notes || '');
      setEditPaymentStatus(selected.payment_status || 'unpaid');
      setEditTotalPrice(selected.total_price != null ? String(selected.total_price) : '');
      setPaymentAmount('');
      setPaymentMethod(selected.payment_method || '');
      fetch(`/api/admin/reservations/${selected.id}/send-email`)
        .then((r) => r.json())
        .then((d) => setEmailLogs(d.success ? d.logs : []))
        .catch(() => setEmailLogs([]));
    }
  }, [selected]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (bookingType) params.set('booking_type', bookingType);
      if (dateRange) params.set('date_range', dateRange);

      const res = await fetch(`/api/admin/reservations?${params.toString()}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setReservations(data.reservations);
        setStats(data.stats);
      }
    } catch {
      showToast('Failed to load reservations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, bookingType, dateRange, router]);

  useEffect(() => {
    const t = setTimeout(loadReservations, 300);
    return () => clearTimeout(t);
  }, [loadReservations]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleAction(id: number, action: 'approve' | 'reject' | 'complete') {
    setActionLoading(`${action}-${id}`);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          action === 'approve'
            ? `Confirmed — confirmation email ${data.emailSent ? 'sent' : 'could not be sent'}.`
            : action === 'reject'
            ? 'Reservation cancelled.'
            : 'Marked as completed.'
        );
        loadReservations();
        setSelected(null);
      } else {
        showToast(data.error || 'Action failed.', 'error');
      }
    } catch {
      showToast('Action failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRecordPayment(id: number) {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a valid payment amount.', 'error');
      return;
    }
    setRecordingPayment(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'record_payment', amount, payment_method: paymentMethod || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment recorded.');
        setSelected(data.reservation);
        setPaymentAmount('');
        loadReservations();
      } else {
        showToast(data.error || 'Failed to record payment.', 'error');
      }
    } catch {
      showToast('Failed to record payment.', 'error');
    } finally {
      setRecordingPayment(false);
    }
  }

  async function handleSendEmail(id: number) {
    if (emailType === 'custom' && !emailMessage.trim()) {
      showToast('Write a message before sending.', 'error');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: emailType, subject: emailSubject || undefined, message: emailMessage || undefined }),
      });
      const data = await res.json();
      showToast(data.success ? 'Email sent.' : data.error || 'Failed to send email.', data.success ? 'success' : 'error');
      if (data.success) {
        setEmailMessage('');
        setEmailSubject('');
        fetch(`/api/admin/reservations/${id}/send-email`)
          .then((r) => r.json())
          .then((d) => setEmailLogs(d.success ? d.logs : []))
          .catch(() => {});
      }
    } catch {
      showToast('Failed to send email.', 'error');
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleSaveEdit(id: number) {
    setSavingEdit(true);
    try {
      const body: Record<string, any> = {
        admin_notes: editNotes,
        payment_status: editPaymentStatus,
      };
      if (editTotalPrice.trim() !== '') {
        const parsed = Number(editTotalPrice);
        if (!Number.isNaN(parsed)) body.total_price = parsed;
      }
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Reservation updated.');
        setSelected(data.reservation);
        loadReservations();
      } else {
        showToast(data.error || 'Failed to save changes.', 'error');
      }
    } catch {
      showToast('Failed to save changes.', 'error');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleGenerateDoc(id: number, action: 'generate_invoice' | 'generate_voucher') {
    setActionLoading(`${action}-${id}`);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === 'generate_invoice' ? 'Invoice generated.' : 'Voucher generated.');
        setSelected(data.reservation);
        loadReservations();
        if (data.url) window.open(data.url, '_blank');
      } else {
        showToast(data.error || 'Failed to generate document.', 'error');
      }
    } catch {
      showToast('Failed to generate document.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResend(id: number) {
    setActionLoading(`resend-${id}`);
    try {
      const res = await fetch(`/api/admin/reservations/${id}/resend`, { method: 'POST' });
      const data = await res.json();
      showToast(data.success ? 'Confirmation email resent.' : data.error || 'Failed to resend.', data.success ? 'success' : 'error');
    } catch {
      showToast('Failed to resend.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this reservation permanently? This cannot be undone.')) return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Reservation deleted.');
        loadReservations();
        setSelected(null);
      } else {
        showToast(data.error || 'Failed to delete.', 'error');
      }
    } catch {
      showToast('Failed to delete.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (bookingType) params.set('booking_type', bookingType);
    window.location.href = `/api/admin/export?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0e7490] flex items-center justify-center">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">Bahari Asili Safaris</h1>
              <p className="text-xs text-gray-500 leading-tight">Reservations Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              {stats && stats.pending > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#f97316] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.pending > 9 ? '9+' : stats.pending}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total" value={stats?.total ?? '—'} icon={TrendingUp} accent="bg-[#0e7490]" />
          <StatCard label="Today" value={stats?.today ?? '—'} icon={Calendar} accent="bg-cyan-500" />
          <StatCard label="Pending" value={stats?.pending ?? '—'} icon={Clock} accent="bg-amber-500" />
          <StatCard label="Confirmed" value={stats?.confirmed ?? '—'} icon={CheckCircle2} accent="bg-green-500" />
          <StatCard label="Cancelled" value={stats?.cancelled ?? '—'} icon={XCircle} accent="bg-red-500" />
          <StatCard
            label="Paid Revenue"
            value={stats ? `KES ${stats.revenue.toLocaleString()}` : '—'}
            icon={TrendingUp}
            accent="bg-[#f97316]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Quoted Revenue"
            value={stats ? `KES ${stats.quotedRevenue.toLocaleString()}` : '—'}
            icon={TrendingUp}
            accent="bg-purple-400"
          />
          <StatCard
            label="Confirmed Revenue"
            value={stats ? `KES ${stats.confirmedRevenue.toLocaleString()}` : '—'}
            icon={TrendingUp}
            accent="bg-emerald-500"
          />
          <StatCard
            label="Outstanding Balance"
            value={stats ? `KES ${stats.outstandingBalance.toLocaleString()}` : '—'}
            icon={Clock}
            accent="bg-rose-500"
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, reservation #..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={bookingType}
            onChange={(e) => setBookingType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
          >
            <option value="">All Types</option>
            <option value="safari">Safari</option>
            <option value="excursion">Excursion</option>
            <option value="hotel">Hotel</option>
            <option value="transfer">Transfer</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
          >
            <option value="">Any Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={loadReservations}
            className="flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Reservation #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Travel Date</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!loading && reservations.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">No reservations found.</td>
                  </tr>
                )}
                {!loading &&
                  reservations.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-[#0e7490]">{r.booking_ref}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-gray-500">{r.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.safari_name}</td>
                      <td className="px-4 py-3 text-gray-700">{new Date(r.arrival_date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 text-gray-700">{r.adults}A {r.children > 0 ? `+ ${r.children}C` : ''}</td>
                      <td className="px-4 py-3 text-gray-700">{r.total_price ? `KES ${Number(r.total_price).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.reservation_status || 'pending']}`}>
                          {(r.reservation_status || 'pending').charAt(0).toUpperCase() + (r.reservation_status || 'pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{r.payment_status || 'unpaid'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setSelected(r)} title="View" className="p-1.5 rounded-md hover:bg-gray-100">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {r.reservation_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(r.id!, 'approve')}
                                disabled={actionLoading === `approve-${r.id}`}
                                title="Approve"
                                className="p-1.5 rounded-md hover:bg-green-50"
                              >
                                {actionLoading === `approve-${r.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </button>
                              <button
                                onClick={() => handleAction(r.id!, 'reject')}
                                disabled={actionLoading === `reject-${r.id}`}
                                title="Reject"
                                className="p-1.5 rounded-md hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleResend(r.id!)}
                            disabled={actionLoading === `resend-${r.id}`}
                            title="Resend Confirmation"
                            className="p-1.5 rounded-md hover:bg-blue-50"
                          >
                            <Mail className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id!)}
                            disabled={actionLoading === `delete-${r.id}`}
                            title="Delete"
                            className="p-1.5 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-30 flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Reservation</p>
                <p className="font-bold text-[#0e7490]">{selected.booking_ref}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[selected.reservation_status || 'pending']}`}>
                {(selected.reservation_status || 'pending').toUpperCase()}
              </div>
              {[
                ['Customer', `${selected.first_name} ${selected.last_name}`],
                ['Email', selected.email],
                ['WhatsApp', selected.whatsapp || '—'],
                ['Nationality', selected.nationality || '—'],
                ['Tour', selected.safari_name],
                ['Travel Date', new Date(selected.arrival_date).toLocaleDateString('en-GB')],
                ['Adults / Children', `${selected.adults} / ${selected.children}`],
                ['Hotel', selected.hotel_name || '—'],
                ['Pickup Location', selected.pickup_location || '—'],
                ['Amount', selected.total_price ? `KES ${Number(selected.total_price).toLocaleString()}` : '—'],
                ['Payment Status', selected.payment_status || 'unpaid'],
                ['Special Requests', selected.message || '—'],
                ['Booking Date', selected.created_at ? new Date(selected.created_at).toLocaleString('en-GB') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900 text-right">{value}</span>
                </div>
              ))}

              {/* Editable fields */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edit</p>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Total Price (KES)</label>
                  <input
                    type="number"
                    value={editTotalPrice}
                    onChange={(e) => setEditTotalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
                    placeholder="e.g. 45000"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Admin Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490] resize-none"
                    placeholder="Internal notes..."
                  />
                </div>
                <button
                  onClick={() => handleSaveEdit(selected.id!)}
                  disabled={savingEdit}
                  className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-60"
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              {/* Invoice & Payments */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice & Payments</p>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Invoice #</span>
                  <span className="font-semibold">{selected.invoice_number || '— not generated yet —'}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Invoice Status</span>
                  <span className="font-semibold capitalize">{(selected.invoice_status || 'draft').replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Paid / Total</span>
                  <span className="font-semibold">
                    KES {(selected.amount_paid || 0).toLocaleString()} / {selected.total_price ? `KES ${Number(selected.total_price).toLocaleString()}` : '—'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Amount received"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
                  />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#0e7490]"
                  >
                    <option value="">Method</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <button
                  onClick={() => handleRecordPayment(selected.id!)}
                  disabled={recordingPayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-60"
                >
                  {recordingPayment ? 'Recording…' : 'Record Payment'}
                </button>
              </div>

              {/* Send Email */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Send Email</p>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
                >
                  <option value="quote">Quote</option>
                  <option value="confirmation">Confirmation (+ invoice/voucher)</option>
                  <option value="payment_reminder">Payment Reminder</option>
                  <option value="pre_departure_reminder">Pre-Departure Reminder</option>
                  <option value="review_request">Review Request</option>
                  <option value="custom">Custom Message</option>
                </select>
                {emailType === 'custom' && (
                  <>
                    <input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject (optional)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490]"
                    />
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={3}
                      placeholder="Write your message..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0e7490] resize-none"
                    />
                  </>
                )}
                <button
                  onClick={() => handleSendEmail(selected.id!)}
                  disabled={sendingEmail}
                  className="w-full bg-[#0e7490] hover:bg-[#0c5f77] text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-60"
                >
                  {sendingEmail ? 'Sending…' : 'Send'}
                </button>
                {emailLogs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Send History</p>
                    {emailLogs.slice(0, 5).map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{log.email_type.replace('_', ' ')}</span>
                        <span className={log.success ? 'text-green-600' : 'text-red-500'}>
                          {log.success ? '✓' : '✗'} {new Date(log.sent_at).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateDoc(selected.id!, 'generate_invoice')}
                    disabled={actionLoading === `generate_invoice-${selected.id}`}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-lg transition"
                  >
                    {selected.invoice_url ? 'Regenerate Invoice' : 'Generate Invoice'}
                  </button>
                  <button
                    onClick={() => handleGenerateDoc(selected.id!, 'generate_voucher')}
                    disabled={actionLoading === `generate_voucher-${selected.id}`}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-lg transition"
                  >
                    {selected.voucher_url ? 'Regenerate Voucher' : 'Generate Voucher'}
                  </button>
                </div>
                <div className="flex gap-2">
                  {selected.invoice_url && (
                    <a
                      href={selected.invoice_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center border border-[#0e7490]/30 text-[#0e7490] hover:bg-[#0e7490]/5 text-xs font-semibold py-2 rounded-lg transition"
                    >
                      Download Invoice
                    </a>
                  )}
                  {selected.voucher_url && (
                    <a
                      href={selected.voucher_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center border border-[#0e7490]/30 text-[#0e7490] hover:bg-[#0e7490]/5 text-xs font-semibold py-2 rounded-lg transition"
                    >
                      Download Voucher
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.reservation_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(selected.id!, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(selected.id!, 'reject')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selected.reservation_status === 'confirmed' && (
                  <button
                    onClick={() => handleAction(selected.id!, 'complete')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition"
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  onClick={() => handleResend(selected.id!)}
                  className="flex-1 bg-[#0e7490] hover:bg-[#0c5f77] text-white text-sm font-semibold py-2 rounded-lg transition"
                >
                  Resend Confirmation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-40 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
