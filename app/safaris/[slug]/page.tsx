import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safaris } from '@/lib/tours-data';
import SafariDetailClient from '@/components/SafariDetailClient';

export function generateStaticParams() {
  return safaris.map((s) => ({ slug: s.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const safari = safaris.find((s) => s.id === params.slug);
  if (!safari) return { title: 'Safari not found — Bahari Asili Safaris' };

  const title = `${safari.name} — ${safari.days} Day Safari | Bahari Asili Safaris`;
  const description = `${safari.tagline}. ${safari.days} days / ${safari.nights} nights visiting ${safari.parks.join(', ')}. Day-by-day itinerary, what's included, and packing tips.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: safari.image ? [safari.image] : undefined,
    },
  };
}

export default function SafariDetailPage({ params }: { params: { slug: string } }) {
  const safari = safaris.find((s) => s.id === params.slug);
  if (!safari) notFound();

  return <SafariDetailClient safari={safari} />;
}
