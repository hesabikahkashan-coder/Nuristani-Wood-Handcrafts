export interface TranslatableText {
  en: string;
  fa: string; // Dari/Persian
  ar: string; // Arabic
}

export type Locale = 'en' | 'fa' | 'ar';

export interface Product {
  id: string;
  title: TranslatableText;
  description: TranslatableText;
  story: TranslatableText;
  category: 'heritage' | 'royal' | 'signature' | 'custom';
  materials: TranslatableText;
  dimensions: TranslatableText;
  craftingTime: TranslatableText;
  image: string;
  featured: boolean;
}

export interface BlogPost {
  id: string;
  title: TranslatableText;
  slug: string;
  content: TranslatableText;
  excerpt: TranslatableText;
  image: string;
  category: string; // 'Craftsmanship' | 'Culture' | 'Woodworking' | 'News'
  date: string;
  author: TranslatableText;
  status: 'draft' | 'published';
  metaTitle?: TranslatableText;
  metaDesc?: TranslatableText;
}

export interface Inquiry {
  id: string;
  type: 'custom' | 'quote' | 'wholesale' | 'contact';
  name: string;
  email: string;
  phone: string;
  country: string;
  description: string;
  quantity?: number;
  budgetRange?: string;
  imageRef?: string; // base64 or storage url
  date: string;
  status: 'pending' | 'contacted' | 'resolved';
  notes?: string;
  trackingId: string;
}

export interface OrderItem {
  productId: string;
  productTitle: TranslatableText;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  paymentMethod: 'hesabpay' | 'crypto' | 'westernunion';
  paymentDetails: {
    txId?: string;
    receiptUrl?: string; // base64 or local file URL
    cryptoNetwork?: 'TRC20' | 'BEP20' | 'BTC' | 'ETH';
    cryptoCoin?: 'USDT' | 'BTC' | 'ETH';
    notes?: string;
  };
  status: 'pending_payment' | 'payment_verified' | 'crafting' | 'shipped' | 'delivered' | 'rejected';
  total?: string;
  date: string;
  notes?: string;
}

export interface ContactSettings {
  primaryWhatsApp: string;
  secondaryWhatsApp: string;
  phone: string;
  email: string;
  location: TranslatableText;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface PaymentGateways {
  hesabpayEnabled: boolean;
  hesabpayMerchantId: string;
  cryptoEnabled: boolean;
  cryptoWallets: {
    usdt_trc20: string;
    usdt_bep20: string;
    btc: string;
    eth: string;
  };
  westernUnionEnabled: boolean;
  westernUnionRecipient: string;
  westernUnionAddress: TranslatableText;
  westernUnionInstructions: TranslatableText;
}

export interface WebsiteSettings {
  showPrices: boolean;
  heroHeadline: TranslatableText;
  heroSubheadline: TranslatableText;
  contact: ContactSettings;
  payment: PaymentGateways;
}

export interface DashboardStats {
  inquiriesCount: number;
  ordersCount: number;
  unreadInquiries: number;
  pendingOrders: number;
}
