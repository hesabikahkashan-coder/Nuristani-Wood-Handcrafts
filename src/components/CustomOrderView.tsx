import React, { useState } from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Award, Compass, Send, Key, ChevronRight, ChevronLeft, Upload, Sparkles, Check, Info } from 'lucide-react';

interface CustomOrderViewProps {
  currentLocale: Locale;
}

export default function CustomOrderView({ currentLocale }: CustomOrderViewProps) {
  const [step, setStep] = useState(1);

  // Configuration wizard states
  const [category, setCategory] = useState('heritage_door');
  const [timberType, setTimberType] = useState('mountain_walnut');
  const [dimensions, setDimensions] = useState('180cm height, 90cm width');
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  
  // File upload state for blueprints/sketches (Usability Patterns)
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadBase64, setUploadBase64] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [submittedInquiryId, setSubmittedInquiryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

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
      console.error('Error fetching security challenge:', e);
    }
  };

  React.useEffect(() => {
    fetchPuzzle();
  }, []);

  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  // Timber guidelines
  const timbersList = [
    {
      id: 'mountain_walnut',
      title: 'Old-Tree Mountain Walnut',
      scent: 'deep walnut wood, slow-growth grain weight',
      desc: 'Extremely durable dark wood ideal for royal chairs, tables, and caskets. Heavy, dense, and resistant to environmental shifts.'
    },
    {
      id: 'wild_cedar',
      title: 'Aromatic Himalayan Cedar',
      scent: 'aromatic cedar oils, natural insect resistant',
      desc: 'Light golden shade with ancient sweet scent. Traditionally chosen for palace door panellings and columns.'
    },
    {
      id: 'ash_wood',
      title: 'Himalayan Ashwood',
      scent: 'clean organic honey, flexible and bright',
      desc: 'Blonde shade excellent for custom carved screens and مشبك (interlocking geometric grilles).'
    }
  ];

  // Drag and drop event handlers (Usability Patterns)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadBase64(reader.result as string);
      setUploadedFileName(file.name);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) return;

    setLoading(true);
    setErr('');

    const activeTimber = timbersList.find(t => t.id === timberType)?.title || timberType;

    const payload = {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      country: destinationCountry,
      type: 'custom_commission',
      budgetRange: '$10,000 - $25,000',
      imageRef: uploadBase64 || '', // Pass base64 uploaded sketch as reference
      description: `Bespoke Custom Configurator Order:\n- Commission Type: ${category}\n- Sizing: ${dimensions}\n- Timber: ${activeTimber}\n- Details & Sketch: ${notes}\n- Uploaded Sketch File Name: ${uploadedFileName || 'No sketch uploaded'}`,
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
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.inquiry) {
          setSubmittedInquiryId(data.inquiry.trackingId);
          setStep(5);
        }
      } else {
        const data = await res.json();
        setErr(data.error || 'The atelier rejected this custom config file.');
        fetchPuzzle();
      }
    } catch (err) {
      console.error(err);
      setErr('Connection offline. Please submit details via direct WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-fadeIn font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* SECTION HEADER */}
      <section className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">interactive customizer cockpit</span>
        <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">Bespoke Commissions</h1>
        <p className="text-xs text-gray-500 max-w-xl mx-auto font-light leading-relaxed mt-2">
          Configure physical parameters, timber grains, size adjustments, and directly upload design sketch blueprints.
        </p>
        <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
      </section>

      {/* TIMELINE STEP INDICATORS TRACKER */}
      <section className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold select-none">
        <div className={`pb-2 border-b-2 transition-colors ${step >= 1 ? 'border-[#C5A880] text-gray-200' : 'border-[#1E1E1E]'}`}>
          Step 1: Category
        </div>
        <div className={`pb-2 border-b-2 transition-colors ${step >= 2 ? 'border-[#C5A880] text-gray-200' : 'border-[#1E1E1E]'}`}>
          Step 2: Timber Scent
        </div>
        <div className={`pb-2 border-b-2 transition-colors ${step >= 3 ? 'border-[#C5A880] text-gray-200' : 'border-[#1E1E1E]'}`}>
          Step 3: Sketches
        </div>
        <div className={`pb-2 border-b-2 transition-colors ${step >= 4 ? 'border-[#C5A880] text-gray-200' : 'border-[#1E1E1E]'}`}>
          Step 4: Contact
        </div>
      </section>

      {/* CONFIGURATION PORTAL CARDS */}
      <section className="bg-[#0C0C0C] border border-[#231711] p-6 sm:p-10 rounded-sm shadow-2xl relative min-h-[350px] flex flex-col justify-between">
        
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#211611] pb-3 text-center">
              <h3 className="font-serif text-[#C5A880] text-base uppercase tracking-wider font-semibold">Select Masterwork Family</h3>
              <p className="text-[10px] text-gray-500 font-light mt-0.5 uppercase">what family of woodcraft are we creating?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <button
                type="button"
                onClick={() => setCategory('heritage_door')}
                className={`p-5 rounded-sm border hover:border-[#C5A880]/60 transition-all cursor-pointer text-left focus:outline-none ${
                  category === 'heritage_door' ? 'bg-[#1C1612] border-[#C5A880] text-white' : 'bg-[#050505] border-[#1C130D] text-gray-400'
                }`}
              >
                <h4 className="font-serif text-[#C5A880] text-sm uppercase font-bold">Bespoke Architectural Doors</h4>
                <p className="text-gray-500 font-light mt-1.5 leading-relaxed text-[11px]">Hand-hewn cedar gates and entry portal alignments configured directly to support security seals.</p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('royal_chair')}
                className={`p-5 rounded-sm border hover:border-[#C5A880]/60 transition-all cursor-pointer text-left focus:outline-none ${
                  category === 'royal_chair' ? 'bg-[#1C1612] border-[#C5A880] text-white' : 'bg-[#050505] border-[#1C130D] text-gray-400'
                }`}
              >
                <h4 className="font-serif text-[#C5A880] text-sm uppercase font-bold">Ceremonial Thrones & Dining Chairs</h4>
                <p className="text-gray-500 font-light mt-1.5 leading-relaxed text-[11px]">Bespoke high-back royal armchairs with personalized astronomy carvings.</p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('dowry_chest')}
                className={`p-5 rounded-sm border hover:border-[#C5A880]/60 transition-all cursor-pointer text-left focus:outline-none ${
                  category === 'dowry_chest' ? 'bg-[#1C1612] border-[#C5A880] text-white' : 'bg-[#050505] border-[#1C130D] text-gray-400'
                }`}
              >
                <h4 className="font-serif text-[#C5A880] text-sm uppercase font-bold">Bridal Dowry Chests & Keepsakes</h4>
                <p className="text-gray-500 font-light mt-1.5 leading-relaxed text-[11px]">Heirloom marriage caskets lined with aromatic cedarwood to shield family archives.</p>
              </button>

              <button
                type="button"
                onClick={() => setCategory('lattice_screens')}
                className={`p-5 rounded-sm border hover:border-[#C5A880]/60 transition-all cursor-pointer text-left focus:outline-none ${
                  category === 'lattice_screens' ? 'bg-[#1C1612] border-[#C5A880] text-white' : 'bg-[#050505] border-[#1C130D] text-gray-400'
                }`}
              >
                <h4 className="font-serif text-[#C5A880] text-sm uppercase font-bold">mshabak Interlocking Lattices</h4>
                <p className="text-gray-500 font-light mt-1.5 leading-relaxed text-[11px]">Complex interlocking screen dividers, ceilings blocks and column capitals.</p>
              </button>
            </div>

            <div className="flex justify-end pt-6 border-t border-[#1C130D]">
              <button
                onClick={() => setStep(2)}
                className="bg-[#C5A880] text-black hover:bg-[#EED6A3] font-bold text-[10px] tracking-widest uppercase py-3 px-8 rounded-sm transition-all focus:outline-none inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Sourcing Grains</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TIMBER SELECTION */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn text-xs text-gray-400 leading-relaxed font-light">
            <div className="border-b border-[#211611] pb-3 text-center">
              <h3 className="font-serif text-[#C5A880] text-base uppercase tracking-wider font-semibold">Select Timber Scent</h3>
              <p className="text-[10px] text-gray-500 font-light mt-0.5 uppercase">natural oils, colors, physical properties</p>
            </div>

            <div className="space-y-4">
              {timbersList.map((tb) => (
                <div
                  key={tb.id}
                  onClick={() => setTimberType(tb.id)}
                  className={`p-5 border rounded-sm hover:border-[#C5A880]/50 transition-all block text-left cursor-pointer focus:outline-none ${
                    timberType === tb.id ? 'bg-[#1C1612] border-[#C5A880] text-gray-200' : 'bg-[#050505] border-[#1A1A1A] text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-[#C5A880] text-sm font-semibold">{tb.title}</h4>
                    <span className="text-[9px] uppercase tracking-wider text-gray-600 font-mono">scent signature: {tb.scent}</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-2">{tb.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-[#1C130D]">
              <button
                onClick={() => setStep(1)}
                className="border border-[#4E3629] text-gray-400 hover:text-white hover:border-[#C5A880] text-[10px] tracking-widest font-bold uppercase py-2.5 px-6 rounded-sm transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Go Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-[#C5A880] text-black hover:bg-[#EED6A3] text-[10px] tracking-widest font-bold uppercase py-3 px-8 rounded-sm transition-all focus:outline-none inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Upload Design Sketch</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SKETCHES & BLUEPRINTS */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#211611] pb-3 text-center">
              <h3 className="font-serif text-[#C5A880] text-base uppercase tracking-wider font-semibold">Sketches & Dimensions</h3>
              <p className="text-[10px] text-gray-500 font-light mt-0.5 uppercase">provide measures, CAD archives, or simple hand-drawn blueprints</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-400">
              
              {/* Left Form: text configuration inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Estimated Target Sizing</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 190 H cm x 110 W cm"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 rounded focus:outline-none text-gray-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Sizing Customizations / Carving request details</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide bespoke carvings context (e.g. want family wedding star pattern engraved, cedar wood aromatic finish...)"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 rounded focus:outline-none h-32 text-gray-200 text-xs"
                  />
                </div>
              </div>

              {/* Right Box: Drag and drop custom sketch uploader (Usability Patterns) */}
              <div className="space-y-3">
                <span className="block text-[9px] uppercase tracking-wider text-gray-500">Design Draft / Estate Blueprint Drawing</span>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed border-[#4D3629]/60 p-8 rounded-sm text-center bg-[#090909] space-y-4 cursor-pointer relative min-h-[174px] flex flex-col justify-center items-center select-none ${
                    dragActive ? 'border-[#C5A880] bg-[#1C1612]' : 'hover:border-[#C5A880]/40'
                  }`}
                >
                  <Upload className="h-6 w-6 text-[#C5A880] mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-sans text-gray-300 font-semibold uppercase">Drag & Drop sketch or sketch image</p>
                    <p className="text-[10px] text-gray-500">supports pdf, png, jpg, cad files up to 10mb</p>
                  </div>
                  
                  {/* Manual trigger button */}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {isUploading && (
                  <p className="text-[10px] text-amber-500">Reading draft file package...</p>
                )}

                {uploadedFileName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/20 px-3.5 py-2.5 rounded border border-emerald-900 shadow">
                    <Check className="h-4 w-4 shrink-0 text-[#C5A880]" />
                    <span>Sketch registered: <span className="font-semibold text-gray-300 italic">{uploadedFileName}</span></span>
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-between pt-6 border-t border-[#1C130D]">
              <button
                onClick={() => setStep(2)}
                className="border border-[#4E3629] text-gray-400 hover:text-white hover:border-[#C5A880] text-[10px] tracking-widest font-bold uppercase py-2.5 px-6 rounded-sm transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Go Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-[#C5A880] text-black hover:bg-[#EED6A3] text-[10px] tracking-widest font-bold uppercase py-3 px-8 rounded-sm transition-all focus:outline-none inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Contact Details</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONTACT & PRELOAD CORRESPONDENCE */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#211611] pb-3 text-center">
              <h3 className="font-serif text-[#C5A880] text-base uppercase tracking-wider font-semibold">Contact & Shipping Details</h3>
              <p className="text-[10px] text-gray-500 font-light mt-0.5 uppercase">provide secure identity coordinates for airway customs bills</p>
            </div>

            <form onSubmit={handleCustomOrderSubmit} className="space-y-4 text-xs font-sans">
              
              {err && (
                <div className="bg-red-950/40 border border-red-900 text-red-300 p-2.5 rounded text-xs">
                  <span>{err}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Your Name / Estate Title</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Lord Edward Cavendish"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Correspondence Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. edward@cavendishestates.uk"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Phone Number (Include Country Code)</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. +44 7911 123456"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Destination Country</label>
                  <input
                    type="text"
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    placeholder="e.g. London, United Kingdom"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 bg-[#100D0B] p-4.5 border border-[#3A2D23]/35 rounded">
                <Info className="h-5 w-5 text-[#C5A880] shrink-0 mt-0.5" />
                <p className="text-[10.5px] leading-relaxed text-gray-500 font-light">
                  <strong>Secure Custody Lock:</strong> By requesting customized heritage woodcarvings, you enter our active private commission waiting ledger. Standard woodworking schedules take 3 to 4 months of slow crafting.
                </p>
              </div>

              {/* Spam Honeypot Protection (Hidden from humans) */}
              <div className="absolute hidden opacity-0 pointer-events-none" style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="verify_identity_fax"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Security Numerical Verification Puzzle */}
              {puzzle && (
                <div className="bg-[#121110] border border-[#30231C] p-4 rounded text-xs space-y-2 text-gray-400">
                  <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase tracking-wider">
                    <span>Atelier Secured Verification Check</span>
                    <button type="button" onClick={fetchPuzzle} className="text-[#C5A880] hover:underline cursor-pointer lowercase">refresh code</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <p className="text-gray-300 font-serif leading-tight">{puzzle.question}</p>
                    <input
                      type="text"
                      value={puzzleAnswer}
                      onChange={(e) => setPuzzleAnswer(e.target.value)}
                      placeholder="Calculate result..."
                      className="w-full bg-[#0C0B0A] border border-[#443329] focus:border-[#C5A880] p-2 text-gray-200 rounded focus:outline-none text-xs text-center"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-[#1C130D]">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="border border-[#4E3629] text-gray-400 hover:text-white hover:border-[#C5A880] text-[10px] tracking-widest font-bold uppercase py-2.5 px-6 rounded-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span>Go Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-bold text-[10px] tracking-widest uppercase py-3.5 px-10 rounded shadow transition-all focus:outline-none inline-flex items-center gap-1 cursor-pointer"
                >
                  <Send className="h-4 w-4 animate-pulse" />
                  <span>{loading ? 'Submitting configurations...' : 'Register Bespoke Configurator Request'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STEP 5: SUMMARY & CONGRATULATIONS SUCCESS TICKET SCREEN */}
        {step === 5 && (
          <div className="text-center py-10 space-y-6 max-w-xl mx-auto animate-fadeIn text-xs leading-relaxed font-light text-gray-450">
            <div className="inline-flex p-4 rounded-full bg-[#1C1612] border border-[#C5A880]/30 text-[#C5A880]">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-[#C5A880] text-xl uppercase tracking-widest font-bold">Commission Registered!</h3>
              <p className="text-[11px] text-gray-500 font-light uppercase tracking-wider font-sans">your tracking trackingId identifier:</p>
              <div className="inline-block bg-[#121212] border border-[#2A1E17] text-[#C5A880] font-mono font-bold font-semibold px-4 py-2 rounded text-base tracking-widest tracking-widest">
                {submittedInquiryId}
              </div>
            </div>

            <p className="text-xs text-gray-400 font-sans tracking-wide leading-relaxed">
              Lord Curator Shafiqullah Satary Nooristani has received your mathematical config designs. We will construct customized CAD layouts corresponding to your dimensions in old mountain walnut timber, and correspond details along the coordinates.
            </p>

            <button
              onClick={() => {
                setStep(1);
                setNotes('');
                setUploadedFileName('');
              }}
              className="bg-[#C5A880] text-black hover:bg-[#EED6A3] text-[9.5px] uppercase tracking-widest font-bold py-2.5 px-6 rounded shadow cursor-pointer transition-colors"
            >
              Configure Another Commission
            </button>
          </div>
        )}

      </section>

    </div>
  );
}
