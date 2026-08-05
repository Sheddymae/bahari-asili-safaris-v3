'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ChevronDown, ChevronUp, MapPin, Building2, Backpack, Sun, Sunset, MoonStar, Check, X, ClipboardList } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { safaris, type Safari, type SafariTab, DEFAULT_INCLUDED, DEFAULT_EXCLUDED } from '@/lib/tours-data';
import { prefersReducedMotion } from '@/lib/video-config';

gsap.registerPlugin(ScrollTrigger);

type TabKey = SafariTab | 'multiday';

const TAB_CONFIG: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'tsavo',       label: 'Tsavo',       emoji: '🐘' },
  { key: 'amboseli',    label: 'Amboseli',     emoji: '🏔️' },
  { key: 'mara',        label: 'Masai Mara',   emoji: '🦁' },
  { key: 'taita',       label: 'Taita Hills',  emoji: '🦅' },
  { key: 'multiday',    label: 'Multi-day',    emoji: '🗺️' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
      <span className="font-inter text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

function SafariCard({ safari, onBook, t }: { safari: Safari; onBook: (name: string) => void; t: any }) {
  const [tab, setTab] = useState<'itinerary' | 'packing' | 'included' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const toggleTab = (v: 'itinerary' | 'packing' | 'included') => setTab(p => p === v ? null : v);

  // Animate card on scroll
  useEffect(() => {
    if (prefersReducedMotion() || !cardRef.current) return;
    
    gsap.fromTo(
      cardRef.current,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          markers: false,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={cardRef} className="tour-card bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-gray-50 flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-52">
        <Image src={safari.image} alt={safari.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="font-inter font-semibold text-xs text-gray-800">{safari.rating}</span>
        </div>
        {safari.popular && (
          <div className="absolute top-3 left-3 bg-safari-500 rounded-full px-3 py-1 shadow-sm">
            <span className="font-inter font-bold text-[10px] tracking-wide uppercase text-white">Popular</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <h3 className="font-poppins font-bold text-white text-lg leading-tight">{safari.name}</h3>
          <p className="font-inter text-white/80 text-xs mt-0.5">{safari.tagline}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 bg-sand-50 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-ocean-700" />
            <span className="font-inter text-xs text-ocean-700 font-semibold">{safari.days} {t.days} / {safari.nights} {t.nights}</span>
          </div>
          <StarRating rating={safari.rating} />
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-safari-500" />
            <span className="font-inter text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.parks}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {safari.parks.map((park, i) => (
              <span key={i} className="bg-ocean-50 text-ocean-700 font-inter text-xs px-2.5 py-0.5 rounded-full border border-ocean-100">{park}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {safari.highlights.slice(0, 3).map((h, i) => (
            <span key={i} className="bg-sand-50 text-gray-600 font-inter text-xs px-2 py-0.5 rounded-full">{h}</span>
          ))}
        </div>

        <Link
          href={`/safaris/${safari.id}`}
          className="font-inter text-xs font-semibold text-ocean-700 hover:text-ocean-800 mb-3 inline-flex items-center gap-1"
        >
          View full itinerary & details →
        </Link>

        <div className="space-y-2 mb-4">
          <button onClick={() => toggleTab('itinerary')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors">
            <span className="font-inter text-sm font-semibold text-gray-700">{t.itinerary}</span>
            {tab === 'itinerary' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {tab === 'itinerary' && (
            <div className="space-y-3 px-1 max-h-64 overflow-y-auto">
              {safari.itinerary.map((day, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-ocean-700 px-4 py-2">
                    <span className="font-poppins font-bold text-white text-sm">{day.day}</span>
                    <span className="font-inter text-white/80 text-xs ml-2">— {day.title}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex gap-2"><Sun className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /><div><div className="font-inter text-xs font-semibold text-gray-500 mb-0.5">{t.morning}</div><p className="font-inter text-xs text-gray-600 leading-relaxed">{day.morning}</p></div></div>
                    <div className="flex gap-2"><Sunset className="w-4 h-4 text-safari-400 flex-shrink-0 mt-0.5" /><div><div className="font-inter text-xs font-semibold text-gray-500 mb-0.5">{t.afternoon}</div><p className="font-inter text-xs text-gray-600 leading-relaxed">{day.afternoon}</p></div></div>
                    <div className="flex gap-2"><MoonStar className="w-4 h-4 text-ocean-400 flex-shrink-0 mt-0.5" /><div><div className="font-inter text-xs font-semibold text-gray-500 mb-0.5">{t.overnight}</div><p className="font-inter text-xs text-gray-600">{day.overnight}</p></div></div>
                  </div>
                </div>
              ))}
              <div className="bg-sand-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2"><Building2 className="w-3.5 h-3.5 text-ocean-700" /><span className="font-inter text-xs font-semibold text-gray-600 uppercase tracking-wide">{t.lodges}</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {safari.lodges.map((lodge, i) => <span key={i} className="bg-white text-gray-700 font-inter text-xs px-2.5 py-1 rounded-lg border border-gray-200">{lodge}</span>)}
                </div>
              </div>
            </div>
          )}

          <button onClick={() => toggleTab('packing')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors">
            <span className="font-inter text-sm font-semibold text-gray-700"><Backpack className="w-4 h-4 inline mr-1.5 text-safari-500" />{t.packing}</span>
            {tab === 'packing' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {tab === 'packing' && (
            <div className="bg-sand-50 rounded-xl p-3">
              <ul className="space-y-1.5">
                {safari.packingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold ${tip.includes('NO DRONE') ? 'bg-red-100 text-red-600' : 'bg-safari-100 text-safari-700'}`}>{tip.includes('NO DRONE') ? '✗' : '✓'}</span>
                    <span className={`font-inter text-xs leading-relaxed ${tip.includes('NO DRONE') ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => toggleTab('included')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors">
            <span className="font-inter text-sm font-semibold text-gray-700"><ClipboardList className="w-4 h-4 inline mr-1.5 text-safari-500" />{t.included}</span>
            {tab === 'included' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          {tab === 'included' && (
            <div className="grid grid-cols-2 gap-3 bg-sand-50 rounded-xl p-3">
              <div>
                <p className="font-inter text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">{t.includedTitle}</p>
                <ul className="space-y-1.5">
                  {(safari.included || DEFAULT_INCLUDED).map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-inter text-xs text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-inter text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">{t.excludedTitle}</p>
                <ul className="space-y-1.5">
                  {(safari.excluded || DEFAULT_EXCLUDED).map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="font-inter text-xs text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <p className="font-inter text-xs text-gray-400 italic mb-4 text-center">{t.noPricesNote}</p>
        <button onClick={() => onBook(safari.name)} className="mt-auto w-full bg-safari-500 hover:bg-safari-600 text-white font-poppins font-semibold text-sm py-3 rounded-xl transition-all hover:shadow-md">
          {t.bookNow}
        </button>
      </div>
    </div>
  );
}

export default function ToursSection({ onBook }: { onBook: (tourName?: string) => void }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('tsavo');

  const isRegionTab = (tab: TabKey): tab is SafariTab => ['tsavo', 'amboseli', 'mara', 'taita'].includes(tab);

  // Regional tabs show short/medium safaris for that park; long multi-park itineraries
  // get their own "Multi-day" tab instead of being duplicated across every region they touch.
  const currentSafaris = (
    activeTab === 'multiday'
      ? safaris.filter(s => s.category === 'long')
      : isRegionTab(activeTab)
      ? safaris.filter(s => s.tabs.includes(activeTab) && s.category !== 'long')
      : []
  ).slice().sort((a, b) => a.days - b.days);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Animate heading
  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current) return;

    const heading = sectionRef.current.querySelector('h2');
    if (heading) {
      gsap.fromTo(
        heading,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            markers: false,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="tours" className="py-24 lg:py-32 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-inter text-safari-500 font-semibold text-xs tracking-widest uppercase block mb-4">{t.tours?.label || 'Our Experiences'}</span>
          <h2 className="font-poppins font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight text-balance">
            Explore Safari{' '}<span className="text-safari-500 relative">
              Packages
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-safari-300/40 -z-10" />
            </span>
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 font-inter font-semibold text-sm px-5 py-2.5 rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.key
                  ? 'bg-ocean-700 text-white border-ocean-700 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ocean-600 hover:text-ocean-700'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {isRegionTab(activeTab) && (
          <Link
            href={`/destinations/${activeTab}`}
            className="inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-ocean-700 hover:text-ocean-800 mb-8"
          >
            <MapPin className="w-4 h-4" /> Explore the {TAB_CONFIG.find(t => t.key === activeTab)?.label} destination guide →
          </Link>
        )}

        {/* Safari cards */}
        {currentSafaris.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSafaris.map(safari => (
              <SafariCard key={safari.id} safari={safari} onBook={onBook} t={t.tours} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-inter text-gray-400">No safaris in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
