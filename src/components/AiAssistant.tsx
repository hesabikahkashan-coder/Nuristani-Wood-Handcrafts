import React, { useState, useRef, useEffect } from 'react';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { MessageSquare, X, Send, Sparkles, AlertCircle, HelpCircle, ArrowLeftRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AiAssistantProps {
  currentLocale: Locale;
}

export default function AiAssistant({ currentLocale }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: currentLocale === 'en'
        ? "Welcome, esteemed collector. I am the NWH Heritage Ambassador. I can guide you through our hand-carved Collections, custom ordering guidelines, shipping timelines to your country, and secure payment gateways (HesabPay, Crypto, or Western Union). How may I assist your estate today?"
        : currentLocale === 'fa'
        ? "درود بر شما علاقمند گرامی هنر شرقی. من دستیار ویژه کارگاه صنایع دستی نورستان هستم. می‌توانم شما را در انتخاب چوب‌ها، شیوه کنده‌کاری دستی، فرآیند گمرک و پرداخت‌های بین‌المللی راهنمایی کنم. مایلید درباره کدام اثر بشنوید؟"
        : "مرحباً بكم في صالة عرض روائع خشب نورستان. أنا مستشارك الرقمي للتراث العريق. أدلك على خيارات الأخشاب النادرة وسلسلة الشحن الجوي والتحويلات المالية الآمنة. كيف يمكنني خدمتك اليوم؟"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = currentLocale === 'en'
    ? [
        "Worldwide shipping vaults?",
        "Wholesale for hotels?",
        "Custom panels period?",
        "Crypto & HesabPay setup?"
      ]
    : currentLocale === 'fa'
    ? [
        "فرآیند حمل و نقل هوایی؟",
        "تخفیف ویژه همکاران؟",
        "مدت تراش ست مبل شاهانه؟",
        "راهنمای پرداخت کریپتو؟"
      ]
    : [
        "شحن المنحوتات كابول؟",
        "طلب الجملة للفنادق؟",
        "فترة صياغة الأوتاد؟",
        "شرح دفع ويسترن يونيون؟"
      ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    // Simple client-side spam limit guard (15 messages max per session)
    if (usageCount >= 15) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: textToSend },
        {
          role: 'assistant',
          text: currentLocale === 'en'
            ? "You have reached our standard session limit. To consult directly with Shafiqullah Nooristani, please click our executive WhatsApp button on the bottom of the page!"
            : "شما به حداکثر تعداد پیام‌های مجاز در این جلسه گفتگو رسیده‌اید. جهت گفتگوی مستقیم با مدیریت کارگاه لطفا بر روی کلید واتساپ کلیک فرمایید!"
        }
      ]);
      setInputText('');
      return;
    }

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setUsageCount(prev => prev + 1);

    try {
      // Map existing messages to required backend structure for continuous memory
      const history = messages
        .filter((_, i) => i > 0) // skip greeting
        .slice(-6) // keep last 6 turns to save context tokens
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history
        })
      });

      if (!response.ok) {
        throw new Error('Server issues');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.text || 'Ambassador was unable to finalize thought. Please retry shortly.' }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: currentLocale === 'en'
            ? "The celestial link is currently weak. Please feel free to complete your custom quote details or initiate a secure chat directly with our WhatsApp line!"
            : "اتصال به شبکه کارگاه با اختلال موقت مواجه شد. لطفا فرآیند ثبت استعلام سفارش خود را مستقیماً در فرم مربوطه درج نمایید یا با دسک واتساپ تماس حاصل فرمایید."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentDirectionClass = isRtl ? 'text-right' : 'text-left';

  return (
    <>
      {/* Floating Trigger Widget icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-[#C5A880] text-black p-4 rounded-full shadow-2xl hover:bg-[#EED6A3] transition-all duration-300 flex items-center justify-center border border-[#9A7D55] group cursor-pointer animate-pulse"
        id="ai-assistant-bubble"
        title="NWH Heritage Representative"
      >
        <MessageSquare className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out text-[10px] uppercase tracking-widest font-bold font-sans whitespace-nowrap pl-0 group-hover:pl-2">
          {currentLocale === 'en' && 'Heritage Representative'}
          {currentLocale === 'fa' && 'مشاور صنایع چوب'}
          {currentLocale === 'ar' && 'مستشار روائع خشب'}
        </span>
      </button>

      {/* Slide-out Sidebar Panel */}
      {isOpen && (
        <div
          className={`fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[450px] bg-[#0A0A0A] border-l border-[#2A1E17] shadow-2xl flex flex-col justify-between font-sans overflow-hidden transition-all duration-500 ease-in-out`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* HEADER BAR */}
          <div className="bg-[#050505] p-5 border-b border-[#2A1E17] flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 border border-[#C5A880]/30 rounded bg-[#101010]">
                <Sparkles className="h-4 w-4 text-[#C5A880]" />
              </div>
              <div className={currentDirectionClass}>
                <h3 className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">NWH AI Representative</h3>
                <p className="text-[10px] text-gray-500 font-light leading-none">cultural preservation companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1E1E1E] rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* CHAT DISPLAY HUB */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-body bg-[#080808]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-sm px-4 py-3.5 text-xs font-light leading-relaxed whitespace-pre-line shadow-md ${
                    m.role === 'user'
                      ? 'bg-[#1C1612] border border-[#3E2723] text-gray-200 rounded-br-none'
                      : 'bg-[#0E0E0E] border border-[#231A15] text-gray-300 rounded-bl-none'
                  }`}
                >
                  <p className="font-serif italic text-[10px] text-gray-500 mb-1">
                    {m.role === 'user' 
                      ? (currentLocale === 'en' ? 'Inquirer' : currentLocale === 'fa' ? 'شما' : 'السائل')
                      : (currentLocale === 'en' ? 'NWH representative' : currentLocale === 'fa' ? 'راهنمای چوب نورستان' : 'منسق التراث')}
                  </p>
                  <div>{m.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0E0E0E] border border-[#231A15] p-3 rounded-md max-w-[85%] rounded-bl-none">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CHAT SUB-PANEL INPUTS & ADVISORIES */}
          <div className="bg-[#050505] border-t border-[#2A1E17] p-4 space-y-3 shrink-0">
            {/* Quick Helper prompts */}
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((promptText, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(promptText)}
                  className="bg-[#121212] border border-[#2A1E17] hover:border-[#C5A880] text-gray-400 hover:text-[#EED6A3] text-[10px] tracking-wide rounded-sm py-1.5 px-2.5 transition-all cursor-pointer text-left focus:outline-none"
                >
                  <span>{promptText}</span>
                </button>
              ))}
            </div>

            {/* Input Action Form line */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="flex items-center space-x-2 border border-[#2A1E17] rounded-sm bg-[#0E0E0E] px-2.5 py-1.5 focus-within:border-[#C5A880]/60 transition-colors"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentLocale === 'en' ? 'Ask about timbers, dimensions, shipping...' : 'سیوال خود را بنویسید...'}
                className="flex-1 bg-transparent border-none text-xs focus:ring-0 placeholder-gray-600 focus:outline-none py-1 text-gray-200"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="text-[#C5A880] hover:text-[#EED6A3] disabled:text-gray-700 py-1 px-1.5 rounded transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="flex items-center gap-1.5 text-[9px] text-gray-600 tracking-wider">
              <AlertCircle className="h-3 w-3 text-amber-900 shrink-0" />
              <p>
                {currentLocale === 'en' && 'Verified rate limited. Responses powered by cloud server encryption.'}
                {currentLocale === 'fa' && 'سیستم هوشمند ایمن و ضد هرزنامه. هماهنگ با سرورهای کابل.'}
                {currentLocale === 'ar' && 'جلسة آمنة تماماً. الردود والأسعار مرسلة بموافقة شفيق الله.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
