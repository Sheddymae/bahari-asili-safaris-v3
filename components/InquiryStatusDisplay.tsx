'use client';

import { CheckCircle, Clock, AlertCircle, Mail, MessageCircle } from 'lucide-react';

interface InquiryStatusDisplayProps {
  bookingRef: string;
  firstName: string;
  email: string;
  whatsapp?: string;
  emailSent: boolean;
  status?: 'pending' | 'quotation_sent' | 'confirmed';
}

export default function InquiryStatusDisplay({
  bookingRef,
  firstName,
  email,
  whatsapp,
  emailSent,
  status = 'pending',
}: InquiryStatusDisplayProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      title: 'Inquiry Received',
      description: 'Your safari inquiry has been received and is being reviewed by our team.',
    },
    quotation_sent: {
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Quotation Sent',
      description: 'Your personalized quotation has been sent to your email. Please review it carefully.',
    },
    confirmed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      title: 'Booking Confirmed',
      description: 'Your safari booking is confirmed. Check your email for final details.',
    },
  };

  const current = statusConfig[status];
  const StatusIcon = current.icon;

  return (
    <div className={`${current.bgColor} rounded-2xl p-6 border border-gray-200`}>
      <div className="flex items-start gap-4">
        <div className={`${current.color} mt-1`}>
          <StatusIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-poppins font-bold text-lg text-gray-900 mb-2">
            {current.title}
          </h3>
          <p className="font-inter text-sm text-gray-600 mb-4">
            {current.description}
          </p>

          <div className="bg-white rounded-lg p-4 space-y-2 text-sm mb-4">
            <div>
              <span className="font-medium text-gray-700">Inquiry Reference:</span>
              <span className="ml-2 font-mono font-bold text-gray-900">{bookingRef}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Guest Name:</span>
              <span className="ml-2 text-gray-900">{firstName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{email}</span>
            </div>
          </div>

          {emailSent && (
            <div className="flex items-start gap-2 p-3 bg-green-100 rounded-lg mb-4">
              <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Confirmation email has been sent to <strong>{email}</strong>
              </p>
            </div>
          )}

          {!emailSent && (
            <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Confirmation email could not be sent. Please contact us directly.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <a
              href={`https://wa.me/${whatsapp || '254101923355'}?text=Hi%2C%20I%20have%20an%20inquiry%20about%20reference%20${bookingRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-inter text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
            <button
              onClick={() => window.location.href = `mailto:sheddymae02@gmail.com?subject=Re: Inquiry ${bookingRef}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-inter text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
