/**
 * Video Configuration for Cinematic Hero
 * Centralized source of truth for video assets, sizes, and metadata
 */

export interface VideoSource {
  desktop: string;
  mobile: string;
  poster: string;
  duration: number;
}

export const heroVideoConfig: VideoSource = {
  // Desktop video (4K preferred, fallback to 1080p)
  // Replace with actual video URL when ready
  desktop: '/videos/hero-drone-desktop.mp4',
  
  // Mobile video (optimized, lower bitrate)
  mobile: '/videos/hero-drone-mobile.mp4',
  
  // Poster image (fallback for prefers-reduced-motion or errors)
  poster: '/images/hero/video-poster.jpg',
  
  // Video duration in seconds (used for scroll mapping)
  // NOTE: video.duration is read live in CinematicHeroVideo once metadata loads,
  // this value is only the fallback used before that fires.
  duration: 90,
};

/**
 * Text overlay checkpoints synchronized with video progress
 * Maps video playback progress to text overlays
 */
export interface TextOverlayCheckpoint {
  startPercent: number;  // When to start showing this text (0-100)
  endPercent: number;    // When to stop showing this text (0-100)
  title: string;         // Heading text
  subtitle: string;      // Body text
  i18nKeys?: {           // i18n keys if using translation
    titleKey?: string;
    subtitleKey?: string;
  };
}

export const textOverlayCheckpoints: TextOverlayCheckpoint[] = [
  {
    startPercent: 0,
    endPercent: 28,
    title: 'WELCOME TO THE WILD',
    subtitle: 'Witness untamed Africa through our lens',
    i18nKeys: {
      titleKey: 'cinematic.overlay.welcome.title',
      subtitleKey: 'cinematic.overlay.welcome.subtitle',
    },
  },
  {
    startPercent: 28,
    endPercent: 52,
    title: 'DISCOVER KENYA',
    subtitle: 'From the Masai Mara to coastal paradises, explore pristine wilderness',
    i18nKeys: {
      titleKey: 'cinematic.overlay.discover.title',
      subtitleKey: 'cinematic.overlay.discover.subtitle',
    },
  },
  {
    startPercent: 52,
    endPercent: 78,
    title: 'LUXURY IN THE WILD',
    subtitle: 'Premium safari experiences thoughtfully crafted for adventurers',
    i18nKeys: {
      titleKey: 'cinematic.overlay.beyond.title',
      subtitleKey: 'cinematic.overlay.beyond.subtitle',
    },
  },
  {
    startPercent: 78,
    endPercent: 100,
    title: 'YOUR JOURNEY AWAITS',
    subtitle: 'Plan your African adventure with Bahari Asili Safaris today',
    i18nKeys: {
      titleKey: 'cinematic.overlay.journey.title',
      subtitleKey: 'cinematic.overlay.journey.subtitle',
    },
  },
];

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get the appropriate video source based on viewport width
 */
export function getVideoSourceForViewport(width: number): string {
  // Use mobile video for screens smaller than 768px (tablet breakpoint)
  return width < 768 ? heroVideoConfig.mobile : heroVideoConfig.desktop;
}

/**
 * Get current text overlay checkpoint based on video progress (0-1)
 */
export function getCurrentOverlayCheckpoint(
  progress: number,
  checkpoints: TextOverlayCheckpoint[] = textOverlayCheckpoints
): TextOverlayCheckpoint | null {
  const progressPercent = progress * 100;
  
  for (const checkpoint of checkpoints) {
    if (progressPercent >= checkpoint.startPercent && progressPercent < checkpoint.endPercent) {
      return checkpoint;
    }
  }
  
  return null;
}

/**
 * Calculate opacity for text overlay based on progress within checkpoint
 * Provides smooth fade in/out at boundaries
 */
export function calculateOverlayOpacity(progress: number, checkpoint: TextOverlayCheckpoint): number {
  const progressPercent = progress * 100;
  const fadeDuration = 8; // % fade in/out duration
  
  // Fade in at start
  if (progressPercent < checkpoint.startPercent + fadeDuration) {
    return (progressPercent - checkpoint.startPercent) / fadeDuration;
  }
  
  // Fade out at end
  if (progressPercent > checkpoint.endPercent - fadeDuration) {
    return (checkpoint.endPercent - progressPercent) / fadeDuration;
  }
  
  // Full opacity in middle
  return 1;
}
