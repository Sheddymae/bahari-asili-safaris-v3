'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealType = 'fade-up' | 'fade-in' | 'slide-in-right';

// Full literal class names so Tailwind's JIT content scanner keeps them —
// `animate-${type}` would not survive a production build.
const ANIMATION_CLASS: Record<RevealType, string> = {
  'fade-up': 'animate-fade-up',
  'fade-in': 'animate-fade-in',
  'slide-in-right': 'animate-slide-in-right',
};

interface ScrollRevealProps {
  children: ReactNode;
  type?: RevealType;
  delay?: number; // ms
  className?: string;
  /** Re-trigger every time the element enters the viewport instead of only once */
  once?: boolean;
}

/**
 * Wraps children in a div that animates in via the existing tailwind
 * `fade-up` / `fade-in` / `slide-in-right` keyframes once it enters the
 * viewport. No animation library required — one IntersectionObserver per
 * element, disconnected after the first reveal to keep things cheap.
 */
export default function ScrollReveal({
  children,
  type = 'fade-up',
  delay = 0,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced-motion preference: show immediately, no animation.
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`${visible ? ANIMATION_CLASS[type] : 'opacity-0'} ${className}`}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
