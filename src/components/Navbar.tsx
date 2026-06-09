import React, { useState } from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Globe, Menu, X, ShieldAlert, Award } from 'lucide-react';

interface NavbarProps {
  currentLocale: Locale;
  setLocale: (l: Locale) => void;
  currentView: string;
  setView: (v: string) => void;
  websiteLogoImage?: string;
}

export default function Navbar({
  currentLocale,
  setLocale,
  currentView,
  setView,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';

  const menuItems = [
    { id: 'home', labelKey: 'navHome' },
    { id: 'about', labelKey: 'navAbout' },
    { id: 'collections', labelKey: 'navCollections' },
    { id: 'portfolio', labelKey: 'navPortfolio' },
    { id: 'wholesale', labelKey: 'navWholesale' },
    { id: 'custom', labelKey: 'navCustom' },
    { id: 'blog', labelKey: 'navBlog' },
    { id: 'contact', labelKey: 'navContact' },
    { id: 'track', labelKey: 'navTrack' },
  ];

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'fa', label: 'Dari / Farsi', native: 'دری' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
  ];

  const handleNavClick = (viewId: string) => {
    setView(viewId);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLanguage = languages.find((l) => l.code === currentLocale);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2A1E17] text-gray-200 uppercase tracking-widest text-xs font-sans h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-2 text-left group focus:outline-none"
        >
          <div className="border border-[#C5A880]/60 p-2 rounded-sm group-hover:border-[#EED6A3] transition-colors duration-500">
            <Award className="h-5 w-5 text-[#C5A880] group-hover:text-[#EED6A3] transition-colors duration-500" />
          </div>
          <div>
            <div className="font-serif text-sm tracking-widest text-[#C5A880] group-hover:text-[#EED6A3] font-medium transition-colors duration-500">
              {getTranslation('brandNameShort', currentLocale)}
            </div>
            <div className="text-[9px] text-gray-500 tracking-[0.2em] lowercase italic">
              handcrafted heritage
            </div>
          </div>
        </button>

        {/* DESKTOP NAV ITEMS */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative py-2 px-1 hover:text-[#EED6A3] transition-colors duration-300 pointer font-medium tracking-[0.15em] ${
                currentView === item.id ? 'text-[#C5A880]' : 'text-gray-400'
              }`}
            >
              {getTranslation(item.labelKey, currentLocale)}
              {currentView === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A880]" />
              )}
            </button>
          ))}
        </div>

        {/* RIGHT ACTION: ACCORDION LANG & ADMIN LINK */}
        <div className="flex items-center space-x-3">
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 border border-[#2A1E17] hover:border-[#C5A880]/50 py-2 px-3 rounded-sm text-gray-300 hover:text-[#EED6A3] transition-all cursor-pointer bg-[#101010]"
            >
              <Globe className="h-3.5 w-3.5 text-[#C5A880]" />
              <span className="text-[10px] hidden sm:inline tracking-wider font-semibold">
                {activeLanguage?.native}
              </span>
            </button>

            {langDropdownOpen && (
              <div
                className={`absolute ${
                  isRtl ? 'left-0' : 'right-0'
                } mt-2 w-40 rounded-sm bg-[#121212] border border-[#2A1E17] shadow-xl overflow-hidden`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code as Locale);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[11px] font-sans tracking-widest hover:bg-[#1C1612] hover:text-[#EED6A3] transition-colors flex justify-between items-center ${
                      currentLocale === lang.code ? 'text-[#C5A880] bg-[#17120F]' : 'text-gray-400'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[10px] text-gray-500 font-serif lowercase italic">{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ADMIN ATELIER BUTTON */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`border px-3 py-2 text-[10px] tracking-widest font-semibold rounded-sm transition-all focus:outline-none ${
              currentView === 'admin'
                ? 'bg-[#C5A880] border-[#C5A880] text-black'
                : 'bg-transparent border-[#4E3629] text-[#C5A880] hover:bg-[#C5A880]/10 hover:border-[#C5A880]'
            }`}
          >
            {getTranslation('navAdmin', currentLocale)}
          </button>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-md hover:bg-[#161616]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE NAV DROPDOWN */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0A0A0A]/95 border-b border-[#2A1E17] shadow-2xl transition-all duration-300 py-4 px-6 flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-left py-2 text-xs tracking-widest font-sans border-b border-[#1A1A1A] pb-2 ${
                currentView === item.id ? 'text-[#C5A880] font-bold' : 'text-gray-400 hover:text-[#EED6A3]'
              }`}
            >
              {getTranslation(item.labelKey, currentLocale)}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
