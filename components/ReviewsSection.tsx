'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ExternalLink, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Review {
  author: string;
  rating: number;
  text: string;
  source: 'google' | 'tripadvisor';
  date?: string;
  avatar?: string;
}

interface PlatformInfo {
  rating: number;
  totalReviews: number;
  url: string;
}

// ---------- Placeholder testimonials ----------
// PLACEHOLDER CONTENT — replace these with real quotes from actual guests
// before shipping. Collect a short WhatsApp message from 3–5 past clients
// ("how was the trip?"), get their OK to use it with their first name +
// country, and swap the text/name/flag/safari fields below. Kept separate
// from the live Google/TripAdvisor tier above (shown only when no API keys
// are configured and no live reviews come back) so it's never mislabeled as
// a platform review.
interface Testimonial {
  name: string;
  flag: string;
  country: string;
  text: string;
  safari: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Kamelia D.',
    flag: '🇮🇹',
    country: 'Italy',
    text: 'Shadrack made our Tsavo trip unforgettable! Everything was organized down to the smallest detail, and our guide spoke perfect Italian.',
    safari: 'Tsavo Safari',
  },
  {
    name: 'Marco R.',
    flag: '🇮🇹',
    country: 'Italy',
    text: 'From the airport pickup to the last game drive, the whole family felt looked after. The kids still talk about the elephants in Amboseli.',
    safari: 'Amboseli Safari',
  },
  {
    name: 'Emma T.',
    flag: '🇬🇧',
    country: 'United Kingdom',
    text: 'A genuinely local, honest operator. No hidden costs, no rushed itinerary — just a beautifully paced trip through the Mara.',
    safari: 'Masai Mara Safari',
  },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center">
            <span className="font-poppins font-bold text-ocean-700 text-sm">{item.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-poppins font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              {item.name} <span>{item.flag}</span>
            </p>
            <p className="font-inter text-xs text-gray-400">{item.safari}</p>
          </div>
        </div>
      </div>
      <Stars rating={5} />
      <p className="font-inter text-sm text-gray-600 leading-relaxed mt-3 flex-1">
        &ldquo;{item.text}&rdquo;
      </p>
    </div>
  );
}

// ---------- Google Business fetch ----------
// Uses Google Business Profile API (free tier) when GOOGLE_BUSINESS_API_KEY is set.
// Falls back gracefully when the key is missing.
async function fetchGoogleReviews(): Promise<{ reviews: Review[]; info: PlatformInfo | null }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_API_KEY;
  if (!apiKey) return { reviews: [], info: null };

  try {
    // Google My Business API — placeId for "Bahari Asili Safaris, Watamu"
    // This is a public API endpoint; in production you'd use the Place Details API.
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || '';
    if (!placeId) return { reviews: [], info: null };

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total,url&key=${apiKey}`,
    );
    if (!res.ok) return { reviews: [], info: null };

    const data = await res.json();
    if (!data.result) return { reviews: [], info: null };

    const info: PlatformInfo = {
      rating: data.result.rating || 0,
      totalReviews: data.result.user_ratings_total || 0,
      url: data.result.url || '#',
    };

    const reviews: Review[] = (data.result.reviews || []).slice(0, 5).map((r: any) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      source: 'google' as const,
      date: r.time ? new Date(r.time * 1000).toLocaleDateString() : undefined,
      avatar: r.profile_photo_url,
    }));

    return { reviews, info };
  } catch {
    return { reviews: [], info: null };
  }
}

// ---------- TripAdvisor fetch ----------
// Uses TripAdvisor Content API (free tier) when TRIPADVISOR_API_KEY is set.
async function fetchTripAdvisorReviews(): Promise<{ reviews: Review[]; info: PlatformInfo | null }> {
  const apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
  if (!apiKey) return { reviews: [], info: null };

  try {
    const locationId = process.env.NEXT_PUBLIC_TRIPADVISOR_LOCATION_ID || '';
    if (!locationId) return { reviews: [], info: null };

    const res = await fetch(
      `https://api.tripadvisor.com/api/partner/2.0/location/${locationId}/reviews?key=${apiKey}`,
    );
    if (!res.ok) return { reviews: [], info: null };

    const data = await res.json();
    const info: PlatformInfo = {
      rating: data.rating || 0,
      totalReviews: data.num_reviews || 0,
      url: data.web_url || '#',
    };

    const reviews: Review[] = (data.reviews || []).slice(0, 5).map((r: any) => ({
      author: r.author,
      rating: r.rating,
      text: r.text,
      source: 'tripadvisor' as const,
      date: r.published_date ? new Date(r.published_date).toLocaleDateString() : undefined,
    }));

    return { reviews, info };
  } catch {
    return { reviews: [], info: null };
  }
}

