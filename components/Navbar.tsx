'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, ChevronDown, Anchor, User, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import type { Locale } from '@/lib/i18n';

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
];

export default function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const { user, signOut, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'signin' | 'signup' }>({ open: false, mode: 'signin' });

  // OPTIMIZED: passive scroll + throttled
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const close = () => { setIsLangOpen(false); setIsUserMenuOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const navLinks = useMemo(() => [
    { label: t.nav.home, href: '#home' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.tours, href: '#tours' },
    { label: t.nav.excursions, href: '#excursions' },
    { label: t.nav.transfers, href: '#transfers' },
    { label: t.nav.contact, href: '#contact' },
  ], [t]);

  const currentLang = useMemo(() => languages.find(l => l.code === locale)!, [locale]);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = href;
    }
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo - Prominent BAHARI ASILI SAFARIS branding */}
            <Link href="#home" onClick={(e) => handleNavClick(e as any, '#home')} className="flex items-center gap-2.5 group flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isScrolled ? 'bg-safari-500' : 'bg-gradient-to-br from-safari-500 to-safari-600'}`}>
                <Anchor className="w-5.5 h-5.5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`font-poppins font-black text-sm sm:text-base leading-tight transition-colors ${isScrolled ? 'text-ocean-700' : 'text-white'}`}>
                  BAHARI ASILI
                </span>
                <span className={`font-inter text-xs font-bold tracking-wide uppercase transition-colors ${isScrolled ? 'text-safari-500' : 'text-safari-300'}`}>
                  Safaris
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden xl:flex items-center gap-6">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`nav-link font-inter font-medium text-sm transition-colors pb-0.5 cursor-pointer ${
                    isScrolled? 'text-gray-700 hover:text-ocean-700' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden xl:flex items-center gap-3">
              {/* Language Switcher */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center gap-1.5 font-inter text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                    isScrolled
                     ? 'border-gray-200 text-gray-700 hover:border-ocean-600 hover:text-ocean-700 bg-white'
                      : 'border-white/30 text-white hover:border-white bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden z-50 min-w-">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code); setIsLangOpen(false); }}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-inter hover:bg-sand-100 transition-colors ${
                          locale === lang.code? 'text-ocean-700 font-semibold bg-sand-50' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth */}
              {!loading && (
                user? (
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center gap-2 font-inter text-sm font-semibold px-4 py-2 rounded-full border-2 transition-all ${
                        isScrolled
                         ? 'border-ocean-700 text-ocean-700 hover:bg-ocean-700 hover:text-white bg-white'
                          : 'border-white text-white hover:bg-white hover:text-ocean-700'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-safari-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      My Account
                      <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen? 'rotate-180' : ''}`} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-inter font-semibold text-gray-900 text-sm truncate">{displayName}</p>
                          <p className="font-inter text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-2 w-full px-4 py-3 text-sm font-inter text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          My Account
                        </Link>
                        <button
                          onClick={() => { signOut(); setIsUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-sm font-inter text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAuthModal({ open: true, mode: 'signin' })}
                      className={`font-inter text-sm font-medium px-4 py-2 rounded-full transition-all ${
                        isScrolled
                         ? 'text-gray-700 hover:text-ocean-700'
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthModal({ open: true, mode: 'signup' })}
                      className={`font-inter text-sm font-semibold px-5 py-2 rounded-full border-2 transition-all ${
                        isScrolled
                         ? 'border-ocean-700 text-ocean-700 hover:bg-ocean-700 hover:text-white'
                          : 'border-white text-white hover:bg-white hover:text-ocean-700'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="xl:hidden flex items-center gap-3">
              <div className="flex gap-1.5">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`text-xs font-inter font-semibold px-2 py-1 rounded-lg transition-all ${
                      locale === lang.code
                       ? 'bg-safari-500 text-white'
                        : isScrolled? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={`p-2 rounded-lg ${isScrolled? 'text-gray-700' : 'text-white'}`}
              >
                {isMobileOpen? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileOpen && (
            <div className="xl:hidden mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2">
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block py-2.5 px-3 font-inter font-medium text-gray-700 hover:text-ocean-700 hover:bg-sand-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                {user? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileOpen(false)}
                      className="block text-center font-inter text-sm font-semibold px-4 py-2.5 bg-ocean-700 text-white rounded-xl"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full text-center font-inter text-sm font-medium px-4 py-2.5 border border-red-200 text-red-600 rounded-xl"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsMobileOpen(false); setAuthModal({ open: true, mode: 'signin' }); }}
                      className="block w-full text-center font-inter text-sm font-medium px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setIsMobileOpen(false); setAuthModal({ open: true, mode: 'signup' }); }}
                      className="block w-full text-center font-inter text-sm font-semibold px-4 py-2.5 bg-ocean-700 text-white rounded-xl"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, mode: 'signin' })}
        defaultMode={authModal.mode}
      />
    </>
  );
}
