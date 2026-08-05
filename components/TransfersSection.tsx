'use client';

import { Plane, Car, Clock4, Ticket, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const serviceIcons = [User, Car, Clock4, Ticket];

export default function TransfersSection({ onBook }: { onBook: () => void }) {
  const { t } = useLanguage();

  return (
    <section id="transfers" className="py-20 lg:py-28 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="font-inter text-safari-500 font-semibold text-sm tracking-widest uppercase block mb-2">
            {t.transfers.label}
          </span>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3">
            {t.transfers.title}{' '}
            <span className="text-safari-500">{t.transfers.titleHighlight}</span>
          </h2>
          <p className="font-inter text-gray-500 text-base max-w-xl mx-auto">
            {t.transfers.subtitle}
          </p>
        </div>

        {/* Airport cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {t.transfers.airports.map((airport, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 flex flex-col items-center text-center shadow-card border transition-all hover:shadow-card-hover hover:-translate-y-1 ${
                i === 0 ? 'bg-ocean-700 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                i === 0 ? 'bg-white/20' : 'bg-sand-100'
              }`}>
                <Plane className={`w-6 h-6 ${i === 0 ? 'text-white' : 'text-ocean-700'}`} />
              </div>
              <div className={`font-poppins font-black text-3xl mb-1 ${i === 0 ? 'text-white' : 'text-ocean-700'}`}>
                {airport.code}
              </div>
              <div className={`font-poppins font-semibold text-base mb-2 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>
                {airport.name}
              </div>
              <p className={`font-inter text-sm leading-relaxed ${i === 0 ? 'text-white/80' : 'text-gray-500'}`}>
                {airport.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {t.transfers.services.map((svc, i) => {
            const Icon = serviceIcons[i];
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-card border border-gray-50 hover:shadow-card-hover transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 bg-safari-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-safari-500" />
                </div>
                <h3 className="font-poppins font-semibold text-gray-900 text-base mb-2">{svc.title}</h3>
                <p className="font-inter text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onBook}
            className="inline-flex items-center gap-2 bg-safari-500 hover:bg-safari-600 text-white font-poppins font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-base"
          >
            {t.transfers.cta}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
