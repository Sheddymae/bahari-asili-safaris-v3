'use client';

import { useRef, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefersReducedMotion } from '@/lib/video-config';

gsap.registerPlugin(ScrollTrigger);

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// Approximate, widely-cited seasonal windows for East African wildlife/nature
// sightings — general guidance, not a guarantee (sightings vary year to year).
interface CalendarRow {
  emoji: string;
  name: string;
  location: string;
  // 1-indexed months (1=Jan ... 12=Dec) that are peak/best viewing
  bestMonths: number[];
  note: string;
}

const CALENDAR_ROWS: CalendarRow[] = [
  {
    emoji: '🦌',
    name: 'Wildebeest Migration',
    location: 'Masai Mara',
    bestMonths: [7, 8, 9, 10],
    note: 'River crossings peak Jul–Oct',
  },
  {
    emoji: '🐘',
    name: 'Elephant Herds',
    location: 'Tsavo',
    bestMonths: [6, 7, 8, 9, 10],
    note: 'Dry season draws herds to waterholes',
  },
  {
    emoji: '🐋',
    name: 'Whale Sharks',
    location: 'Watamu',
    bestMonths: [11, 12, 1, 2, 3],
    note: 'Plankton blooms attract them close to shore',
  },
  {
    emoji: '🐢',
    name: 'Turtle Nesting',
    location: 'Watamu Marine Park',
    bestMonths: [1, 2, 3],
    note: 'Green & Olive Ridley turtles nest on the beach',
  },
  {
    emoji: '🦩',
    name: 'Migratory Birds',
    location: 'Kenyan Coast',
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    note: 'Palearctic migrants overwinter along the coast',
  },
];

export default function WildlifeCalendarSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current) return;
    const rows = sectionRef.current.querySelectorAll('.calendar-row');
    gsap.fromTo(
      rows,
      { autoAlpha: 0, x: -20 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    );
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-safari-50 border border-safari-200 rounded-full px-4 py-1.5 mb-4">
            <CalendarDays className="w-3.5 h-3.5 text-safari-600" />
            <span className="font-inter text-xs font-semibold text-safari-700 uppercase tracking-wider">
              {t.wildlifeCalendar?.label || 'Best Time to Visit'}
            </span>
          </div>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3">
            {t.wildlifeCalendar?.title || 'When nature puts on its show'}
          </h2>
          <p className="font-inter text-gray-500 text-base max-w-2xl mx-auto">
            {t.wildlifeCalendar?.subtitle || 'A rough guide to peak wildlife seasons — nature doesn\u2019t run on a strict schedule, but these windows give the best odds.'}
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[720px]">
            {/* Month header */}
            <div className="grid grid-cols-[220px_repeat(12,1fr)] gap-1 mb-2 px-1">
              <div />
              {MONTHS.map((m, i) => (
                <div key={i} className="text-center font-inter text-xs font-semibold text-gray-400">{m}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {CALENDAR_ROWS.map((row, ri) => (
                <div
                  key={ri}
                  className="calendar-row grid grid-cols-[220px_repeat(12,1fr)] gap-1 items-center bg-sand-50 rounded-xl px-1 py-2.5"
                >
                  <div className="pl-3 pr-2">
                    <p className="font-poppins font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                      <span>{row.emoji}</span> {row.name}
                    </p>
                    <p className="font-inter text-xs text-gray-500">{row.location}</p>
                  </div>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const isBest = row.bestMonths.includes(month);
                    return (
                      <div
                        key={month}
                        title={isBest ? row.note : undefined}
                        className={`h-6 rounded-md mx-0.5 ${isBest ? 'bg-safari-500' : 'bg-gray-200'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="font-inter text-xs text-gray-400 text-center mt-6">
          {t.wildlifeCalendar?.footnote || 'Highlighted months = peak viewing window. Wildlife sightings can never be 100% guaranteed.'}
        </p>
      </div>
    </section>
  );
}
