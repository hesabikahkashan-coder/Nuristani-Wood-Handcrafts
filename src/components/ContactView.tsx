import React, { useState } from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Phone, Mail, MapPin, Send, MessageSquare, AlertCircle, Sparkles, Check } from 'lucide-react';

interface ContactViewProps {
  currentLocale: Locale;
  contactSettings?: {
    primaryWhatsApp: string;
    secondaryWhatsApp: string;
    phone: string;
    email: string;
    location: { en: string; fa: string; ar: string };
  };
}

export default function ContactView({
  currentLocale,
  contactSettings = {
    primaryWhatsApp: '+93749274000',
    secondaryWhatsApp: '+447401147446',
    phone: '+93777296023',
    email: 'nuristaniwood@gmail.com',
    location: {
      en: 'Primary Showrooms in Shahr-e-Naw, Kabul & Valley Workshops in Kamdesh/Parun, Nuristan, Afghanistan.',
      fa: 'نمایشگاه اصلی در چهارراهی انصاری، شهر نو، کابل و کارگاه‌های ریشه دار در کامدیش و پارون، ولایت نورستان، افغانستان.',
      ar: 'صالات العرض في شهر نو، كابل وورش العمل العظيمة في كامديش، نورستان، أفغانستان.'
    }
  }
}: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submittedId, setSubmittedId] = useState('');
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
      console.error('Error fetching security verification:', e);
    }
  };

  React.useEffect(() => {
    fetchPuzzle();
  }, []);

  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  const formatWhatsAppLink = (number: string) => {
    return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    setErr('');

    const payload = {
      name,
      email,
      phone,
      country: 'Kabul Contact form',
      type: 'contact',
      description: `Direct Contact Desk Submission:\n- Client: ${name}\n- Coordinate: ${email} | ${phone}\n- message: ${notes}`,
      verify_identity_fax: honeypot,
      puzzleId: puzzle?.id || '',
      puzzleAnswer
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.inquiry) {
          setSubmittedId(data.inquiry.trackingId);
          setName('');
          setEmail('');
          setPhone('');
          setNotes('');
          setPuzzleAnswer('');
        }
      } else {
        const data = await res.json();
        setErr(data.error || 'Database rejected contact message.');
        fetchPuzzle(); // Refresh puzzle on error
      }
    } catch {
      setErr('Communication link offline. Please consult WhatsApp directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 animate-fadeIn font-sans text-xs leading-relaxed font-light text-gray-400" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <section className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">direct communication desk</span>
        <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">Contact Atelier</h1>
        <p className="text-xs text-gray-500 max-w-xl mx-auto font-light leading-relaxed mt-2">
          Consult with Shariqullah Satary regarding timber grain, customized ceiling grilles, or secure air-freight airway customs.
        </p>
        <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
      </section>

      {/* CORE CONTACT CARDS & FORM CONTAINER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
        
        {/* Left Side: Contact details card panels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0C0C0C] border border-[#231711] p-6 sm:p-8 rounded-sm space-y-6 text-xs text-gray-400">
            <h3 className="font-serif text-gray-200 uppercase tracking-widest text-lg font-medium">Bespoke Desks</h3>
            
            <div className="space-y-5">
              
              {/* WhatsApp Primary */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className={textDirectionClass}>
                  <span className="uppercase text-[9px] text-gray-600 block leading-none mb-1">Primary WhatsApp Desk</span>
                  <a
                    href={formatWhatsAppLink(contactSettings.primaryWhatsApp)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C5A880] hover:text-[#EED6A3] font-serif font-semibold text-sm transition-colors"
                  >
                    {contactSettings.primaryWhatsApp}
                  </a>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Instant secure consultation from Kabuler workshops.</p>
                </div>
              </div>

              {/* WhatsApp Secondary */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className={textDirectionClass}>
                  <span className="uppercase text-[9px] text-gray-600 block leading-none mb-1">International desk</span>
                  <a
                    href={formatWhatsAppLink(contactSettings.secondaryWhatsApp)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C5A880] hover:text-[#EED6A3] font-serif font-semibold text-sm transition-colors"
                  >
                    {contactSettings.secondaryWhatsApp}
                  </a>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Correspondence office in London for Western clients.</p>
                </div>
              </div>

              {/* Phone click calling */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <Phone className="h-5 w-5" />
                </div>
                <div className={textDirectionClass}>
                  <span className="uppercase text-[9px] text-gray-600 block leading-none mb-1">Executive Call line</span>
                  <a
                    href={`tel:${contactSettings.phone}`}
                    className="text-[#C5A880] hover:text-[#EED6A3] font-serif font-semibold text-sm transition-colors"
                  >
                    {contactSettings.phone}
                  </a>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Direct phone connection to executive assistant.</p>
                </div>
              </div>

              {/* Location details */}
              <div className="flex gap-4 items-start pt-3 border-t border-[#1C130D]">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className={textDirectionClass}>
                  <span className="uppercase text-[9px] text-gray-600 block leading-none mb-1">Physical Ateliers</span>
                  <p className="text-gray-300 leading-relaxed font-light text-[11px]">
                    {contactSettings.location[currentLocale] || contactSettings.location.en}
                  </p>
                </div>
              </div>

              {/* Email details */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 border border-[#4E3629]/55 rounded bg-[#101010] h-10 w-10 shrink-0 flex items-center justify-center text-[#C5A880]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className={textDirectionClass}>
                  <span className="uppercase text-[9px] text-gray-600 block leading-none mb-1">Executive Correspondence Email</span>
                  <a
                    href={`mailto:${contactSettings.email}`}
                    className="text-[#C5A880] hover:text-[#EED6A3] text-[12px] font-semibold transition-colors font-serif"
                  >
                    {contactSettings.email}
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Side: Interactive Inquiry contact form */}
        <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#231711] p-6 md:p-8 rounded-sm space-y-6">
          
          <div className="border-b border-[#211611] pb-3 text-center">
            <h3 className="font-serif text-[#C5A880] text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Transmit Secure Message</span>
            </h3>
            <p className="text-[9px] text-gray-500 tracking-wider">your messages write safely directly inside the staff console</p>
          </div>

          {submittedId ? (
            <div className="bg-emerald-950/40 border border-emerald-900 p-6 rounded text-center space-y-4">
              <Check className="h-6 w-6 text-[#C5A880] mx-auto" />
              <h4 className="font-serif text-emerald-300 text-sm">Message submitted and logged!</h4>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                Your communication file has been wrote successfully to our master list under tracking code: <span className="font-mono text-[#C5A880] font-bold">{submittedId}</span>.
                We will research details and correlate correspondence shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              
              {err && (
                <div className="bg-red-950/40 border border-red-900 text-red-300 p-2 text-[11px] flex items-center gap-1.5 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>{err}</span>
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Your Representative Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name / Ambassador Name"
                  className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Email Coordinator</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@estatearchitects.com"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Call number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Include country codes..."
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Bespoke Inquiry message / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide details about your hotel restoration project or custom bridal dowry designs..."
                  className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none h-32"
                  required
                />
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
                <div className="bg-[#121110] border border-[#30231C] p-4 rounded text-xs space-y-2">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-[10px] py-3.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Transmitting details...' : 'Transmit Case File'}</span>
              </button>

            </form>
          )}

        </div>

      </section>

    </div>
  );
}
