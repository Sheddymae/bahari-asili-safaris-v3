'use client';

import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, Anchor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t.nav.home, href: '#home' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.tours, href: '#tours' },
    { label: t.nav.excursions, href: '#excursions' },
    { label: t.nav.transfers, href: '#transfers' },
    { label: t.nav.contact, href: '#contact' },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="bg-white h-8 rounded-b-[40px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-safari-500 rounded-full flex items-center justify-center">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-poppins font-bold text-white text-lg leading-none block">Bahari Asili</span>
                <span className="font-inter text-xs text-safari-400 tracking-widest uppercase">Safaris</span>
              </div>
            </div>
            <p className="font-inter text-gray-400 text-sm leading-relaxed mb-6">
              {t.footer.description}
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: '#' },
                { icon: <Instagram className="w-4 h-4" />, href: '#' },
                { icon: <Twitter className="w-4 h-4" />, href: '#' },
                { icon: <Youtube className="w-4 h-4" />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 bg-gray-800 hover:bg-safari-500 rounded-full flex items-center justify-center transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-base mb-5">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-inter text-sm text-gray-400 hover:text-safari-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-safari-500 rounded-full flex-shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-base mb-5">{t.footer.contact}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-safari-400 mt-0.5 flex-shrink-0" />
                <span className="font-inter text-sm text-gray-400">{t.footer.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-safari-400 flex-shrink-0" />
                <a href={`tel:${t.footer.phone}`} className="font-inter text-sm text-gray-400 hover:text-safari-400 transition-colors">
                  {t.footer.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-safari-400 flex-shrink-0" />
                <a href={`mailto:${t.footer.email}`} className="font-inter text-sm text-gray-400 hover:text-safari-400 transition-colors">
                  {t.footer.email}
                </a>
              </li>
            </ul>

            {/* Language indicator */}
            <div className="mt-6">
              <p className="font-inter text-xs text-gray-500 mb-2">24H Assistance:</p>
              <div className="flex gap-2">
                {['🇬🇧 EN', '🇮🇹 IT', '🇫🇷 FR'].map(lang => (
                  <span key={lang} className="font-inter text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-base mb-5">Watamu, Kenya</h4>
            <div className="rounded-xl overflow-hidden h-40 bg-gray-800 border border-gray-700">
              <iframe
                title="Watamu Kenya Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63788.26!2d40.0167!3d-3.3527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x181bbe4d05e60c67%3A0x17a1e23d02e52c80!2sWatamu!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="font-inter text-xs text-gray-500 text-center">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
