'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { heroVideoConfig, getVideoSourceForViewport, prefersReducedMotion } from '@/lib/video-config';

interface CinematicHeroVideoProps {
  onReady?: () => void;
  children?: React.ReactNode;
}

/**
 * CinematicHeroVideo Component
 *
 * Simple, premium autoplaying video hero — no scroll interaction required.
 * - Video autoplays, muted, loops continuously, plays inline on mobile
 * - No ScrollTrigger, no scroll pinning, no mouse-driven effects
 * - Graceful fallback for prefers-reduced-motion (shows poster only)
 * - Mobile-optimized video source selection
 *
 * IMPORTANT: `children` (brand text / CTA overlay) is rendered INSIDE this
 * component's <section>, which is the sole `position: relative` +
 * `overflow-hidden` ancestor for the Hero. That is what bounds any
 * `position: absolute` overlay content to the Hero's box so it scrolls
 * away naturally with the section instead of staying pinned to the
 * viewport. Do not render Hero overlay content as a sibling of this
 * component, and do not use `position: fixed` for it.
 */
export default function CinematicHeroVideo({ onReady, children }: CinematicHeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasReducedMotion, setHasReducedMotion] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>('');

  // Initialize video source and reduced motion preference
  useEffect(() => {
    const prefersReduced = prefersReducedMotion();
    setHasReducedMotion(prefersReduced);

    // Get appropriate video source for viewport
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const src = getVideoSourceForViewport(viewportWidth);
    setVideoSrc(src);
  }, []);

  // Handle video loading
  const handleVideoLoad = () => {
    setVideoLoaded(true);
    if (onReady) {
      onReady();
    }
  };

  // Ensure autoplay kicks in as soon as we have a source (some browsers need an explicit call)
  useEffect(() => {
    if (!videoRef.current || hasReducedMotion || !videoSrc) return;
    const playPromise = videoRef.current.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay was blocked (rare with muted video) — safe to ignore,
        // poster image remains visible as a fallback.
      });
    }
  }, [videoSrc, hasReducedMotion]);

  // Handle video errors
  const handleVideoError = () => {
    console.error('[hero] Video failed to load, showing poster fallback');
  };

  // If user prefers reduced motion, show static poster only
  if (hasReducedMotion) {
    return (
      <section
        id="home"
        ref={containerRef}
        className="relative min-h-screen w-full overflow-hidden"
        style={{ backgroundColor: '#000' }}
      >
        <Image
          src={heroVideoConfig.poster}
          alt="Bahari Asili Safaris - Cinematic Safari Hero"
          fill
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        {children}
      </section>
    );
  }

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Video container */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={heroVideoConfig.poster}
          onCanPlay={handleVideoLoad}
          onError={handleVideoError}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center select-none"
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
          } as React.CSSProperties}
        />
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      {/* Poster shown until the video has enough data to play smoothly */}
      {!videoLoaded && (
        <Image
          src={heroVideoConfig.poster}
          alt="Bahari Asili Safaris - Cinematic Safari Hero"
          fill
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
          className="object-cover object-center absolute inset-0"
        />
      )}

      {children}
    </section>
  );
}
