'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import { safaris } from '@/lib/tours-data';

// Heavy sections -> lazy load only when user scrolls to them
const ServicesSection = dynamic(() => import('@/components/ServicesSection'), {
  loading: () => <div className="h-96 bg-sand-50 animate-pulse" />,
});
const ToursSection = dynamic(() => import('@/components/ToursSection'), {
  loading: () => <div className="h- bg-white animate-pulse" />,
});
const MemoriesSection = dynamic(() => import('@/components/MemoriesSection'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});
const ExcursionsSection = dynamic(() => import('@/components/ExcursionsSection'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});
const WildlifeCalendarSection = dynamic(() => import('@/components/WildlifeCalendarSection'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});
const TransfersSection = dynamic(() => import('@/components/TransfersSection'), {
  loading: () => <div className="h-96 bg-sand-50 animate-pulse" />,
});
const GallerySection = dynamic(() => import('@/components/GallerySection'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});
const ReviewsSection = dynamic(() => import('@/components/ReviewsSection'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});
const Footer = dynamic(() => import('@/components/Footer'));

// Modals - no SSR, load only on click
const BookingModal = dynamic(() => import('@/components/BookingModal'), { ssr: false });
const BookingOverlay = dynamic(() => import('@/components/BookingOverlay'), { ssr: false });
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const openBooking = useCallback((tourName?: string) => {
    setSelectedTour(tourName || '');
    setIsBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsBookingOpen(false);
  }, []);

  const openOverlay = useCallback(() => {
    setIsOverlayOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  const handleOverlayBook = useCallback((data: any) => {
    // In production, this would send the booking data to your backend
    console.log('Booking submitted:', data);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  }, []);

  // If arriving from a /safaris/[slug] detail page's "Book This Safari"
  // button (?book=<slug>), open the booking modal pre-filled with that safari.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookSlug = params.get('book');
    if (!bookSlug) return;
    const safari = safaris.find((s) => s.id === bookSlug);
    if (safari) {
      openBooking(safari.name);
      document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [openBooking]);

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <HeroSection onBook={() => openOverlay()} />
        <AboutSection />
        <ServicesSection />
        <ToursSection onBook={openBooking} />
        <ExcursionsSection onBook={openBooking} />
        <WildlifeCalendarSection />
        <MemoriesSection onBook={() => openBooking()} />
        <TransfersSection onBook={() => openBooking('Transfer aeroporto')} />
        <GallerySection />
        <ReviewsSection />
      </main>
      <Footer />
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={closeBooking}
          selectedTour={selectedTour}
        />
      )}
      <BookingOverlay
        isOpen={isOverlayOpen}
        onClose={closeOverlay}
        onBook={handleOverlayBook}
      />
      {bookingSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg font-inter">
          Thank you! Your safari inquiry has been received.
        </div>
      )}
      <WhatsAppButton />
    </>
  );
}
