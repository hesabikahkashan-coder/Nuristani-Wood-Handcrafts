import React from 'react';
import { Product, Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Award, Compass, Map, ShieldCheck, CornerDownRight, Gem } from 'lucide-react';

interface HomeViewProps {
  currentLocale: Locale;
  setView: (v: string) => void;
  products: Product[];
  heroHeadline: { en: string; fa: string; ar: string };
  heroSubheadline: { en: string; fa: string; ar: string };
}

export default function HomeView({
  currentLocale,
  setView,
  products,
  heroHeadline,
  heroSubheadline
}: HomeViewProps) {
  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  // Get active featured products, fallback to first 2
  const featured = products.filter(p => p.featured).slice(0, 3);
  const activePromoList = featured.length > 0 ? featured : products.slice(0, 3);

  const heroImage = "/src/assets/images/nuristani_hero_casket_1780946329749.png";
  const secondPromoImage = "/src/assets/images/nuristani_royal_chair_1780946348930.png";
  const detailImage = "/src/assets/images/nuristani_carving_detail_1780946369156.png";

  return (
    <div className="space-y-24 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* CINEMATIC EDITORIAL HERO BANNER */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background photo with subtle zoom transition */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Handcrafted Nuristani Woodcarving"
            className="w-full h-full object-cover opacity-35 scale-105 animate-subtleZoom"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette filter gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 select-none">
          <div className="inline-flex items-center space-x-2 border border-[#C5A880]/30 py-1.5 px-4 rounded-full bg-[#101010]/75 backdrop-blur-sm">
            <Gem className="h-4 w-4 text-[#C5A880] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#EED6A3] font-sans font-semibold">
              {currentLocale === 'en' && 'Exclusive Handcrafted Artistry'}
              {currentLocale === 'fa' && 'هنر کنده‌کاری فاخر و بومی'}
              {currentLocale === 'ar' && 'الفن والحفر اليدوي الفاخر'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-light text-gray-100 uppercase tracking-[0.1em] leading-tight max-w-4xl mx-auto">
            {heroHeadline[currentLocale] || heroHeadline['en']}
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 font-sans tracking-wide max-w-2xl mx-auto font-light leading-relaxed">
            {heroSubheadline[currentLocale] || heroSubheadline['en']}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 text-xs">
            <button
              onClick={() => setView('collections')}
              className="w-full sm:w-auto bg-[#C5A880] text-black font-semibold uppercase tracking-widest px-8 py-4.5 rounded-sm hover:bg-[#EED6A3] transition-all duration-300 shadow shadow-[#C5A880]/15 cursor-pointer"
            >
              {getTranslation('exploreCollections', currentLocale)}
            </button>
            <button
              onClick={() => setView('custom')}
              className="w-full sm:w-auto border border-[#4E3629] text-gray-200 uppercase tracking-widest px-8 py-4.5 rounded-sm hover:bg-white/5 hover:border-[#C5A880] transition-all duration-300 cursor-pointer bg-[#0A0A0A]/40 backdrop-blur-sm"
            >
              {getTranslation('customOrderCTA', currentLocale)}
            </button>
          </div>
        </div>

        {/* Scrolling helper tag */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-1.5 opacity-60">
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-light font-sans">scroll archive</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#C5A880] to-transparent animate-pulse" />
        </div>
      </section>

      {/* MASTER STANDARDS & HERITAGE NARRATIVE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
          
          {/* Detailed Image box with geometric framing */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 border border-[#C5A880]/20 translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500 rounded-sm" />
            <div className="relative border border-[#2A1E17] bg-[#121212] overflow-hidden rounded-sm">
              <img
                src={detailImage}
                alt="Intricate wood carving geometry details"
                className="w-full h-[450px] object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Core Text Narrative content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-sans font-bold">preservation ledger</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-gray-200 uppercase tracking-widest leading-tight">
                {getTranslation('craftsmanshipTitle', currentLocale)}
              </h2>
            </div>

            <p className="text-[#C5A880] font-serif italic text-lg leading-relaxed max-w-2xl">
              {currentLocale === 'en' && '“No drawing models, no synthetic calipers. Our carvers sculpt mathematical astronomy into mountain timber from pure oral family archives.”'}
              {currentLocale === 'fa' && '«بدون طرح‌های الگو و خط‌کش‌های صنعتی؛ چوب‌تراشان ما نقش‌های برخاسته از رمزهای ستارگان و آیین‌های مادری را مستقیم بر تنه چوب وحشی حک می‌کنند.»'}
              {currentLocale === 'ar' && '«دون خطوط مسبقة أو قوالب رقمية. ينحت أستاذنا النقوش الحية لنجوم السماء وسلسلة الفولكلور استناداً لأساليب الأجداد الشفهية الرائعة.»'}
            </p>

            <p className="text-xs text-gray-400 font-sans tracking-wide leading-relaxed font-light">
              {getTranslation('craftsmanshipText', currentLocale)}
            </p>

            {/* Ancestral values list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-xs font-sans">
              <div className="flex gap-3">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <div className={textDirectionClass}>
                  <h4 className="text-gray-300 font-bold uppercase tracking-wider">No-Machine Mandate</h4>
                  <p className="text-gray-500 font-light mt-1 text-[11px]">Strictly chiselled manually using vintage local forging adzes.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <Map className="h-4.5 w-4.5" />
                </div>
                <div className={textDirectionClass}>
                  <h4 className="text-gray-300 font-bold uppercase tracking-wider">Slow-Growth Timbers</h4>
                  <p className="text-gray-500 font-light mt-1 text-[11px]">Ethically harvested mountain walnuts, wild cedars, and ashwoods.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setView('about')}
                className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-[#EED6A3] uppercase tracking-widest font-semibold hover:translate-x-1 transition-all"
              >
                <span>Read NWH Chronicles</span>
                <CornerDownRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* HIGHLIGHTED ATELIER HEIRLOOMS PROMO ROW */}
      <section className="bg-[#050505] border-y border-[#2A1E17] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">exclusive masterpieces</span>
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-widest text-gray-200">Featured Heirlooms</h3>
            <div className="w-12 h-[1px] bg-[#C5A880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activePromoList.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setView('collections')}
                className="bg-[#0A0A0A] border border-[#221711] hover:border-[#C5A880]/40 rounded-sm overflow-hidden group shadow-xl cursor-pointer transition-all duration-500"
              >
                {/* Image card wrapper */}
                <div className="h-72 relative overflow-hidden bg-black/40">
                  <img
                    src={prod.image}
                    alt={prod.title.en}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
                </div>

                {/* Info block card */}
                <div className="p-6 space-y-3 text-center">
                  <span className="text-[9px] uppercase text-[#C5A880] tracking-widest font-semibold">{prod.category} Series</span>
                  <h4 className="font-serif text-base text-gray-200 font-medium group-hover:text-[#EED6A3] transition-colors leading-snug">
                    {prod.title[currentLocale]}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-light truncate max-w-xs mx-auto">
                    {prod.description[currentLocale]}
                  </p>
                  <div className="pt-3 border-t border-[#1C130D]">
                    <span className="text-[10px] text-[#C5A880] uppercase tracking-widest font-bold font-sans">
                      {getTranslation('requestPrice', currentLocale)}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECURE CRAFTSMANSHIP GUARANTEED PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
          <div className="border border-[#221710] rounded-sm p-8 bg-[#0D0D0D]">
            <Award className="h-6 w-6 text-[#C5A880] mx-auto mb-3" />
            <h4 className="text-gray-300 font-semibold uppercase tracking-wider font-sans">Generational Certificate</h4>
            <p className="text-gray-500 leading-relaxed font-light mt-1 text-[11px]">Every heritage artifact bears the signature branding and wood-stamp of Shafiqullah Nooristani.</p>
          </div>

          <div className="border border-[#221710] rounded-sm p-8 bg-[#0D0D0D]">
            <Compass className="h-6 w-6 text-[#C5A880] mx-auto mb-3" />
            <h4 className="text-gray-300 font-semibold uppercase tracking-wider font-sans">Custom Blueprint Layout</h4>
            <p className="text-gray-500 leading-relaxed font-light mt-1 text-[11px]">We design physical dimensions according to your estate doors, fireplaces, walls or dining rooms.</p>
          </div>

          <div className="border border-[#221710] rounded-sm p-8 bg-[#0D0D0D]">
            <ShieldCheck className="h-6 w-6 text-[#C5A880] mx-auto mb-3" />
            <h4 className="text-gray-300 font-semibold uppercase tracking-wider font-sans">Secure Air Freight</h4>
            <p className="text-gray-500 leading-relaxed font-light mt-1 text-[11px]">Insured shipping wrapped inside thick wooden crates directly to Western capitals and hotels.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