// ---------- Star rating display ----------
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`${starSize} ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

// ---------- Review card ----------
function ReviewCard({ review }: { review: Review }) {
  const sourceColor = review.source === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600';
  const sourceLabel = review.source === 'google' ? 'Google' : 'TripAdvisor';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {review.avatar ? (
            <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center">
              <span className="font-poppins font-bold text-ocean-700 text-sm">
                {review.author.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-poppins font-semibold text-gray-900 text-sm">{review.author}</p>
            {review.date && <p className="font-inter text-xs text-gray-400">{review.date}</p>}
          </div>
        </div>
        <span className={`font-inter text-xs font-semibold px-2.5 py-1 rounded-full ${sourceColor}`}>
          {sourceLabel}
        </span>
      </div>
      <Stars rating={review.rating} />
      <p className="font-inter text-sm text-gray-600 leading-relaxed mt-3 flex-1 line-clamp-4">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}

// ---------- Platform summary card ----------
function PlatformCard({ platform, info, icon }: { platform: 'google' | 'tripadvisor'; info: PlatformInfo | null; icon: React.ReactNode }) {
  if (!info) return null;
  const label = platform === 'google' ? 'Google' : 'TripAdvisor';
  const bgColor = platform === 'google' ? 'hover:border-blue-200' : 'hover:border-green-200';

  return (
    <a
      href={info.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-card transition-all ${bgColor} hover:shadow-card-hover`}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-poppins font-semibold text-gray-900 text-sm">{label}</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <Stars rating={info.rating} />
          <span className="font-inter text-sm font-bold text-gray-700">{info.rating.toFixed(1)}</span>
          <span className="font-inter text-xs text-gray-400">({info.totalReviews} reviews)</span>
        </div>
      </div>
    </a>
  );
}

// ---------- Main component ----------
export default function ReviewsSection() {
  const { t } = useLanguage();
  const [googleData, setGoogleData] = useState<{ reviews: Review[]; info: PlatformInfo | null }>({ reviews: [], info: null });
  const [tripData, setTripData] = useState<{ reviews: Review[]; info: PlatformInfo | null }>({ reviews: [], info: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [g, ta] = await Promise.all([fetchGoogleReviews(), fetchTripAdvisorReviews()]);
      setGoogleData(g);
      setTripData(ta);
      setLoading(false);
    })();
  }, []);

  const allReviews = [...googleData.reviews, ...tripData.reviews].slice(0, 6);
  const hasAny = allReviews.length > 0 || googleData.info || tripData.info;

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 lg:py-28 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-safari-50 border border-safari-200 rounded-full px-4 py-1.5 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-safari-600" />
            <span className="font-inter text-xs font-semibold text-safari-700 uppercase tracking-wider">
              {t.reviews?.label || 'Reviews'}
            </span>
          </div>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3">
            {t.reviews?.title || 'What our travelers say'}
          </h2>
          <p className="font-inter text-gray-500 text-base max-w-2xl mx-auto">
            {t.reviews?.subtitle || 'Real reviews from real travelers on Google and TripAdvisor'}
          </p>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-16" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2" />
                <div className="h-2 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-2 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !hasAny ? (
          // Fallback when no live review API keys are configured yet —
          // shows curated testimonials instead of leaving the section empty.
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FALLBACK_TESTIMONIALS.map((item, i) => (
              <TestimonialCard key={i} item={item} />
            ))}
          </div>
        ) : (
          <>
            {/* Platform summary cards */}
            {(googleData.info || tripData.info) && (
              <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                <PlatformCard
                  platform="google"
                  info={googleData.info}
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  }
                />
                <PlatformCard
                  platform="tripadvisor"
                  info={tripData.info}
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00aa5c">
                      <path d="M12 9.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM5 9.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/>
                      <circle cx="12" cy="14" r="1.5"/>
                      <circle cx="5" cy="14" r="1.5"/>
                    </svg>
                  }
                />
              </div>
            )}

            {/* Review cards — swipeable carousel */}
            {allReviews.length > 0 && (
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-5">
                    {allReviews.map((review, i) => (
                      <div key={i} className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-14px)] min-w-0">
                        <ReviewCard review={review} />
                      </div>
                    ))}
                  </div>
                </div>

                {(canScrollPrev || canScrollNext) && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => emblaApi?.scrollPrev()}
                      disabled={!canScrollPrev}
                      aria-label="Previous reviews"
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-ocean-600 hover:text-ocean-700 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => emblaApi?.scrollNext()}
                      disabled={!canScrollNext}
                      aria-label="Next reviews"
                      className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-ocean-600 hover:text-ocean-700 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
