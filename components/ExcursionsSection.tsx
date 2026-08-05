'use client';

import Image from 'next/image';
import { Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { excursions } from '@/lib/tours-data';

export default function ExcursionsSection({ onBook }: { onBook: (name?: string) => void }) {
  const { t, locale } = useLanguage();

  return (
    <section id="excursions" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-inter text-safari-500 font-semibold text-sm tracking-widest uppercase block mb-2">
              {t.excursions.label}
            </span>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900">
              {t.excursions.title}{' '}
              <span className="text-safari-500">{t.excursions.titleHighlight}</span>
            </h2>
          </div>
          <p className="font-inter text-gray-500 text-base max-w-md lg:text-right">
            {t.excursions.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {excursions.map(exc => (
            <div
              key={exc.id}
              className="tour-card bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-card flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={exc.image}
                  alt={exc.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-poppins font-bold text-white text-base leading-snug">
                    {locale === 'it' ? exc.nameIt : exc.name}
                  </h3>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-safari-500" />
                  <span className="font-inter text-xs font-semibold text-gray-700">{exc.duration}</span>
                </div>
                {exc.popular && (
                  <div className="absolute top-3 left-3 bg-safari-500 rounded-full px-3 py-1 shadow-sm">
                    <span className="font-inter font-bold text-[10px] tracking-wide uppercase text-white">Popular</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <p className="font-inter text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                  {locale === 'it' ? exc.descriptionIt : exc.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {exc.highlights.map((h, i) => (
                    <span key={i} className="bg-sand-50 text-gray-600 font-inter text-xs px-2.5 py-0.5 rounded-full border border-sand-200">
                      {h}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onBook(locale === 'it' ? exc.nameIt : exc.name)}
                  className="w-full flex items-center justify-center gap-2 bg-safari-500 hover:bg-safari-600 text-white font-poppins font-semibold text-sm py-3 rounded-xl transition-all hover:shadow-md"
                >
                  {t.excursions.bookNow}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
