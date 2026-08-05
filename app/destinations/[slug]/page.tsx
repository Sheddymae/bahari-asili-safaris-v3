import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { destinations } from '@/lib/destinations-data';
import DestinationDetailClient from '@/components/DestinationDetailClient';

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = destinations.find((d) => d.slug === params.slug);
  if (!destination) return { title: 'Destination not found — Bahari Asili Safaris' };

  const title = `${destination.name} Safaris — Bahari Asili Safaris`;
  const description = `${destination.tagline}. Wildlife highlights, best time to visit, and safari packages to ${destination.name} from Bahari Asili Safaris.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [destination.heroImage] },
  };
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const destination = destinations.find((d) => d.slug === params.slug);
  if (!destination) notFound();

  return <DestinationDetailClient destination={destination} />;
}
