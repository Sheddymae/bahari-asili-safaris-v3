/**
 * GSAP Animation Utilities
 * Reusable animation patterns and helpers for scroll-triggered effects
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fade in element on scroll
 */
export function fadeInOnScroll(
  element: HTMLElement | null,
  options: {
    delay?: number;
    duration?: number;
    threshold?: number;
  } = {}
): gsap.core.Tween | null {
  if (!element || prefersReducedMotion()) return null;

  const { delay = 0, duration = 0.6, threshold = 'top 80%' } = options;

  return gsap.fromTo(
    element,
    { autoAlpha: 0, y: 20 },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: threshold,
        markers: false,
      },
    }
  );
}

/**
 * Parallax effect for images
 */
export function parallaxImage(
  element: HTMLElement | null,
  options: {
    speed?: number;
    threshold?: string;
  } = {}
): gsap.core.Tween | null {
  if (!element || prefersReducedMotion()) return null;

  const { speed = 0.5, threshold = 'top bottom' } = options;

  return gsap.to(element, {
    y: (index, target) => {
      const height = target.offsetHeight;
      return height * speed;
    },
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: threshold,
      end: 'bottom top',
      scrub: true,
      markers: false,
    },
  });
}

/**
 * Scale in on scroll
 */
export function scaleInOnScroll(
  element: HTMLElement | null,
  options: {
    delay?: number;
    duration?: number;
    threshold?: string;
    scale?: { from: number; to: number };
  } = {}
): gsap.core.Tween | null {
  if (!element || prefersReducedMotion()) return null;

  const {
    delay = 0,
    duration = 0.8,
    threshold = 'top 80%',
    scale = { from: 0.8, to: 1 },
  } = options;

  return gsap.fromTo(
    element,
    { autoAlpha: 0, scale: scale.from },
    {
      autoAlpha: 1,
      scale: scale.to,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: threshold,
        markers: false,
      },
    }
  );
}

/**
 * Text reveal animation
 */
export function textRevealOnScroll(
  element: HTMLElement | null,
  options: {
    delay?: number;
    duration?: number;
    threshold?: string;
  } = {}
): gsap.core.Tween | null {
  if (!element || prefersReducedMotion()) return null;

  const { delay = 0, duration = 0.8, threshold = 'top 80%' } = options;

  return gsap.fromTo(
    element,
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: threshold,
        markers: false,
      },
    }
  );
}

/**
 * Horizontal parallax scroll
 */
export function horizontalScroll(
  container: HTMLElement | null,
  items: HTMLElement[],
  options: {
    speed?: number;
  } = {}
): gsap.core.Tween | null {
  if (!container || items.length === 0 || prefersReducedMotion()) return null;

  const { speed = 1 } = options;

  return gsap.to(items, {
    x: () => -((container as HTMLElement).offsetWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${(container as HTMLElement).offsetWidth * speed}`,
      scrub: 1,
      pin: true,
      markers: false,
    },
  });
}

/**
 * Cleanup all GSAP ScrollTriggers
 * Call this in component cleanup (useEffect return)
 */
export function cleanupGSAPAnimations(): void {
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill();
  });
}

/**
 * Refresh ScrollTriggers (useful after layout changes)
 */
export function refreshScrollTriggers(): void {
  ScrollTrigger.refresh();
}

/**
 * Create a simple tween (non-scroll-based)
 */
export function createTween(
  target: HTMLElement | null,
  toVars: gsap.TweenVars,
  options: { duration?: number; delay?: number; ease?: string } = {}
): gsap.core.Tween | null {
  if (!target) return null;

  const { duration = 0.6, delay = 0, ease = 'power2.out' } = options;

  return gsap.to(target, {
    ...toVars,
    duration,
    delay,
    ease,
  });
}
