import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { 
  Search, 
  Copy, 
  Check, 
  ShieldAlert, 
  CreditCard, 
  Send, 
  Upload, 
  Clock, 
  Package, 
  Truck, 
  Compass, 
  CheckCircle2, 
  Coins, 
  Award,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface TrackOrderViewProps {
  currentLocale: Locale;
}

export default function TrackOrderView({ currentLocale }: TrackOrderViewProps) {
  const [orderId, setOrderId] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any | null>(null);

  // Copy feedbacks
  const [copiedText, setCopiedText] = useState('');
  
  // Custom Payment triggers state
  const [activePaymentTab, setActivePaymentTab] = useState<'hesabpay' | 'crypto' | 'western_union'>('hesabpay');
  const [cryptoCoin, setCryptoCoin] = useState('USDT (TRC20)');
  const [txId, setTxId] = useState('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState('');
  const [mtcn, setMtcn] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  const location = useLocation();
  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';

  // Read URL search query for prefilled Order IDs (e.g. from submissions)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get('orderId');
    if (idParam) {
      setOrderId(idParam);
      handleSearch(idParam);
    }
  }, [location.search]);

  const handleSearch = async (targetId?: string) => {
    const searchId = targetId || orderId;
    if (!searchId.trim()) return;

    setSearching(true);
    setError('');
    setOrder(null);
    setPaymentSuccessMsg('');

    try {
      // Find the order directly by checking its public endpoint or simulating it
      const res = await fetch(`/api/orders/${searchId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError(getTranslation('orderNotFound', currentLocale));
      }
    } catch (e) {
      setError(getTranslation('orderNotFound', currentLocale));
    } finally {
      setSearching(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Convert files to base64 for submission
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger HesabPay Session Generation Redirect
  const handleHesabPayPayment = async () => {
    if (!order) return;
    setSubmittingPayment(true);
    try {
      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: 25000, currency: 'AFN' }) // Quoted amount
      });
      if (res.ok) {
        const data = await res.json();
        if (data.payment_url) {
          // Open direct window redirect to complete checking on HesabPay
          window.location.href = data.payment_url;
        } else {
          setError('Could not generate automatic checkout redirect.');
        }
      } else {
        setError('Checkout gateway timed out. Please try again.');
      }
    } catch (e) {
      setError('Checkout gateway connections offline.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Direct manual submit proof (Crypto OR Western Union)
  const handleSubmitPaymentProof = async (type: 'crypto' | 'westernunion') => {
    if (!order) return;
    setSubmittingPayment(true);
    setError('');

    const payload: any = {
      method: type,
      notes: type === 'crypto' 
        ? `USDT Ledger Deposit. Coin Selected: ${cryptoCoin}. TXID: ${txId}`
        : `Western Union Wire Transfer. MTCN Control Code: ${mtcn}`
    };

    if (receiptFile) {
      payload.receiptUrl = receiptFile; // We pass base64 file buffer
    }

    try {
      const res = await fetch(`/api/orders/${order.id}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setPaymentSuccessMsg(
          isRtl 
            ? 'رسید با موفقیت ثبت شد. مدیریت پس از تایید فیش از طریق واتساپ با شما در تماس خواهد بود.' 
            : 'Payment receipt submitted successfully! Our Kabul billing curator is validating your hash and will update WhatsApp soon.'
        );
        // Clear forms
        setTxId('');
        setMtcn('');
        setReceiptFile(null);
        setReceiptName('');
      } else {
        const errData = await res.json();
        setError(errData.error || 'Proof submission aborted.');
      }
    } catch (e) {
      setError('Connection interrupted during upload.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Render tracking steps progress bars
  const renderProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending_payment', label: currentLocale === 'fa' ? 'در انتظار پرداخت' : currentLocale === 'ar' ? 'انتظار الدفع' : 'Order Quoted', icon: Clock },
      { key: 'paid', label: currentLocale === 'fa' ? 'پرداخت تایید شده' : currentLocale === 'ar' ? 'تم تأكيد الدفع' : 'Payment Cleared', icon: CheckCircle2 },
      { key: 'processing', label: currentLocale === 'fa' ? 'حکاکی هندسی چوب' : currentLocale === 'ar' ? 'جاري النقش الفني' : 'In Carving Studio', icon: Compass },
      { key: 'shipped', label: currentLocale === 'fa' ? 'ارسال از کابل' : currentLocale === 'ar' ? 'تم شحن الصندوق' : 'Shipped & Routed', icon: Truck },
      { key: 'delivered', label: currentLocale === 'fa' ? 'تحویل گردید' : currentLocale === 'ar' ? 'تم التسليم للعنوان' : 'At Destination', icon: Award }
    ];

    const getStatusIndex = (currentStatus: string) => {
      switch (currentStatus) {
        case 'pending_payment': return 0;
        case 'paid': return 1;
        case 'processing': return 2;
        case 'shipped': return 3;
        case 'delivered': return 4;
        default: return 0;
      }
    };

    const activeIndex = getStatusIndex(status);

    return (
      <div className="space-y-6 bg-[#0E0E0E] p-6 rounded border border-[#231A15]">
        <h4 className="text-xs uppercase tracking-widest text-[#C5A880] border-b border-[#1A1A1A] pb-2 font-semibold">
          {currentLocale === 'fa' ? 'خط زمانی پیشرفت سفارش بومی' : currentLocale === 'ar' ? 'الجدول الزمني للتحفة الفنية' : 'Artisan Commission Timeline'}
        </h4>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 relative">
          {/* Connector Line in Desktop */}
          <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-[1px] bg-[#2A1E17] z-0" />
          
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={st.key} className="flex flex-col items-center text-center z-10 w-full md:w-[18%]">
                <div className={`p-3 rounded-full border transition-all duration-700 ${
                  isCurrent 
                    ? 'bg-[#C5A880] text-black border-[#C5A880] scale-110 shadow-lg shadow-[#C5A880]/20'
                    : isCompleted
                    ? 'bg-[#151210] text-[#C5A880] border-[#C5A880]'
                    : 'bg-[#090909] text-gray-600 border-[#222222]'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3.5">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold block ${
                    isCurrent ? 'text-[#C5A880]' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // USDT and BTC Wallets
  const cryptoWallets = {
    'USDT (TRC20)': 'TJgNuRiStAnIWoOdHaNdCrAfTsXyZ9999trc',
    'USDT (BEP20)': '0xbEfDNuRiStAnIWoOdHaNdCrAfTs8888bep20',
    'ETH (Ethereum)': '0xNuRiStAnIWoOdHaNdCrAfTsFffFethWallet',
    'BTC (Bitcoin)': '1NuRiStAnIWoOdHaNdCrAfTs999BtcWallet'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-sans text-gray-200">
      <div className="space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h2 className="font-serif text-2xl md:text-3xl tracking-wide text-[#EED6A3] uppercase font-light">
            {getTranslation('trackTitle', currentLocale)}
          </h2>
          <p className="max-w-xl mx-auto text-xs text-gray-500 leading-relaxed font-light">
            {getTranslation('trackExplain', currentLocale)}
          </p>
        </div>

        {/* TRACK BAR SEARCH */}
        <div className="bg-[#0F0F0F] p-6 rounded border border-[#2A1E17] shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={isRtl ? 'کد سفارش خود را وارد کنید (مانند ORD-123456-789)' : 'Enter Order ID (e.g. ORD-614728-105)'}
                className={`w-full bg-[#050505] border border-[#2A1E17] text-sm py-3 px-4.5 rounded text-white tracking-widest placeholder-gray-600 focus:outline-none focus:border-[#C5A880] transition-colors ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              />
              <Clock className={`absolute top-3.5 ${isRtl ? 'left-4' : 'right-4'} h-4.5 w-4.5 text-gray-600`} />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={searching || !orderId.trim()}
              className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-xs py-3 px-8 rounded cursor-pointer transition-all flex items-center justify-center space-x-2 shrink-0 border border-[#C5A880] active:scale-95 disabled:opacity-40"
            >
              {searching ? (
                <RefreshCw className="h-4 w-4 animate-spin my-0.5" />
              ) : (
                <>
                  <span>{getTranslation('trackButton', currentLocale)}</span>
                  <Search className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className={`p-4 bg-red-950/30 border border-red-900/60 rounded text-xs text-red-300 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
              <ShieldAlert className="h-4 w-4 inline mr-2 align-middle text-red-400" />
              <span className="align-middle">{error}</span>
            </div>
          )}
        </div>

        {/* ORDER PORTAL DETAILED PANEL */}
        {order && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* PROGRESS REGISTRATION */}
            {renderProgressSteps(order.status)}

            {/* ORDER INFORMATION & METADATA SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* DETAILS CARD */}
              <div className="bg-[#0E0E0E] p-6 rounded border border-[#231A15] space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#C5A880] border-b border-[#1A1A1A] pb-2 font-bold flex items-center justify-between">
                  <span>{isRtl ? 'خلاصه فاکتور هنری اثر' : 'Heritage Invoice Specification'}</span>
                  <span className="text-[10px] font-mono text-gray-500 lowercase">{order.id}</span>
                </h4>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-[#151515] pb-2">
                    <span className="text-gray-500">{isRtl ? 'کلکتور سفارش‌دهنده' : 'Client Estate'}</span>
                    <span className="font-semibold text-gray-200">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#151515] pb-2">
                    <span className="text-gray-500">{isRtl ? 'مجرای هماهنگی' : 'Correspondence'}</span>
                    <span className="text-gray-300">{order.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#151515] pb-2">
                    <span className="text-gray-500">{isRtl ? 'مکاتبه تلفنی' : 'Phone'}</span>
                    <span className="text-gray-300">{order.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#151515] pb-2">
                    <span className="text-gray-500">{isRtl ? 'تاریخ صدور فاکتور' : 'Issue Date'}</span>
                    <span className="text-gray-400 font-mono">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#151515] pb-2">
                    <span className="text-gray-500">{isRtl ? 'روش پرداخت گزینش شده' : 'Payment Framework'}</span>
                    <span className="text-amber-500 font-bold uppercase tracking-wider">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[#C5A880] font-semibold">{isRtl ? 'مجموع برآورد ارز صایغ مالی' : 'Budget Quoted (USD)'}</span>
                    <span className="font-serif text-lg font-bold text-[#EED6A3]">{order.total || 'Consultation'}</span>
                  </div>
                </div>
              </div>

              {/* LIST ITEMS COMMISSIONS */}
              <div className="bg-[#0E0E0E] p-6 rounded border border-[#231A15] space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#C5A880] border-b border-[#1A1A1A] pb-2 font-bold">
                  {isRtl ? 'آثار سفارش گذاری شده' : 'Commissioned Masterpieces'}
                </h4>
                
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it: any, index: number) => (
                      <div key={index} className="flex gap-4.5 bg-[#050505] p-3 rounded border border-[#1A1A1A]">
                        {it.image && (
                          <img 
                            src={it.image} 
                            alt={it.title?.en} 
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 object-cover rounded-sm border border-[#2A1E17]" 
                          />
                        )}
                        <div className="space-y-1 my-auto">
                          <h5 className="text-xs font-serif font-bold text-gray-200">
                            {it.title?.[currentLocale] || it.title?.en || it.title}
                          </h5>
                          <p className="text-[10px] text-gray-500 italic lowercase">
                            {it.category || 'Atelier Commission'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-600">
                      {isRtl ? 'سفارش اختصاصی سفارشی چوب' : 'Bespoke Traditional Carving Commission'}
                    </div>
                  )}

                  {order.notes && (
                    <div className="bg-[#110D0A] p-3.5 rounded border border-[#2A1E17]/40">
                      <span className="text-[9px] uppercase tracking-widest text-[#C5A880] block mb-1 font-bold">
                        {isRtl ? 'یادداشت‌های ساخت و آدرس پستی' : 'Atelier Shipments Notes'}
                      </span>
                      <p className="text-[11px] text-gray-400 font-light leading-relaxed">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* INTEGRATED PAYMENT PORTAL (Only shown when state is 'pending_payment') */}
            {order.status === 'pending_payment' && (
              <div className="bg-[#0E0E0E] p-6 rounded border border-amber-900/30 space-y-6">
                
                <div className="border-b border-[#222222] pb-3 text-center">
                  <h3 className="font-serif text-lg text-[#EED6A3]">
                    {isRtl ? 'درگاه تسویه‌حساب و پرداخت نهایی فاکتور' : 'Secure Budget Payment Gateway'}
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    Select your preferred secure payment channel:
                  </p>
                </div>

                {/* Tabs selection */}
                <div className="flex justify-center border-b border-[#222222]">
                  <div className="inline-flex space-x-2 p-1 bg-[#050505] rounded border border-[#222222] mb-4">
                    <button
                      onClick={() => { setActivePaymentTab('hesabpay'); setError(''); }}
                      className={`py-2 px-5 text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer transition-colors ${
                        activePaymentTab === 'hesabpay' ? 'bg-[#C5A880] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      HesabPay afg
                    </button>
                    <button
                      onClick={() => { setActivePaymentTab('crypto'); setError(''); }}
                      className={`py-2 px-5 text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer transition-colors ${
                        activePaymentTab === 'crypto' ? 'bg-[#C5A880] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      USDT / CRYPTO
                    </button>
                    <button
                      onClick={() => { setActivePaymentTab('western_union'); setError(''); }}
                      className={`py-2 px-5 text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer transition-colors ${
                        activePaymentTab === 'western_union' ? 'bg-[#C5A880] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Western Union
                    </button>
                  </div>
                </div>

                {/* SUCCESS NOTIFICATION */}
                {paymentSuccessMsg && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-900 text-xs text-emerald-300 rounded leading-relaxed text-center">
                    <CheckCircle2 className="h-5 w-5 inline mr-2 text-emerald-400 align-middle" />
                    <span className="align-middle">{paymentSuccessMsg}</span>
                  </div>
                )}

                {/* Tabs Views */}
                <div className="space-y-4">
                  
                  {/* (1) HESABPAY */}
                  {activePaymentTab === 'hesabpay' && (
                    <div className="text-center space-y-4 max-w-md mx-auto">
                      <div className="bg-[#151210] p-4.5 rounded border border-[#C5A880]/10 text-xs leading-relaxed text-gray-400">
                        {isRtl 
                          ? 'اتصال خودکار به شبکه پرداخت ملی حسابه افغانستان. فاکتور با نرخ مبادله‌ای روز افغانی صادر و واریز می‌گردد.' 
                          : 'Connect instantly to HesabPay Afghanistan. Your order quoted budget will be processed securely using automatic AFN currency exchange indices.'
                        }
                      </div>
                      
                      <button
                        onClick={handleHesabPayPayment}
                        disabled={submittingPayment}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-widest text-[11px] py-3.5 px-6 rounded cursor-pointer transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-40"
                      >
                        {submittingPayment ? (
                          <RefreshCw className="h-4 w-4 animate-spin my-0.5" />
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>{isRtl ? 'پرداخت آنی با حساب‌پی' : 'Initialize HesabPay Checkout Session'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* (2) CRYPTO LEDGER WITH proofs */}
                  {activePaymentTab === 'crypto' && (
                    <div className="space-y-6 max-w-lg mx-auto">
                      
                      <div className="bg-[#050505] p-5 rounded border border-[#1C1612] space-y-4">
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-widest text-[#C5A880] font-sans font-bold">
                            Select Digital Token Account Wallet
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.keys(cryptoWallets).map((coin) => (
                              <button
                                key={coin}
                                type="button"
                                onClick={() => setCryptoCoin(coin)}
                                className={`p-2 text-[10px] rounded border font-mono tracking-wider font-semibold uppercase ${
                                  cryptoCoin === coin 
                                    ? 'bg-[#1C1612] border-[#C5A880] text-[#EED6A3]' 
                                    : 'bg-[#090909] border-[#222222] text-gray-500'
                                }`}
                              >
                                {coin.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* WALLET ADDRESS DISPLAY */}
                        <div className="bg-[#0F0F0F] p-4 rounded.sm border border-[#222222] flex items-center justify-between font-mono text-xs">
                          <div className="truncate pr-4">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 block mb-0.5">
                              {cryptoCoin} Recipient Wallet Address
                            </span>
                            <span className="text-[#C5A880] select-all font-semibold font-mono tracking-wide">
                              {cryptoWallets[cryptoCoin as keyof typeof cryptoWallets]}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleCopy(cryptoWallets[cryptoCoin as keyof typeof cryptoWallets], 'wallet')}
                            className="p-2 border border-[#222222] hover:border-[#C5A880]/40 rounded text-gray-400 hover:text-[#C5A880] shrink-0"
                          >
                            {copiedText === 'wallet' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* CRYPTO INPUT HASH FORM */}
                      <div className="space-y-4">
                        <h4 className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">
                          Submit Deposit receipt / TxHash
                        </h4>

                        <div className="space-y-3 font-sans">
                          <div>
                            <label className="block text-[9px] uppercase text-gray-500 mb-1">Blockchain Transaction ID (TXID / Hash)</label>
                            <input
                              type="text"
                              value={txId}
                              onChange={(e) => setTxId(e.target.value)}
                              placeholder="Input 64-character hash..."
                              className="w-full bg-[#050505] border border-[#222222] p-2.5 text-xs rounded font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[9px] uppercase text-gray-500 mb-1">Attached Receipt Snapshot / PDF</label>
                              <div className="relative border border-[#222222] hover:border-[#C5A880]/30 rounded bg-[#050505] p-2.5 cursor-pointer flex items-center justify-between text-xs">
                                <span className="truncate text-gray-500 pr-3">
                                  {receiptName || 'Click to select copy...'}
                                </span>
                                <Upload className="h-4 w-4 text-[#C5A880] shrink-0" />
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={handleFileChange}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => handleSubmitPaymentProof('crypto')}
                                disabled={submittingPayment || !txId.trim()}
                                className="w-full bg-transparent hover:bg-[#C5A880] hover:text-black border border-[#C5A880] text-[#C5A880] font-bold uppercase tracking-widest text-[10px] py-3.5 rounded cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
                              >
                                {submittingPayment ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <span>Submit Ledger Proof</span>
                                    <Send className="h-3.5 w-3.5" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* (3) WESTERN UNION TRANSFER */}
                  {activePaymentTab === 'western_union' && (
                    <div className="space-y-6 max-w-lg mx-auto text-xs">
                      
                      <div className="bg-[#050505] p-5 rounded border border-[#1A1A1A] space-y-4">
                        <span className="text-[9px] uppercase tracking-widest text-[#C5A880] block font-bold">
                          Western Union Transfer Beneficiary Recipient
                        </span>
                        
                        <div className="space-y-2.5">
                          <div className="flex justify-between border-b border-[#111111] pb-2 font-mono">
                            <span className="text-gray-500">FullName Recipient</span>
                            <span className="font-semibold text-gray-200">Shafiqullah Nooristani</span>
                          </div>
                          <div className="flex justify-between border-b border-[#111111] pb-2 font-mono">
                            <span className="text-gray-500">Beneficiary Destination</span>
                            <span className="font-semibold text-gray-200">Kabul, Afghanistan</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                          Please instruct Western Union to send payment to Shafiqullah Nooristani in Kabul, Afghanistan. Once the physical deposit is completed, submit the printed receipt’s MTCN code below.
                        </p>
                      </div>

                      {/* WU CONFIRMATION FORM */}
                      <div className="space-y-4">
                        <h4 className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">
                          Western union execution ledger
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] uppercase text-gray-500 mb-1">10-Digit MTCN Identification Code</label>
                            <input
                              type="text"
                              value={mtcn}
                              onChange={(e) => setMtcn(e.target.value)}
                              placeholder="MTCN reference number..."
                              className="w-full bg-[#050505] border border-[#222222] p-2.5 text-xs rounded font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase text-gray-500 mb-1">Deposit Slip Upload</label>
                            <div className="relative border border-[#222222] hover:border-[#C5A880]/30 rounded bg-[#050505] p-2.5 cursor-pointer flex items-center justify-between text-xs">
                              <span className="truncate text-gray-500 pr-3">
                                {receiptName || 'Click to select picture...'}
                              </span>
                              <Upload className="h-4 w-4 text-[#C5A880] shrink-0" />
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSubmitPaymentProof('westernunion')}
                          disabled={submittingPayment || !mtcn.trim()}
                          className="w-full bg-transparent hover:bg-[#C5A880] hover:text-black border border-[#C5A880] text-[#C5A880] font-bold uppercase tracking-widest text-[10px] py-3.5 rounded cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
                        >
                          {submittingPayment ? (
                            <RefreshCw className="h-4 w-4 animate-spin animate-spin" />
                          ) : (
                            <>
                              <span>Verify Western Union Transfer</span>
                              <Send className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* NEED HELP WhatsApp CTA */}
            <div className="bg-[#050505] p-5 rounded border border-[#2A1E17] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif shadow-xl">
              <div>
                <h4 className="text-gray-200 uppercase tracking-widest font-semibold">{isRtl ? 'مشاوره پیرامون باربری و پرداخت بانکی' : 'Atelier Logistic Consultations'}</h4>
                <p className="text-[10px] text-gray-500 mt-1 font-sans">{isRtl ? 'درگاه ساخت کارهای دستی لوکس سفارشی' : 'Your bespoke cedar chests are routed under diplomatic air freight covenants. Contact curators.'}</p>
              </div>
              <a
                href="https://wa.me/93749274000"
                target="_blank"
                rel="noreferrer"
                className="bg-[#101010] border border-[#C5A880]/50 hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] transition-all px-5 py-2.5 rounded text-[10px] tracking-widest font-bold text-[#C5A880] uppercase flex items-center gap-1.5 shrink-0"
              >
                <span>Curator WhatsApp Hotline</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
