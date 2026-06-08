import React from 'react';
import { Locale } from '../types';
import { Award, Compass, Eye, Map, Layers } from 'lucide-react';

interface PortfolioViewProps {
  currentLocale: Locale;
}

export default function PortfolioView({ currentLocale }: PortfolioViewProps) {
  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  const projects = [
    {
      title: {
        en: 'The Royal Cedar Partitions, Kabul Palace',
        fa: 'پارتیشن‌های مشبک شاهانه، ارگ کابل',
        ar: 'فواصل الأرز الملكية، قصر كابل'
      },
      client: {
        en: 'Presidency Cultural Wing',
        fa: 'واحد فرهنگی مجمع کاخ ریاست‌جمهوری',
        ar: 'الرئاسة الثقافية التراثية'
      },
      wood: 'Himalayan wild cedar (slow-cured)',
      desc: {
        en: 'A massive 12-meter structural dividers carved completely on both sides, featuring the ancestral mathematical interlocking star lattice.',
        fa: 'دیوار تقسیم متحرک ۱۲ متری مشبک؛ کنده‌کاری دورو با گره تند هشت و طالع نجومی قدیم که بیش از ۱۰ ماه به طول انجامید.',
        ar: 'جدار مجهز بزخارف حية متفاعلة استغرق صياغتها ونحتها طوال تسعة أشهر.'
      },
      image: "/src/assets/images/nuristani_carving_detail_1780946369156.png"
    },
    {
      title: {
        en: 'Hand-carved Dining Suite, London Estate',
        fa: 'ست ناهارخوری شاه‌نشین، عمارت لندن',
        ar: 'غرفة الطعام الفاخرة، قصر لندن'
      },
      client: {
        en: 'Private Curator Collecion',
        fa: 'مجموعه‌دار هنر بین‌المللی',
        ar: 'معرض الأنتيك الخاص'
      },
      wood: 'Mountain Old-tree Walnut',
      desc: {
        en: 'A bespoke dining table paired with 12 custom high-back royal chairs featuring micro-chipped heraldry carvings.',
        fa: 'میز غذاخوری مجلل همراه با ۱۲ صندلی شاه‌نشین با کنده‌کاری‌های مینیاتوری برجسته که بر چوب گردوی کهنسال تراشیده شدند.',
        ar: 'طاولة طعام ملكية مجهزة بـ ١٢ مقعداً كلاسيكياً عتيقاً ملائماً للتصاميم المعمارية اللندنية.'
      },
      image: "/src/assets/images/nuristani_royal_chair_1780946348930.png"
    },
    {
      title: {
        en: 'The Ceremonial Dowry Portal, Dubai Residence',
        fa: 'درگاه صندوق مهریه مجلل، پاویون دبی',
        ar: 'بوابة الصندوق التراثي، دبي الفاخرة'
      },
      client: {
        en: 'Private Estate Interior',
        fa: 'طراحی عمارت ویژه در دبی',
        ar: 'مجمع الفنادق التراثية بالخليج'
      },
      wood: 'Aromatic Deodar Wood',
      desc: {
        en: 'A bespoke entrance commission echoing Kafiristan archaic cosmology geometry with antique brass locks.',
        fa: 'تراش اختصاصی ورودی لابی با الهام از نمادهای خورشیدی باستان کافرستان مجهز به کلون‌های برنجی پتینه‌کاری.',
        ar: 'بوابة فخمة تجسد هندسة العصور السحيقة برائحة خشب ديودار النفاذة المانعة للحشرات.'
      },
      image: "/src/assets/images/nuristani_hero_casket_1780946329749.png"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 animate-fadeIn font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <section className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">preservation installations log</span>
        <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">The Commission Portfolio</h1>
        <p className="text-xs text-gray-500 max-w-xl mx-auto font-light leading-relaxed mt-2">
          A showcase of completed museum installations, bespoke state assemblies, and private residential architectural carvings.
        </p>
        <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
      </section>

      {/* PORTFOLIO GRID COLUMNS */}
      <section className="space-y-12">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="bg-[#0D0D0D] border border-[#231711] overflow-hidden rounded-sm transition-all shadow-xl grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Visual cover col */}
            <div className="lg:col-span-4 h-64 lg:h-auto min-h-[250px] relative">
              <img
                src={proj.image}
                alt=""
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-transparent hidden lg:block" />
            </div>

            {/* Detailed text col */}
            <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between space-y-6">
              
              <div className={`space-y-4 ${textDirectionClass}`}>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-[#C5A880] tracking-widest font-semibold">{proj.client[currentLocale]}</span>
                  <h3 className="font-serif text-lg md:text-xl text-gray-200 uppercase tracking-wide leading-snug">{proj.title[currentLocale]}</h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-light font-sans max-w-2xl">
                  {proj.desc[currentLocale]}
                </p>
              </div>

              {/* Attributes line */}
              <div className="pt-4 border-t border-[#1C130D] flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-500 font-sans">
                <div>
                  <span className="uppercase text-[9px] text-gray-600 block mb-0.5">timber specification</span>
                  <span className="font-semibold text-gray-300 font-serif italic">{proj.wood}</span>
                </div>
                <div>
                  <span className="uppercase text-[9px] text-gray-600 block mb-0.5">preservation score</span>
                  <span className="font-bold text-[#C5A880] tracking-widest uppercase flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span>Pure Handcrafted</span>
                  </span>
                </div>
              </div>

            </div>

          </div>
        ))}
      </section>

    </div>
  );
}
