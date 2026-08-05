'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CinematicTextOverlayProps {
  onBook?: () => void;
  onScrollClick?: () => void;
}

/**
 * CinematicTextOverlay Component
 *
 * Displays the BAHARI ASILI SAFARIS brand text over the autoplaying hero video.
 * - Simple, elegant fade-in on load — no scroll-driven or mouse-driven animation
 * - Static heading, subtitle and CTA (no scroll-linked checkpoints)
 */
export default function CinematicTextOverlay({ onBook, onScrollClick }: CinematicTextOverlayProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Simple fade/slide reveal shortly after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const subtitle =
    t?.hero?.subtitle ||
    'Experience the untamed beauty of Africa with Bahari Asili Safaris';

  return (
    <>
      {/* Main text overlay container - featuring BAHARI ASILI SAFARIS brand.
          Positioned `absolute` (not `fixed`) so it is bounded by, and scrolls
          away with, the Hero section's own `relative overflow-hidden` box —
          see CinematicHeroVideo, which is this component's DOM parent. */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl text-center">
          <h1
            className={`font-poppins font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-none tracking-tight mb-6 sm:mb-8 drop-shadow-lg pointer-events-none transition-all duration-700 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{
              textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5)',
              letterSpacing: '-0.02em',
            }}
          >
            BAHARI ASILI<br className="hidden sm:inline" /> SAFARIS
          </h1>

          {/* Decorative accent line */}
          <div
            className={`h-1 w-16 bg-gradient-to-r from-safari-400 to-safari-500 mx-auto mb-6 sm:mb-8 rounded-full drop-shadow-lg transition-opacity duration-700 delay-100 ease-out ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Subtitle */}
          <p
            className={`font-inter text-white/90 text-base sm:text-lg md:text-xl leading-relaxed drop-shadow transition-all duration-700 delay-150 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
          >
            {subtitle}
          </p>

          {/* CTA Button */}
          <div
            className={`mt-10 sm:mt-12 transition-all duration-700 delay-300 ease-out ${
              visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <button
              onClick={onBook}
              className="inline-block bg-safari-500 hover:bg-safari-600 text-white font-poppins font-bold px-8 sm:px-10 py-4 text-base sm:text-lg rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 drop-shadow-lg"
            >
              {t?.hero?.bookNow || 'Start Your Safari'}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator - bottom of Hero section, subtle idle bounce, no scroll-linked visibility logic */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-auto cursor-pointer transition-opacity duration-700 delay-500 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onScrollClick}
      >
        <div className="flex flex-col items-center gap-1.5 text-white/60 hover:text-white/90 transition-colors group">
          <span className="font-inter text-xs tracking-widest uppercase drop-shadow">Scroll</span>
          <div className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center pt-1.5 group-hover:border-white/70 transition-colors">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </>
  );
}
