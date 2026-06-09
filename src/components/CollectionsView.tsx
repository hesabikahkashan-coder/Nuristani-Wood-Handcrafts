import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Locale, Inquiry } from '../types';
import { getTranslation } from '../lib/i18n';
import { Layers, ChevronRight, Bookmark, Tag, AlertCircle, Sparkles, Send, Eye, Ruler, Clock, Trees } from 'lucide-react';

interface CollectionsViewProps {
  products: Product[];
  currentLocale: Locale;
  showPrices: boolean;
}

export default function CollectionsView({ products, currentLocale, showPrices }: CollectionsViewProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Inquiry form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [budgetRange, setBudgetRange] = useState('$5,000 - $10,000');
  const [notes, setNotes] = useState('');
  const [inquiryResult, setInquiryResult] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [puzzle, setPuzzle] = useState<{ id: string; question: string } | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const fetchPuzzle = async () => {
    try {
      const res = await fetch('/api/security-puzzle');
      if (res.ok) {
        const data = await res.json();
        setPuzzle(data);
      }
    } catch (e) {
      console.error('Error fetching security verification:', e);
    }
  };

  useEffect(() => {
    fetchPuzzle();
  }, []);

  useEffect(() => {
    if (id) {
      const prod = products.find(p => String(p.id) === id);
      if (prod) {
        setActiveProduct(prod);
        setInquiryResult(null);
        setErrorText('');
        setPuzzleAnswer('');
        fetchPuzzle();
      } else {
        setActiveProduct(null);
      }
    } else {
      setActiveProduct(null);
    }
  }, [id, products]);

  const handleOpenProduct = (prod: Product) => {
    navigate(`/products/${prod.id}`);
  };

  const handleCloseProduct = () => {
    navigate('/collections');
  };

  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  // Categories
  const categories = [
    { id: 'all', labelKey: 'categoryAll' },
    { id: 'heritage', labelKey: 'categoryHeritage' },
    { id: 'royal', labelKey: 'categoryRoyal' },
    { id: 'signature', labelKey: 'categorySignature' },
    { id: 'custom', labelKey: 'categoryCustom' }
  ];

  // Filter products
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleInquirySubmit = async (e: React.FormEvent, productTitle: string) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !country) {
      setErrorText('Please fill out all identity credentials to proceed.');
      return;
    }

    setLoading(true);
    setErrorText('');

    const payload = {
      name: fullName,
      email,
      phone,
      country,
      type: 'product_quote',
      budgetRange,
      description: `Bespoke Inquiry for [${productTitle}]. Client notes: ${notes}. Budget range declared: ${budgetRange}. Destination courier country: ${country}.`,
      verify_identity_fax: honeypot,
      puzzleId: puzzle?.id || '',
      puzzleAnswer
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Database reject');
      }

      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiryResult({ id: data.inquiry.trackingId });
        setFullName('');
        setEmail('');
        setPhone('');
        setCountry('');
        setNotes('');
        setPuzzleAnswer('');
      } else {
        setErrorText('Failed to register inquiry on server. Try again shortly.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Server connection interrupted. Please direct request on executive WhatsApp lines.');
      fetchPuzzle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fadeIn font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* SECTION HEADER */}
      <section className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">handcarved archives catalogue</span>
        <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">The Master Catalog</h1>
        <p className="text-xs text-gray-500 max-w-xl mx-auto font-light leading-relaxed mt-2">
          Explore heirloom wedding boxes, handcrafted door panels, ceremonial thrones, and customized geometric panels.
        </p>
        <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
      </section>

      {/* FILTER BUTTONS CATEGORIES ROW */}
      <section className="flex flex-wrap items-center justify-center gap-2 border-b border-[#1C130D] pb-6 select-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-sm uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#1C1612] text-[#EED6A3] border border-[#C5A880] font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {getTranslation(cat.labelKey, currentLocale)}
          </button>
        ))}
      </section>

      {/* GRID CONTAINER OF PRODUCTS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            onClick={() => handleOpenProduct(prod)}
            className="bg-[#0D0D0D] border border-[#231711] hover:border-[#C5A880]/40 rounded-sm overflow-hidden group shadow-lg transition-all duration-500 flex flex-col justify-between cursor-pointer"
          >
            {/* Asset photo section */}
            <div className="h-64 relative overflow-hidden bg-black/40 shrink-0">
              <img
                src={prod.image}
                alt={prod.title.en}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-[#0A0A0A]/85 backdrop-blur-md border border-[#C5A880]/30 text-[9px] uppercase px-2 py-0.5 rounded text-gray-300 font-bold">
                {prod.category} Series
              </div>
            </div>

            {/* Information panel */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-serif text-gray-200 text-base group-hover:text-[#EED6A3] transition-colors leading-snug">
                  {prod.title[currentLocale]}
                </h3>
                <p className="text-[11px] text-gray-500 font-light leading-relaxed line-clamp-3">
                  {prod.description[currentLocale]}
                </p>
              </div>

              {/* Action pricing or request button */}
              <div className="pt-3.5 border-t border-[#1C130D] flex items-center justify-between text-xs">
                {showPrices && prod.materials ? (
                  <span className="font-semibold text-gray-300 font-serif">Bespoke pricing</span>
                ) : (
                  <span className="text-gray-500 italic lowercase text-[10px]">Private catalog quote</span>
                )}
                
                <span className="text-[#C5A880] group-hover:text-[#EED6A3] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <span>Explore detail</span>
                  <Eye className="h-3 w-3 shrink-0" />
                </span>
              </div>
            </div>

          </div>
        ))}
      </section>

      {/* --- MOUNT DETAIL MODAL CARDS --- */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto text-xs">
          <div className="bg-[#0E0E0E] border border-[#2A1E17] rounded shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Header section close */}
            <div className="flex justify-between items-center border-b border-[#231A15] pb-3.5 shrink-0">
              <div className={textDirectionClass}>
                <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">{activeProduct.category} Series Piece</span>
                <h3 className="text-lg font-serif uppercase tracking-widest text-gray-200 font-semibold">{activeProduct.title[currentLocale]}</h3>
              </div>
              <button onClick={handleCloseProduct} className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1C1C1C]">
                <Eye className="h-5 w-5 rotate-180" />
              </button>
            </div>

            {/* Content columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
              
              {/* Left Column: Visual display & parameters details */}
              <div className="lg:col-span-5 space-y-5">
                <div className="h-72 sm:h-96 w-full rounded border border-[#221711] overflow-hidden relative shadow-lg">
                  <img src={activeProduct.image} alt="" className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                </div>

                {/* Characteristics box */}
                <div className="bg-[#050505] p-5 rounded border border-[#2A1E17] space-y-3.5 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <Trees className="h-4 w-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <div className={textDirectionClass}>
                      <span className="text-[9px] uppercase text-gray-600 block">{getTranslation('materialsLabel', currentLocale)}</span>
                      <span className="text-gray-300 font-serif font-semibold">{activeProduct.materials[currentLocale] || 'slow-growth mountain cedar'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Ruler className="h-4 w-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <div className={textDirectionClass}>
                      <span className="text-[9px] uppercase text-gray-600 block">{getTranslation('dimensionsLabel', currentLocale)}</span>
                      <span className="text-gray-300 font-mono font-medium">{activeProduct.dimensions[currentLocale] || 'dimensions built to project design'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <div className={textDirectionClass}>
                      <span className="text-[9px] uppercase text-gray-600 block">{getTranslation('craftingTimeLabel', currentLocale)}</span>
                      <span className="text-gray-300 font-semibold">{activeProduct.craftingTime[currentLocale] || '12-16 weeks'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Historical Narrative and embedded private Quote inquiry form */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Cultural background narration */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Historical Archetype Story</h4>
                  <p className="text-gray-300 leading-relaxed font-light text-[11px] whitespace-pre-wrap">
                    {activeProduct.description[currentLocale]}
                  </p>
                  {activeProduct.story && activeProduct.story[currentLocale] && (
                    <p className="text-[#C5A880] font-serif italic text-xs leading-relaxed bg-[#100D0A] p-3.5 rounded border border-[#3E2723]/25">
                      {activeProduct.story[currentLocale]}
                    </p>
                  )}
                </div>

                {/* Form parameters */}
                <div className="border border-[#231710] rounded-sm p-6 bg-[#080808] space-y-4">
                  <div className="border-b border-[#211610] pb-2 text-center">
                    <h4 className="font-serif text-[#C5A880] uppercase tracking-widest font-semibold text-xs text-center flex items-center justify-center gap-1.5">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>{getTranslation('customFormTitle', currentLocale)}</span>
                    </h4>
                    <p className="text-[9px] text-gray-500 tracking-wider font-light mt-1 uppercase">request custom quote for this item</p>
                  </div>

                  {inquiryResult ? (
                    <div className="bg-emerald-950/40 p-4 border border-emerald-900 rounded text-center space-y-3.5">
                      <Bookmark className="h-5 w-5 text-[#C5A880] mx-auto" />
                      <h5 className="font-serif text-sm text-[EED6A3] font-semibold text-emerald-300">Inquiry registered successfully!</h5>
                      <p className="text-[10px] text-gray-400 font-serif leading-relaxed font-light">
                        Case identifier generated: <span className="font-mono text-[#C5A880] font-bold font-semibold uppercase">{inquiryResult.id}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 leading-relaxed max-w-sm mx-auto">
                        Curator Shafiqullah Nooristani will correspond with details shortly. Thank you for preserving heritage.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleInquirySubmit(e, activeProduct.title.en)} className="space-y-3.5 text-xs">
                      {errorText && (
                        <div className="bg-red-950/40 border border-red-900 text-red-300 p-2.5 rounded text-[11px] flex gap-2">
                          <AlertCircle className="h-4 w-4 text-[#C5A880] shrink-0" />
                          <span>{errorText}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={getTranslation('placeholderName', currentLocale)}
                          className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] text-gray-300 p-2.5 rounded text-xs focus:outline-none"
                          required
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={getTranslation('placeholderEmail', currentLocale)}
                          className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] text-gray-300 p-2.5 rounded text-xs focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={getTranslation('placeholderPhone', currentLocale)}
                          className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] text-gray-300 p-2.5 rounded text-xs focus:outline-none"
                          required
                        />
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder={getTranslation('placeholderCountry', currentLocale)}
                          className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] text-gray-300 p-2.5 rounded text-xs focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <label className="text-gray-500 uppercase text-[9px] font-bold">Planned Budget Group:</label>
                        <select
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] text-gray-300 p-2.5 rounded text-xs focus:outline-none col-span-2"
                        >
                          <option value="under_$5k">Under $5,000 USD</option>
                          <option value="$5k_to_$10k">$5,000 - $10,000 USD</option>
                          <option value="$10k_to_$25k">$10,000 - $25,000 USD</option>
                          <option value="above_$25k">Bespoke (Museum / Estate Scale)</option>
                        </select>
                      </div>

                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write dynamic size adjustments or specific timber choices (Himalaya walnut, cedar wood...)"
                        className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] text-gray-300 p-2.5 rounded text-xs focus:outline-none h-16 min-h-[64px]"
                      />

                      {/* Security Numerical Verification Puzzle */}
                      {puzzle && (
                        <div className="space-y-2 bg-[#0C0C0C]/80 p-4 border border-[#231A15] rounded-sm">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="uppercase tracking-widest text-[#C5A880] font-bold">defense spam verification</span>
                            <button type="button" onClick={fetchPuzzle} className="text-[#C5A880] hover:underline cursor-pointer lowercase">refresh code</button>
                          </div>
                          <p className="text-gray-300 font-serif leading-tight">{puzzle.question}</p>
                          <input
                            type="number"
                            value={puzzleAnswer}
                            onChange={(e) => setPuzzleAnswer(e.target.value)}
                            placeholder="Enter sum"
                            className="w-full bg-black/60 border border-[#231710] focus:border-[#C5A880] p-2 rounded text-xs text-center font-mono font-bold tracking-widest focus:outline-none text-gray-200"
                            required
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-[10px] py-3 rounded cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{loading ? 'Submitting inquiry...' : getTranslation('inquireButton', currentLocale)}</span>
                      </button>
                    </form>
                  )}
                </div>

                <p className="text-[10px] text-gray-600 leading-normal text-center italic">
                  {getTranslation('pricingNote', currentLocale)}
                </p>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
