import React from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Phone, Mail, MapPin, Award, ArrowUp, Send } from 'lucide-react';

interface FooterProps {
  currentLocale: Locale;
  setView: (v: string) => void;
  contactSettings?: {
    primaryWhatsApp: string;
    secondaryWhatsApp: string;
    phone: string;
    email: string;
  };
}

export default function Footer({
  currentLocale,
  setView,
  contactSettings = {
    primaryWhatsApp: '+93749274000',
    secondaryWhatsApp: '+447401147446',
    phone: '+93777296023',
    email: 'nuristaniwood@gmail.com',
  },
}: FooterProps) {
  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';

  const formatWhatsAppLink = (number: string) => {
    const cleanNum = number.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNum}`;
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-[#2A1E17] text-gray-400 font-sans mt-20">
      {/* Brand highlight banner */}
      <div className="border-b border-[#1C130D]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Award className="h-6 w-6 text-[#C5A880] shrink-0" />
            <p className="text-[11px] tracking-widest uppercase font-semibold text-gray-300">
              {getTranslation('brandName', currentLocale)}
            </p>
          </div>
          <button
            onClick={handleBackToTop}
            className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#C5A880] hover:text-[#EED6A3] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        
        {/* EDITORIAL DESCRIPTION */}
        <div className="md:col-span-1 space-y-4">
          <div className="font-serif text-[#C5A880] text-lg tracking-widest">
            {getTranslation('brandNameShort', currentLocale)}
          </div>
          <p className="text-xs leading-relaxed text-gray-500 font-light">
            {currentLocale === 'en' && 'Preserving the ancient geometrical linguistics of the Hindu Kush. Sculpting heritage, family logs, bridal dowry chests, and custom timber architectural panels completely by hand.'}
            {currentLocale === 'fa' && 'پاسداری از نمادشناسی‌های ریاضی هندسه کهن هندوکش بر تار و پود کارهای چوبی سنتی ماندگار؛ شامل صندوق‌های عروس مجلل، درهای تشریفاتی و کرسی‌ها.'}
            {currentLocale === 'ar' && 'نحت الصناديق التراثية الفاخرة للعرائس، والفاصل الهندسي، والأثاث التراثي المخصص لقصور الفولكلور الشرقي في كابول ونورستان.'}
          </p>
        </div>

        {/* BRANDS & COLLECTIONS */}
        <div className="space-y-4">
          <h4 className="text-[11px] tracking-wider uppercase font-semibold text-gray-300">Atelier Lines</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setView('collections')} className="hover:text-[#EED6A3] transition-colors">
                {getTranslation('categoryHeritage', currentLocale)}
              </button>
            </li>
            <li>
              <button onClick={() => setView('collections')} className="hover:text-[#EED6A3] transition-colors">
                {getTranslation('categoryRoyal', currentLocale)}
              </button>
            </li>
            <li>
              <button onClick={() => setView('collections')} className="hover:text-[#EED6A3] transition-colors">
                {getTranslation('categorySignature', currentLocale)}
              </button>
            </li>
            <li>
              <button onClick={() => setView('custom')} className="hover:text-[#EED6A3] transition-colors text-[#C5A880]">
                {getTranslation('categoryCustom', currentLocale)}
              </button>
            </li>
          </ul>
        </div>

        {/* EXPLORE DIRECTORIES */}
        <div className="space-y-4">
          <h4 className="text-[11px] tracking-wider uppercase font-semibold text-gray-300">Preservation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setView('about')} className="hover:text-[#EED6A3] transition-colors">
                Our Timeline
              </button>
            </li>
            <li>
              <button onClick={() => setView('portfolio')} className="hover:text-[#EED6A3] transition-colors">
                Collaborative Commissions
              </button>
            </li>
            <li>
              <button onClick={() => setView('blog')} className="hover:text-[#EED6A3] transition-colors">
                Atelier Chronicles & Research
              </button>
            </li>
            <li>
              <button onClick={() => setView('wholesale')} className="hover:text-[#EED6A3] transition-colors">
                Wholesale Inquiry & Catalog
              </button>
            </li>
          </ul>
        </div>

        {/* PRIMARY CONTACT DETAILS */}
        <div className="space-y-4">
          <h4 className="text-[11px] tracking-wider uppercase font-semibold text-gray-300">The Ateliers</h4>
          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span className="text-gray-400 font-light text-xs">
                {currentLocale === 'en' ? 'Exclusive Showrooms in Kabul & Nuristan valleys, Afghanistan.' : ''}
                {currentLocale === 'fa' ? 'شعبه اصلی و نمایشگاه در کابل و کارگاه‌های مرجع در ولایت نورستان، افغانستان.' : ''}
                {currentLocale === 'ar' ? 'صالات عرض حصرية في كابول وورش صياغة ونقش في مرتفعات نورستان، أفغانستان.' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-[#C5A880] shrink-0" />
              <a href={`mailto:${contactSettings.email}`} className="hover:text-white transition-colors">
                {contactSettings.email}
              </a>
            </div>
            
            {/* Primary line ring */}
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#C5A880] shrink-0" />
              <a href={`tel:${contactSettings.phone}`} className="hover:text-white transition-colores font-serif">
                {contactSettings.phone}
              </a>
            </div>

            {/* Quick WhatsApp Channels Links */}
            <div className="pt-2 border-t border-[#1C130D]">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1.5">Direct WhatsApp channels</p>
              <div className="flex flex-col space-y-1.5">
                <a
                  href={formatWhatsAppLink(contactSettings.primaryWhatsApp)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#C5A880] hover:text-[#EED6A3] transition-colors font-medium flex items-center gap-1"
                >
                  <span>Primary Desk:</span>
                  <span className="font-serif text-[10px] text-gray-400 font-light">{contactSettings.primaryWhatsApp}</span>
                </a>
                <a
                  href={formatWhatsAppLink(contactSettings.secondaryWhatsApp)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#C5A880] hover:text-[#EED6A3] transition-colors font-medium flex items-center gap-1"
                >
                  <span>International:</span>
                  <span className="font-serif text-[10px] text-gray-400 font-light">{contactSettings.secondaryWhatsApp}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Copy copyright */}
      <div className="border-t border-[#1A110D] bg-[#020202]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-600 tracking-wider">
          <p>{getTranslation('footerDisclaimer', currentLocale)}</p>
          <p className="font-serif">© 2026 Nuristani Wood Handcrafts (NWH)</p>
        </div>
      </div>
    </footer>
  );
}
