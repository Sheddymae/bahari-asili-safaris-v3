import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bahari-asili-safaris.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Bahari Asili Safaris - Diani & Kenya Safaris',
    template: '%s | Bahari Asili Safaris',
  },
  description: 'Best Diani Beach tours, safaris to Tsavo, Amboseli, Masai Mara, transfers & excursions.',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: siteUrl,
    siteName: 'Bahari Asili Safaris',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth bg-sand-50">
      <body className="bg-sand-50">
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
