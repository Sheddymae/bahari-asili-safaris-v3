'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Camera, ImageOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ScrollReveal from '@/components/ScrollReveal';

type CategoryKey = 'safari' | 'coast' | 'culture' | 'marine' | 'sunsets';

interface GalleryImage {
  src: string;
  alt: string;
  category: CategoryKey;
}

// Premium safari and coastal imagery
const images: GalleryImage[] = [
  // Safari & Wildlife
  { src: '/images/gallery/safari-lions.png', alt: 'African lions pride resting in golden grassland', category: 'safari' },
  { src: '/images/gallery/safari-elephants.png', alt: 'Herd of African elephants in savanna landscape', category: 'safari' },
  { src: '/images/gallery/safari-giraffe.png', alt: 'Tall giraffe standing in Kenyan savanna', category: 'safari' },
  { src: '/images/gallery/safari-zebra.png', alt: 'Wild zebra herd grazing in African savanna', category: 'safari' },
  { src: '/images/gallery/safari-leopard.png', alt: 'Spotted leopard resting on acacia tree branch', category: 'safari' },
  { src: '/images/gallery/safari-rhino.png', alt: 'African rhino in natural savanna habitat', category: 'safari' },
  { src: '/images/gallery/safari-buffalo.png', alt: 'African cape buffalo herd in grassland', category: 'safari' },
  { src: '/images/gallery/safari-wildebeest.png', alt: 'Wildebeest herd during migration in dust cloud', category: 'safari' },
  { src: '/images/gallery/safari-birds.png', alt: 'Colorful African birds in natural habitat', category: 'safari' },
  { src: '/images/gallery/safari-gamedrive.png', alt: 'Safari game drive with tourists observing wildlife', category: 'safari' },
  
  // Sunsets & Landscapes
  { src: '/images/gallery/safari-sunset.png', alt: 'Golden sunset over African savanna', category: 'sunsets' },
  
  // Coast & Beach
  { src: '/images/gallery/coast-beach.png', alt: 'Tropical Kenyan beach paradise with white sand', category: 'coast' },
  { src: '/images/hero/hero-diani.jpg', alt: 'Diani Beach, Kenya coastline', category: 'coast' },
  
  // Marine & Snorkeling
  { src: '/images/gallery/marine-coral.png', alt: 'Colorful coral reef and tropical marine life', category: 'marine' },
  
  // Lodges & Accommodations
  { src: '/images/gallery/lodge-luxury.png', alt: 'Luxury safari lodge exterior with thatched roof', category: 'safari' },
  { src: '/images/gallery/lodge-dining.png', alt: 'Luxury safari lodge outdoor dining experience', category: 'safari' },
  
  // Existing verified images
  { src: '/images/safaris/safari-experience-tsavo.jpg', alt: 'Game drive in Tsavo National Park', category: 'safari' },
  { src: '/images/safaris/safari-inside-tsavo-amboseli.jpg', alt: 'Safari vehicle in Amboseli with Mount Kilimanjaro', category: 'safari' },
  { src: '/images/safaris/safari-nala-taita.jpg', alt: 'Wildlife encounter in the Taita Hills', category: 'safari' },
];

const emptyCategories: { key: CategoryKey; count: number }[] = [
  { key: 'culture', count: 2 },
];

export default function GallerySection() {
  const { t } = useLanguage();
  const [active, setActive] = useState<CategoryKey | 'all'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = active === 'all' ? images : images.filter(img => img.category === active);
  const activeEmpty = active === 'all' ? [] : emptyCategories.filter(c => c.key === active);

  const categories: { key: CategoryKey | 'all'; label: string }[] = [
    { key: 'all', label: t.gallery?.filters?.all ?? 'All' },
    { key: 'safari', label: t.gallery?.filters?.safari ?? 'Safari & Wildlife' },
    { key: 'coast', label: t.gallery?.filters?.coast ?? 'Diani & the Coast' },
    { key: 'culture', label: t.gallery?.filters?.culture ?? 'Culture & Heritage' },
    { key: 'marine', label: t.gallery?.filters?.marine ?? 'Marine & Snorkeling' },
  ];

  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () => setLightboxIndex(i => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  const showNext = () => setLightboxIndex(i => (i === null ? null : (i + 1) % filtered.length));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex]);

  return (
    <section id="gallery" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-ocean-50 border border-ocean-100 rounded-full px-4 py-1.5 mb-4">
              <Camera className="w-3.5 h-3.5 text-ocean-700" />
              <span className="font-inter text-xs font-semibold text-ocean-700 uppercase tracking-wider">
                {t.gallery?.label ?? 'Gallery'}
              </span>
            </div>
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3">
              {t.gallery?.title ?? 'Moments from the journey'}
            </h2>
            <p className="font-inter text-gray-500 text-base max-w-2xl mx-auto">
              {t.gallery?.subtitle ?? 'Wildlife, coastline and everything in between'}
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={80}>
          <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className={`font-inter text-sm font-medium px-5 py-2 rounded-full border transition-all ${
                  active === cat.key
                    ? 'bg-ocean-700 text-white border-ocean-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-ocean-600 hover:text-ocean-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[160px] sm:auto-rows-[200px]">
          {filtered.map((img, i) => (
            <ScrollReveal key={img.src} delay={(i % 4) * 60} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
              <button
                onClick={() => setLightboxIndex(i)}
                className="group relative w-full h-full rounded-2xl overflow-hidden shadow-card"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            </ScrollReveal>
          ))}

          {/* Elegant placeholders for categories awaiting real photography */}
          {activeEmpty.flatMap(cat =>
            Array.from({ length: cat.count }).map((_, i) => (
              <div
                key={`${cat.key}-placeholder-${i}`}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-sand-50 text-gray-400"
              >
                <ImageOff className="w-6 h-6" />
                <span className="font-inter text-xs text-center px-3">
                  {t.gallery?.comingSoon ?? 'Photo coming soon'}
                </span>
              </div>
            )),
          )}
        </div>

        {filtered.length === 0 && activeEmpty.length === 0 && (
          <div className="text-center py-16">
            <p className="font-inter text-gray-400">{t.gallery?.comingSoon ?? 'Photo coming soon'}</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={filtered[lightboxIndex].alt}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); showPrev(); }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="relative w-[90vw] h-[80vh] max-w-4xl" onClick={e => e.stopPropagation()}>
            <Image
              src={filtered[lightboxIndex].src}
              alt={filtered[lightboxIndex].alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            onClick={e => { e.stopPropagation(); showNext(); }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </section>
  );
}
