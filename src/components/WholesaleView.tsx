import React, { useState } from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { ShieldCheck, Mail, Send, Award, Download, Building, Layers, Sparkles } from 'lucide-react';

interface WholesaleViewProps {
  currentLocale: Locale;
}

export default function WholesaleView({ currentLocale }: WholesaleViewProps) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [projectScale, setProjectScale] = useState('boutique_hotel');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
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

  const handleWholesaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email) return;

    setLoading(true);
    setErr('');

    const payload = {
      name: contactPerson,
      email,
      phone: companyName, // Map company name for reference
      country: 'Wholesale client',
      type: 'wholesale',
      description: `Wholesale/Commercial Query from [${companyName}]. Contract contact: ${contactPerson}. Sizing Scale Category: ${projectScale}. project outline: ${description}`,
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
        setSubmitted(true);
        setCompanyName('');
        setContactPerson('');
        setEmail('');
        setDescription('');
        setPuzzleAnswer('');
      } else {
        const data = await res.json();
        setErr(data.error || 'Atelier rejected proposal parameters.');
        fetchPuzzle();
      }
    } catch (err) {
      console.error(err);
      setErr('Communication link offline. Please consult via direct WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCatalog = () => {
    // Elegant mock download trigger simulating bespoke brochure retrieval
    const dummyText = `NWH Heritage Master Catalog - Private Collection Brochure\nPreserving Cultural Woodcrafts of Nuristan, Afghanistan\n\nExecutive Director: Shafiqullah Satary Nooristani\nContact Email: nuristaniwood@gmail.com\nWholesale Lines: +93749274000\n\nPreservation lines are carved completely by hand in mountain walnut. Contact us with your tracking code in the website!`;
    const blob = new Blob([dummyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'NWH-Heritage-Luxury-Brochure-2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 animate-fadeIn font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <section className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">corporate partners and exhibitions</span>
        <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">Wholesale & Export</h1>
        <p className="text-xs text-gray-500 max-w-xl mx-auto font-light leading-relaxed mt-2">
          Providing contract carvings, monumental wooden gates, cedar column screens, and architectural styling for premium hotels and private estates.
        </p>
        <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
      </section>

      {/* TWIN COLUMNS INFO & FORMS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start text-xs leading-relaxed text-gray-400 font-light">
        
        {/* Left Col: Explainer & catalog downloads */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#050505] p-6 rounded border border-[#231710] space-y-4">
            <Building className="h-6 w-6 text-[#C5A880]" />
            <h3 className="font-serif text-[#C5A880] text-lg uppercase tracking-wider">Contract Partnerships</h3>
            
            <p className="text-[11px] leading-relaxed">
              We collaborate with luxury hotel curators, custom interior designers, and cultural preservation funds across North America, Europe, Central Asia, and the Gulf regions.
            </p>

            <ul className="space-y-2 text-[10.5px]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#C5A880]" />
                <span>Duty-free export shipping clearances</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#C5A880]" />
                <span>Fire-retardant and curing certification</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#C5A880]" />
                <span>Dedicated project manager assigned</span>
              </li>
            </ul>
          </div>

          {/* DOWNLOAD BROCHURE BUTTON CARD */}
          <div className="bg-[#100D0B] p-6 rounded border border-[#3E2723]/35 text-center space-y-4">
            <Download className="h-5 w-5 text-[#C5A880] mx-auto animate-bounce" />
            <div className="space-y-1">
              <h4 className="font-serif text-gray-200 font-medium">Download Heritage Catalogue</h4>
              <p className="text-[10px] text-gray-500">Get technical dimensions and timber grain descriptions</p>
            </div>
            <button
              onClick={handleDownloadCatalog}
              className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-[9.5px] py-2 px-6 rounded transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Download Bespoke Brochure</span>
              <Download className="h-3 w-3 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right Col: Wholesale custom proposal submission form */}
        <div className="lg:col-span-7 bg-[#0D0D0D] border border-[#231711] p-6 md:p-8 rounded-sm space-y-6">
          
          <div className="border-b border-[#211611] pb-3 text-center">
            <h4 className="font-serif text-[#C5A880] uppercase tracking-widest text-sm text-center font-medium">Submit Executive Request</h4>
            <p className="text-[9px] text-gray-500 tracking-wider">for hospitality contracting and bulk export commissions</p>
          </div>

          {submitted ? (
            <div className="bg-emerald-950/40 border border-emerald-900 p-6 rounded text-center space-y-4">
              <Award className="h-6 w-6 text-[#C5A880] mx-auto" />
              <h5 className="font-serif text-emerald-300 text-sm">Wholesale proposal written and registered!</h5>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                We have registered your project inquiry. Our executive coordination office will verify details and reach out on the provided email to coordinate designs and timber volumes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleWholesaleSubmit} className="space-y-4">
              
              {err && (
                <div className="bg-red-950/40 border border-red-900 text-red-300 p-2.5 rounded text-xs">
                  <span>{err}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Company / Studio Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Aman Resorts, Ritz Carlton"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-200 rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Lead Contracting Officer</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (Interior Director)"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-200 rounded focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Official work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commercial@resortscorporation.com"
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-200 rounded focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Project Sizing / Volume</label>
                  <select
                    value={projectScale}
                    onChange={(e) => setProjectScale(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-300 rounded focus:outline-none"
                  >
                    <option value="boutique_hotel">Boutique Hotel (5 - 20 items)</option>
                    <option value="luxury_resort">Grand Resort Scale (20+ items)</option>
                    <option value="private_estate">Private Estate (Manor/Villa ceiling Panels)</option>
                    <option value="museum_preservation">Museum Exhibition / Civic Commission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Specify layout dimensions or custom door counts</label>
                <textarea
                  value={description}
                  onChange={(setDescriptione) => setDescription(setDescriptione.target.value)}
                  placeholder="Tell us about the desired wood grain (old walnut, cedar) and any architectural designs provided by cad..."
                  className="w-full bg-[#121212] border border-[#2A1E17] focus:border-[#C5A880] p-3 text-gray-250 rounded focus:outline-none h-28 text-xs"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-[10px] py-3.5 rounded cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Transmitting proposal...' : 'Register Corporate Proposal'}</span>
              </button>

            </form>
          )}

        </div>

      </section>

    </div>
  );
}
