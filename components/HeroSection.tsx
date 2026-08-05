'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Users, CalendarDays, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CinematicHeroVideo from './CinematicHeroVideo';
import CinematicTextOverlay from './CinematicTextOverlay';
import { prefersReducedMotion } from '@/lib/video-config';

const locations = [
  'Tsavo East, Kenya',
  'Masai Mara, Kenya',
  'Amboseli, Kenya',
  'Taita Hills, Kenya',
  'Lake Nakuru, Kenya',
  'Tsavo West, Kenya',
  'Watamu Beach',
  'Lamu Island',
];

/**
 * HeroSection Component (Premium Autoplay Experience)
 *
 * Combines CinematicHeroVideo with booking form and text overlays
 * - Video autoplays immediately on load, no scroll or mouse interaction required
 * - Text overlays fade in on mount
 * - Premium booking form appears shortly after load
 */
export default function HeroSection({ onBook }: { onBook: () => void }) {
  const { t } = useLanguage();
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('2');
  const [date, setDate] = useState('');
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  // Animate in booking form shortly after the hero loads
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(id);
  }, []);

  const handleScrollClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const showBookingForm = mounted;

  return (
    <>
      {/* Cinematic Video Hero — overlay text AND the booking bar are rendered
          INSIDE this section (as children) so both are bounded by the
          section's own box and scroll away with it, instead of floating
          over the rest of the page. */}
      <CinematicHeroVideo>
        <CinematicTextOverlay
          onBook={onBook}
          onScrollClick={handleScrollClick}
        />

        {/* Premium Booking Bar - anchored to the bottom of the Hero section.
            Positioned `absolute` (not `fixed`) so it is bounded by, and
            scrolls away with, the Hero's own `relative overflow-hidden` box —
            it must never remain visible once the Hero has scrolled out of
            view. */}
        {!prefersReducedMotion() && (
          <div
            ref={bookingFormRef}
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 px-4 sm:px-6 w-full pointer-events-none transition-all duration-500 ${
              showBookingForm
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
            style={{
              pointerEvents: showBookingForm ? 'auto' : 'none',
            }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-5xl mx-auto">
              {/* Location selector */}
              <div className="relative flex-1 min-w-0">
                <button
                  onClick={() => setIsLocOpen(!isLocOpen)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-sand-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-safari-500 flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-inter text-xs text-gray-400 font-medium">
                      {t.hero?.location || 'Location'}
                    </div>
                    <div
                      className={`font-inter text-sm truncate ${
                        location ? 'text-gray-800 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {location || 'Where to?'}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${
                      isLocOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isLocOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-card-hover border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setLocation(loc);
                          setIsLocOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 font-inter text-sm text-gray-700 hover:bg-sand-50 hover:text-ocean-700 transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* People input */}
              <div className="hidden sm:block w-px bg-gray-200 h-10 self-center" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-sand-50 transition-colors">
                  <Users className="w-4 h-4 text-safari-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-inter text-xs text-gray-400 font-medium">
                      {t.hero?.people || 'People'}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      className="w-full font-inter text-sm text-gray-800 font-medium bg-transparent border-none outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Date input */}
              <div className="hidden sm:block w-px bg-gray-200 h-10 self-center" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-sand-50 transition-colors">
                  <CalendarDays className="w-4 h-4 text-safari-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-inter text-xs text-gray-400 font-medium">
                      {t.hero?.date || 'Date'}
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full font-inter text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Book button */}
              <button
                onClick={onBook}
                className="bg-safari-500 hover:bg-safari-600 text-white font-poppins font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                {t.hero?.bookNow || 'Book Now'}
              </button>
            </div>
          </div>
        )}
      </CinematicHeroVideo>
    </>
  );
}
