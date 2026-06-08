import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Locale, Product, BlogPost, WebsiteSettings, Inquiry, Order } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiAssistant from './components/AiAssistant';

// View lazy mounts
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import CollectionsView from './components/CollectionsView';
import PortfolioView from './components/PortfolioView';
import WholesaleView from './components/WholesaleView';
import CustomOrderView from './components/CustomOrderView';
import BlogView from './components/BlogView';
import ContactView from './components/ContactView';
import AdminPanel from './components/AdminPanel';

import { Award, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentLocale, setLocale] = useState<Locale>('en');

  // Unified State ledgers
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Sync state directions with document nodes
  useEffect(() => {
    const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  // Load API Ledgers
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products registry:', e);
    }
  };

  const fetchBlog = async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(data);
      }
    } catch (e) {
      console.error('Failed to load blog entries:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Failed to load portal configuration:', e);
    }
  };

  const loadAllMasterLedgers = async () => {
    setPageLoading(true);
    setLoadError(false);
    try {
      await Promise.all([
        fetchProducts(),
        fetchBlog(),
        fetchSettings()
      ]);
    } catch (err) {
      console.error('Sync failed:', err);
      setLoadError(true);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasterLedgers();
  }, []);

  // Map route pathname to traditional view IDs to preserve component compatibility seamlessly
  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/collections') || path.startsWith('/products')) return 'collections';
    if (path.startsWith('/portfolio')) return 'portfolio';
    if (path.startsWith('/wholesale')) return 'wholesale';
    if (path.startsWith('/custom-order')) return 'custom';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/contact')) return 'contact';
    if (path.startsWith('/admin')) return 'admin';
    return 'home';
  };
  const currentView = getActiveView();

  const setView = (view: string) => {
    switch (view) {
      case 'home': navigate('/'); break;
      case 'about': navigate('/about'); break;
      case 'collections': navigate('/collections'); break;
      case 'portfolio': navigate('/portfolio'); break;
      case 'wholesale': navigate('/wholesale'); break;
      case 'custom': navigate('/custom-order'); break;
      case 'blog': navigate('/blog'); break;
      case 'contact': navigate('/contact'); break;
      case 'admin': navigate('/admin'); break;
      default: navigate('/'); break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pageLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#070707] text-gray-200 font-sans p-6 select-none" dir="ltr">
        <div className="space-y-6 text-center max-w-sm">
          <div className="inline-flex p-4 border border-[#C5A880]/30 rounded-full animate-pulse text-[#C5A880] bg-[#0F0F0F]">
            <Award className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-[#C5A880] text-lg uppercase tracking-widest font-semibold">NWH Woodcraft ledger</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">aligning satellite connections with Kabul...</p>
          </div>
          <div className="flex justify-center pt-2">
            <Loader2 className="h-5 w-5 text-[#C5A880] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#070707] text-gray-200 font-sans p-6" dir="ltr">
        <div className="space-y-4 text-center max-w-md bg-[#0F0F0F] p-8 border border-red-950 rounded-sm shadow-2xl">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <h2 className="font-serif text-lg text-red-300">Sync Pipeline Failure</h2>
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            Unable to fetch product parameters or active credentials. Your dev server is likely rebooting or initializing database files.
          </p>
          <button
            onClick={loadAllMasterLedgers}
            className="bg-[#C5A880] hover:bg-[#EED6A3] text-black text-[10px] tracking-widest font-bold uppercase py-2.5 px-6 rounded cursor-pointer transition-colors"
          >
            Retry Connection Ledger
          </button>
        </div>
      </div>
    );
  }

  // Dynamic SEO calculation per-route (Phase 2 SEO requirement)
  const getRouteSEO = () => {
    const path = location.pathname;
    const isEn = currentLocale === 'en';
    const isFa = currentLocale === 'fa';
    const isAr = currentLocale === 'ar';

    let title = isEn ? 'Premium Luxury Woodcarvings | Nuristani Wood Handcrafts' : isFa ? 'صنایع دستی چوب نورستان | گالری ارگ میراث سنتی' : 'نحت الأثاث والتحف النورستانية الفاخرة | دمشق كابول';
    let description = isEn 
      ? 'Experiencing slow-growth walnut premium geometric relief woodcarving chests, sliding fretwork doors, and heritage Kafiristan astronomical screens.'
      : isFa 
      ? 'تجربه‌ای ماندگار از کارهای دستی نفیس صندوق‌های عروس مجلل، مبل‌های سنتی و کارهای مینیاتوری چوب با اصالت نورستان.'
      : 'نحت يدوي تراثي شرقي لصناديق العرائس الفاخرة، كراسي العرش الفولكلورية والأثاث الهندسي المخصص للقصور الفارهة.';
    
    let ogImage = 'https://ais-pre-xkpnjwuqe5hsiixak5qwqa-316403213147.europe-west2.run.app/assets/brand_cover.jpg';

    // Detail product SEO deep link override
    if (path.startsWith('/products/')) {
      const prodId = path.split('/products/')[1];
      const prod = products.find(p => String(p.id) === prodId || p.slug === prodId);
      if (prod) {
        title = `${prod.title[currentLocale]} | Nuristani Wood Handcrafts`;
        description = prod.description[currentLocale];
        if (prod.image) ogImage = prod.image;
      }
    }
    // Detail blog SEO deep link override
    else if (path.startsWith('/blog/')) {
      const blogSlug = path.split('/blog/')[1];
      const post = blogPosts.find(p => p.slug === blogSlug || String(p.id) === blogSlug);
      if (post) {
        title = `${post.title[currentLocale]} | NWH Chronicles`;
        description = post.excerpt[currentLocale];
        if (post.image) ogImage = post.image;
      }
    }
    // Pages overrides
    else if (path.startsWith('/about')) {
      title = isEn ? 'Our Heritage & Historic Timeline | NWH' : isFa ? 'خط زمانی میراث و اصالت ما | صنایع چوب نورستان' : 'جدولنا الزمني وتراثنا النورستاني العريق';
    } else if (path.startsWith('/collections')) {
      title = isEn ? 'The Master Catalog & Heritage Register | NWH' : isFa ? 'کاتالوگ جامع محصولات سلطنتی و کلاسیک | صنایع چوب نورستان' : 'السجل الشامل وصالات عرض التحف التراثية';
    } else if (path.startsWith('/portfolio')) {
      title = isEn ? 'Executive Custom Commissioning Register | NWH' : isFa ? 'ثبت سفارش کارهای سفارشی لوکس | صنایع چوب نورستان' : 'لجنة المشاريع الخاصة والتعاون المعماري التراثي';
    } else if (path.startsWith('/wholesale')) {
      title = isEn ? 'Wholesale Atelier Catalogs & Global Logistics | NWH' : isFa ? 'کاتالوگ عمده فروشی و باربری بین‌المللی | صنایع چوب نورستان' : 'توزيع الجملة وعقود الفنادق والمدن السياحية البوتيكية';
    } else if (path.startsWith('/custom-order')) {
      title = isEn ? 'Bespoke Traditional Carpentry Assembly Planner | NWH' : isFa ? 'طراح و سفارش‌دهنده تعاملی سنتی | صنایع چوب نورستان' : 'مخطط التجهيز والتعمير التراثي المخصص لبيتك الفاره';
    } else if (path.startsWith('/blog')) {
      title = isEn ? 'The Atelier Chronicles & Design Conservation Logs' : isFa ? 'رویدادهای هنری و مقالات پژوهشی نجاری | صنایع چوب نورستان' : 'سجلات البحور ونقوش هندسة كابول التراثية';
    } else if (path.startsWith('/contact')) {
      title = isEn ? 'Direct Curator Chat & Kabul Atelier Operations' : isFa ? 'شعبه‌ها و ارتباط مستقیم با استاد شفیق‌الله نورستانی' : 'ارقام الاتصال المباشرة ومواقع الورش والمكاتب الاستشارية';
    } else if (path.startsWith('/admin')) {
      title = 'Secure Administration Terminal | NWH';
    }

    const canonicalUrl = `https://ais-pre-xkpnjwuqe5hsiixak5qwqa-316403213147.europe-west2.run.app${path}`;

    return { title, description, ogImage, canonicalUrl };
  };

  const seo = getRouteSEO();

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-[#B59473]/30 selection:text-[#EED6A3] bg-[#0A0A0A]">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.canonicalUrl} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.ogImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={seo.canonicalUrl} />
        <meta property="twitter:title" content={seo.title} />
        <meta property="twitter:description" content={seo.description} />
        <meta property="twitter:image" content={seo.ogImage} />

        {/* Hreflangs / Canonicals per route and locale direction parameters */}
        <link rel="canonical" href={seo.canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={`${seo.canonicalUrl}?lang=en`} />
        <link rel="alternate" hrefLang="fa" href={`${seo.canonicalUrl}?lang=fa`} />
        <link rel="alternate" hrefLang="ar" href={`${seo.canonicalUrl}?lang=ar`} />
      </Helmet>

      {/* BRAND NAVIGATION HEADER */}
      <Navbar
        currentLocale={currentLocale}
        setLocale={setLocale}
        currentView={currentView}
        setView={setView}
      />

      {/* CORE PAGES VIEWS VIEWPORT CONTAINER (Routing Switch) */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <HomeView
              currentLocale={currentLocale}
              setView={setView}
              products={products}
              heroHeadline={settings.heroHeadline}
              heroSubheadline={settings.heroSubheadline}
            />
          } />
          <Route path="/about" element={<AboutView currentLocale={currentLocale} setView={setView} />} />
          <Route path="/collections" element={
            <CollectionsView
              products={products}
              currentLocale={currentLocale}
              showPrices={settings.showPrices}
            />
          } />
          <Route path="/products/:id" element={
            <CollectionsView
              products={products}
              currentLocale={currentLocale}
              showPrices={settings.showPrices}
            />
          } />
          <Route path="/portfolio" element={<PortfolioView currentLocale={currentLocale} />} />
          <Route path="/wholesale" element={<WholesaleView currentLocale={currentLocale} />} />
          <Route path="/custom-order" element={<CustomOrderView currentLocale={currentLocale} />} />
          <Route path="/blog" element={<BlogView blogPosts={blogPosts} currentLocale={currentLocale} />} />
          <Route path="/blog/:slug" element={<BlogView blogPosts={blogPosts} currentLocale={currentLocale} />} />
          <Route path="/contact" element={<ContactView currentLocale={currentLocale} contactSettings={settings.contact} />} />
          <Route path="/admin" element={
            <AdminPanel
              products={products}
              refreshProducts={fetchProducts}
              blogPosts={blogPosts}
              refreshBlog={fetchBlog}
              settings={settings}
              refreshSettings={fetchSettings}
              currentLocale={currentLocale}
            />
          } />
          <Route path="/admin/login" element={
            <AdminPanel
              products={products}
              refreshProducts={fetchProducts}
              blogPosts={blogPosts}
              refreshBlog={fetchBlog}
              settings={settings}
              refreshSettings={fetchSettings}
              currentLocale={currentLocale}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER CHANNELS LINKS SECTION */}
      <Footer
        currentLocale={currentLocale}
        setView={setView}
        contactSettings={settings.contact}
      />

      {/* PERSISTENT REAL-TIME AI ASSISTANT CONCIERGE */}
      {currentView !== 'admin' && (
        <AiAssistant currentLocale={currentLocale} />
      )}

    </div>
  );
}
