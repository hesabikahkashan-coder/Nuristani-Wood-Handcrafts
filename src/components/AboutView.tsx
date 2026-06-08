import React from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Award, Trees, Landmark, Sparkles, BookOpen } from 'lucide-react';

interface AboutViewProps {
  currentLocale: Locale;
  setView: (v: string) => void;
}

export default function AboutView({ currentLocale, setView }: AboutViewProps) {
  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  const timelineEvents = [
    {
      year: '1896',
      title: {
        en: 'The Valley Transition',
        fa: 'برآمدن نام نورستان',
        ar: 'تأسيس الاسم التاريخي'
      },
      desc: {
        en: 'Historically known as Kafiristan, the region is renamed Nuristan ("Land of Light"). The isolated valleys maintain their distinct architectural geospacial mathematics carved on massive cedar wood pillars.',
        fa: 'منطقه کافرستان تاریخی به نورستان («سرزمین نور») تغییر نام یافت. دره‌های منزوی کوهستان طرح‌های معماری نجومی و نمادهای مادری منحصر به فرد خود را بر ستون‌های قطور سدر حفظ کردند.',
        ar: 'المنطقة الجغرافية المعروفة باسم كافرستان تحتفظ بحساباتها الهندسية المتميزة المنقوشة في الأرز البري.'
      }
    },
    {
      year: '1974',
      title: {
        en: 'Generational Craft Ledger',
        fa: 'آغاز دفتر خانوادگی کارگاه',
        ar: 'بدء السجل التوريثي للعائلة'
      },
      desc: {
        en: 'Satarullah Nooristani establishes the family ledger in Kabul, marrying complex geometric lattices with traditional wedding dowry chest caskets, forming NWH Heritage guidelines.',
        fa: 'استاد ستارالله نورستان دفتر کارگاه خانوادگی را در کابل بنا نهاد. او مشبک‌های هندسی پیچیده را با صندوق‌های مهریه سنتی تلفیق کرد.',
        ar: 'الجد الأكبر يفتتح ورشة العائلة لنقش الصناديق الملكية في كابل.'
      }
    },
    {
      year: '2004',
      title: {
        en: 'International Global Exhibitions',
        fa: 'نمایشگاه‌های بین‌المللی هنر',
        ar: 'المعارض الدولية'
      },
      desc: {
        en: 'Nuristani masterworks are featured in cultural preservation exhibits in Berlin and London, drawing luxury interest from global architects.',
        fa: 'آثار نفیس چوبی چکش‌خورده نورستان در گالری‌های برلین و لندن به نمایش درآمد و مورد توجه معماران طراح کاخ‌ها قرار گرفت.',
        ar: 'الروائع النقشية تجذب اهتمام المهندسين والمتاحف الأوروبية في برلين.'
      }
    },
    {
      year: '2026',
      title: {
        en: 'Modern Atelier Digital Era',
        fa: 'عصر نوین کارگاه دیجیتال',
        ar: 'العصر الرقمي التراثي'
      },
      desc: {
        en: 'Under Shafiqullah Nooristani, NWH integrates encrypted digital order pipelines (HesabPay, USDT wallets) alongside traditional Western Union delivery structures to serve estates worldwide.',
        fa: 'تحت مدیریت استاد شفیق‌الله نورستانی، صنایع دستی نورستان روش‌های پرداخت امن مدرن کریپتویی و حساب‌پی را در کنار شیوه سنتی ارسال هوایی فعال کرد.',
        ar: 'إدارة الورشة المباشرة تجمع بين صياغة القطع النادرة والشحن الجوي الجمركي الآمن.'
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-24 animate-fadeIn font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <section className="text-center space-y-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">oral histories from the valleys</span>
        <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">The NWH Chronicle</h1>
        <p className="text-xs text-gray-500 max-w-xl mx-auto font-light tracking-wide italic mt-2">
          Preserving ancient geometrical languages of the Hindu Kush mountains since generations.
        </p>
        <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
      </section>

      {/* HISTORIC OVERVIEW LAYOUT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-center">
        
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-gray-500">ancestry and soil</span>
            <h2 className="font-serif text-2xl text-gray-200 uppercase tracking-wide">Sacred Astronomy on Timber</h2>
          </div>
          
          <p className="text-xs text-gray-400 leading-relaxed font-light font-sans tracking-wide">
            {currentLocale === 'en' && 'For centuries, the isolated Nuristan valleys nestled deep in the Hindu Kush mountains of Afghanistan remained self-sufficient. Lacking writing paper, the ancestors developed a visual linguistic system—representing historical logs, stargazing charts, bridal dowry lines, and family milestones directly onto slow-growth Himalayan timber.'}
            {currentLocale === 'fa' && 'مردم دره‌های کوهستانی سرسخت نورستان در اعماق هندوکش برای قرن‌ها سیستم مکتوبی نداشتند. نیاکان ما به جای کاغذ، یک خط تصویری و هندسی پیچیده ابداع کردند؛ تبارنامه‌ها، نقشه‌های نجومی طالع‌بینی کوهستان، پیوندهای تاریخی قبیله‌ای و مهریه‌های سنتی را بر چوب‌های کهنسال تراشیدند.'}
            {currentLocale === 'ar' && 'عقود من العزلة في مرتفعات هندوكش أنتجت خطاً ورموزاً بصرية تترجم الفولكلور والنبوءات السنوية وعلاقة الإنسان بالطبيعة على الأخشاب العريقة.'}
          </p>

          <p className="text-xs text-gray-400 leading-relaxed font-light font-sans tracking-wide">
            {currentLocale === 'en' && 'To own a Nuristani woodcraft is not simply adding furniture to an estate. It is hosting an authentic, non-replicable mathematical chronicle designed entirely by mouth-to-ear secrets passed down from master to apprentice.'}
            {currentLocale === 'fa' && 'تملک یک اثر نفیس چوبی نورستان، صرفا به معنای داشتن مبلمان یا وسیله دکوری نیست؛ بلکه به معنی میزبانی از تبارنامه مصور و رازهای کهنی است که نسل به نسل از سینه استاد به شاگردان منتقل شده است.'}
            {currentLocale === 'ar' && 'اقتناء روائع خشب نورستان هو استضافة مخطوطة رياضية حية محفورة بالأيدي المتعبة لأساتذة النقش والزخرفة.'}
          </p>

          <div className="pt-4 flex gap-4">
            <button
              onClick={() => setView('collections')}
              className="bg-[#C5A880] text-black text-[10px] tracking-widest font-bold uppercase py-2.5 px-6 rounded-sm hover:bg-[#EED6A3] transition-colors cursor-pointer"
            >
              Browse Collections
            </button>
            <button
              onClick={() => setView('portfolio')}
              className="border border-[#4E3629] text-gray-400 text-[10px] tracking-widest font-bold uppercase py-2.5 px-6 rounded-sm hover:border-[#C5A880] transition-colors cursor-pointer"
            >
              View Finished Projects
            </button>
          </div>
        </div>

        {/* Beautiful visual bento grid showcasing values */}
        <div className="bg-[#0D0D0D] border border-[#231710] p-8 rounded-sm space-y-6">
          <h3 className="font-serif text-[#C5A880] uppercase tracking-widest text-lg">Our Preservation Vows</h3>
          
          <div className="space-y-4 text-xs font-sans">
            <div className="flex gap-3">
              <Trees className="h-5 w-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-gray-200 font-semibold uppercase tracking-wider">Slow-Cured Sourcing</h4>
                <p className="text-gray-500 font-light mt-0.5 text-[11px]">We ethically source mountain walnuts and cedars cured naturally over several seasons to secure crack-prevention.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Landmark className="h-5 w-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-gray-200 font-semibold uppercase tracking-wider">Mathematical Precision</h4>
                <p className="text-gray-500 font-light mt-0.5 text-[11px]">We follow strict ancient astronomical guidelines where each circle, dot, and star has geometric alignment.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <BookOpen className="h-5 w-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-gray-200 font-semibold uppercase tracking-wider">Zero Machine Standard</h4>
                <p className="text-gray-500 font-light mt-0.5 text-[11px]">No routers, no laser cutters, no mass-production. Everything is built on slower schedules of 12-16 weeks per piece.</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* HISTORIC CHRONOLOGY TIMELINE */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-bold">the heritage map</span>
          <h3 className="font-serif text-2xl uppercase tracking-widest text-gray-200">Historical Chronology</h3>
          <div className="w-12 h-[1px] bg-[#C5A880] mx-auto mt-4" />
        </div>

        <div className="relative border-l border-[#2A1E17] ml-2 md:ml-32 pl-6 md:pl-8 space-y-12">
          {timelineEvents.map((ev, idx) => (
            <div key={idx} className="relative space-y-2">
              
              {/* Year badge circle */}
              <div className="absolute -left-[35px] md:-left-[43px] top-1.5 h-6 w-16 bg-[#151210] border border-[#C5A880] rounded flex items-center justify-center text-[#C5A880] text-[10px] tracking-widest font-mono font-bold shadow">
                {ev.year}
              </div>

              <div className={textDirectionClass}>
                <h4 className="text-gray-200 font-serif font-semibold text-lg">{ev.title[currentLocale]}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light mt-1 font-sans max-w-3xl">
                  {ev.desc[currentLocale]}
                </p>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
