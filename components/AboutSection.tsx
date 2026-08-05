'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { prefersReducedMotion } from '@/lib/video-config';

gsap.registerPlugin(ScrollTrigger);

/**
 * AboutSection Component (Redesigned for Cinematic Experience)
 * 
 * Features:
 * - Large editorial heading
 * - Split layout with cinematic imagery
 * - Subtle fade-in reveal on scroll into view (no parallax, no mouse tracking)
 * - Premium typography and spacing
 */
export default function AboutSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageLeftRef = useRef<HTMLDivElement>(null);
  const imageRightRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Subtle fade-in reveal only — no parallax, no scroll-scrubbed motion
  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current) return;

    // Content fade in
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
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
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 lg:py-32 bg-sand-50 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-safari-100/30 rounded-full -z-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ocean-100/20 rounded-full -z-10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-16 lg:mb-24">
          <span className="font-inter text-safari-500 font-semibold text-xs tracking-widest uppercase block mb-4">
            {t.about?.label || 'About Us'}
          </span>
          <h2 className="font-poppins font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6 text-balance">
            Africa,{' '}
            <span className="text-safari-500 relative">
              Unfiltered
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-safari-300/40 -z-10" />
            </span>
          </h2>
          <p className="font-inter text-gray-600 text-lg leading-relaxed mb-4 max-w-2xl">
            {t.about?.description || 'Experience the untamed beauty of East Africa with expert guides and luxury accommodations.'}
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div ref={contentRef} className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-2xl text-gray-800">
                {t.about?.titleHighlight || 'Premium Safari Experiences'}
              </h3>
              <p className="font-inter text-gray-600 text-base leading-relaxed">
                {t.about?.bodyText ||
                  "With over a decade of experience guiding safaris across Kenya, we've perfected the art of creating unforgettable moments in nature."}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white rounded-xl p-6 border border-sand-200 hover:border-safari-300 transition-colors">
                <div className="font-poppins font-black text-3xl text-safari-500">
                  {t.about?.stats1 || '10+'}
                </div>
                <p className="font-inter text-sm text-gray-600 mt-2">
                  {t.about?.stats1Label || 'Years Experience'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-sand-200 hover:border-ocean-300 transition-colors">
                <div className="font-poppins font-black text-3xl text-ocean-700">
                  {t.about?.stats2 || '500+'}
                </div>
                <p className="font-inter text-sm text-gray-600 mt-2">
                  {t.about?.stats2Label || 'Happy Guests'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Images - Editorial Layout */}
          <div className="relative hidden lg:block">
            {/* Large featured image */}
            <div
              ref={imageLeftRef}
              className="rounded-2xl overflow-hidden h-96 shadow-card will-change-transform"
            >
              <Image
                src="/images/safaris/safari-nala-taita.jpg"
                alt="Kenya Safari Experience"
                fill
                className="object-cover"
                sizes="500px"
              />
            </div>

            {/* Secondary image with accent */}
            <div
              ref={imageRightRef}
              className="absolute bottom-0 right-0 w-2/3 rounded-2xl overflow-hidden h-64 shadow-card border-8 border-white will-change-transform"
            >
              <Image
                src="/images/safaris/safari-experience-tsavo.jpg"
                alt="Tsavo Safari"
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>

            {/* Accent box */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-safari-500 rounded-full opacity-20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
