'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, Clock, MapPin, Building2, Backpack, Sun, Sunset, MoonStar,
  Check, X, ClipboardList, ArrowLeft, Activity, Sofa,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { type Safari, DEFAULT_INCLUDED, DEFAULT_EXCLUDED } from '@/lib/tours-data';

function LevelScale({ level, label, icon: Icon }: { level: number; label: string; icon: any }) {
  return (
    <div className="flex-1 min-w-[160px]">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-4 h-4 text-ocean-700" />
        <span className="font-inter text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full ${n <= level ? 'bg-safari-500' : 'bg-gray-200'}`}
          />
        ))}
        <span className="font-poppins font-bold text-sm text-gray-800 ml-1">{level}/5</span>
      </div>
    </div>
  );
}

export default function SafariDetailClient({ safari }: { safari: Safari }) {
  const { t } = useLanguage();
  const tt = t.tours;
  const [tab, setTab] = useState<'itinerary' | 'packing' | 'included'>('itinerary');

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* Hero */}
        <div className="relative h-[45vh] min-h-[320px]">
          <Image src={safari.image} alt={safari.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10">
              <Link
                href="/#tours"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-inter mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to all safaris
              </Link>
              <div className="flex items-center gap-3 mb-2">
                {safari.popular && (
                  <span className="bg-safari-500 rounded-full px-3 py-1 font-inter font-bold text-[10px] tracking-wide uppercase text-white">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-inter font-semibold text-xs text-gray-800">{safari.rating} ({safari.reviewCount})</span>
                </div>
              </div>
              <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                {safari.name}
              </h1>
              <p className="font-inter text-white/85 text-base mt-2 max-w-2xl">{safari.tagline}</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Quick facts */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 bg-sand-50 rounded-full px-4 py-2">
              <Clock className="w-4 h-4 text-ocean-700" />
              <span className="font-inter text-sm text-ocean-700 font-semibold">{safari.days} {tt.days} / {safari.nights} {tt.nights}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-safari-500" />
              <div className="flex flex-wrap gap-1.5">
                {safari.parks.map((park, i) => (
                  <span key={i} className="bg-ocean-50 text-ocean-700 font-inter text-xs px-2.5 py-1 rounded-full border border-ocean-100">{park}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty / comfort ratings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-8 flex flex-wrap gap-6">
            <LevelScale level={safari.activityLevel ?? 3} label="Activity Level" icon={Activity} />
            <LevelScale level={safari.comfortLevel ?? 4} label="Comfort Level" icon={Sofa} />
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mb-8">
            {safari.highlights.map((h, i) => (
              <span key={i} className="bg-sand-50 text-gray-700 font-inter text-sm px-3 py-1.5 rounded-full">{h}</span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {[
              { key: 'itinerary' as const, label: tt.itinerary, icon: MoonStar },
              { key: 'packing' as const, label: tt.packing, icon: Backpack },
              { key: 'included' as const, label: tt.included, icon: ClipboardList },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 font-inter text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === key ? 'border-safari-500 text-safari-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'itinerary' && (
            <div className="space-y-4">
              {safari.itinerary.map((day, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-ocean-700 px-5 py-3">
                    <span className="font-poppins font-bold text-white text-sm">{day.day}</span>
                    <span className="font-inter text-white/80 text-sm ml-2">— {day.title}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <Sun className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div><div className="font-inter text-xs font-semibold text-gray-500 mb-0.5">{tt.morning}</div><p className="font-inter text-sm text-gray-600 leading-relaxed">{day.morning}</p></div>
                    </div>
                    <div className="flex gap-3">
                      <Sunset className="w-4 h-4 text-safari-400 flex-shrink-0 mt-0.5" />
                      <div><div className="font-inter text-xs font-semibold text-gray-500 mb-0.5">{tt.afternoon}</div><p className="font-inter text-sm text-gray-600 leading-relaxed">{day.afternoon}</p></div>
                    </div>
                    <div className="flex gap-3">
                      <MoonStar className="w-4 h-4 text-ocean-400 flex-shrink-0 mt-0.5" />
                      <div><div className="font-inter text-xs font-semibold text-gray-500 mb-0.5">{tt.overnight}</div><p className="font-inter text-sm text-gray-600">{day.overnight}</p></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-sand-50 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2"><Building2 className="w-4 h-4 text-ocean-700" /><span className="font-inter text-xs font-semibold text-gray-600 uppercase tracking-wide">{tt.lodges}</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {safari.lodges.map((lodge, i) => <span key={i} className="bg-white text-gray-700 font-inter text-xs px-2.5 py-1 rounded-lg border border-gray-200">{lodge}</span>)}
                </div>
              </div>
            </div>
          )}

          {tab === 'packing' && (
            <div className="bg-sand-50 rounded-xl p-5">
              <ul className="space-y-2.5">
                {safari.packingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold ${tip.includes('NO DRONE') ? 'bg-red-100 text-red-600' : 'bg-safari-100 text-safari-700'}`}>{tip.includes('NO DRONE') ? '✗' : '✓'}</span>
                    <span className={`font-inter text-sm leading-relaxed ${tip.includes('NO DRONE') ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'included' && (
            <div className="grid sm:grid-cols-2 gap-5 bg-sand-50 rounded-xl p-5">
              <div>
                <p className="font-inter text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">{tt.includedTitle}</p>
                <ul className="space-y-2">
                  {(safari.included || DEFAULT_INCLUDED).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-inter text-sm text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-inter text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">{tt.excludedTitle}</p>
                <ul className="space-y-2">
                  {(safari.excluded || DEFAULT_EXCLUDED).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="font-inter text-sm text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sticky-ish CTA */}
          <div className="mt-10 bg-ocean-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-poppins font-bold text-white text-lg">Ready for {safari.name}?</p>
              <p className="font-inter text-white/70 text-sm mt-1">{tt.noPricesNote}</p>
            </div>
            <Link
              href={`/?book=${safari.id}`}
              className="flex-shrink-0 bg-safari-500 hover:bg-safari-600 text-white font-poppins font-semibold text-sm px-8 py-3.5 rounded-xl transition-all hover:shadow-md whitespace-nowrap"
            >
              {tt.bookNow}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
