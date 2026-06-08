import React, { useState, useEffect } from 'react';
import { Product, BlogPost, Inquiry, Order, WebsiteSettings, DashboardStats } from '../types';
import { getTranslation } from '../lib/i18n';
import { 
  Lock, LayoutDashboard, FolderKanban, Info, Database, LogOut, CheckCircle2, 
  Settings, Key, Image, Users, Layers, MessageSquare, ShoppingCart, TrendingUp, AlertCircle, Plus, Edit, Trash, Check, X, Upload 
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  refreshProducts: () => void;
  blogPosts: BlogPost[];
  refreshBlog: () => void;
  settings: WebsiteSettings;
  refreshSettings: () => void;
  currentLocale: 'en' | 'fa' | 'ar';
}

export default function AdminPanel({
  products,
  refreshProducts,
  blogPosts,
  refreshBlog,
  settings,
  refreshSettings,
  currentLocale
}: AdminPanelProps) {
  // Login Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'blog' | 'inquiries' | 'orders' | 'settings'>('stats');

  // DB Lists
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    inquiriesCount: 0,
    ordersCount: 0,
    unreadInquiries: 0,
    pendingOrders: 0
  });

  // Admin Session Token State
  const [adminToken, setAdminToken] = useState<string>(() => sessionStorage.getItem('nwh_admin_token') || '');

  // Loading indicator for operations
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'success' });

  // Media Library state (for file uploads)
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // --- CRUD States for Products ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // --- CRUD States for Blog Post ---
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  // --- Settings Forms ---
  const [editedSettings, setEditedSettings] = useState<WebsiteSettings | null>(null);

  // Build unified authentication headers
  const getAdminHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
      'x-admin-token': adminToken
    };
  };

  // Load Inquiries, Orders and Stats
  const loadAdminData = async () => {
    if (!adminToken) return;
    try {
      const headers = {
        'Authorization': `Bearer ${adminToken}`,
        'x-admin-token': adminToken
      };
      
      const isResponse = await fetch('/api/stats', { headers });
      if (isResponse.ok) {
        const sData = await isResponse.json();
        setStats(sData);
      }

      const inqResponse = await fetch('/api/inquiries', { headers });
      if (inqResponse.ok) {
        const inqData = await inqResponse.json();
        setInquiries(inqData);
      }

      const ordResponse = await fetch('/api/orders', { headers });
      if (ordResponse.ok) {
        const ordData = await ordResponse.json();
        setOrders(ordData);
      }
    } catch (e) {
      console.error('Error fetching admin statistics:', e);
    }
  };

  // Verify token handshake on startup
  useEffect(() => {
    const checkTokenHandshake = async () => {
      if (adminToken) {
        try {
          const res = await fetch('/api/admin/verify', {
            headers: { 'Authorization': `Bearer ${adminToken}`, 'x-admin-token': adminToken }
          });
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setEditedSettings(settings);
          } else {
            sessionStorage.removeItem('nwh_admin_token');
            setAdminToken('');
            setIsAuthenticated(false);
          }
        } catch {
          // Fallback offline silently
        }
      }
    };
    checkTokenHandshake();
  }, [adminToken, settings]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
      setEditedSettings(settings);
    }
  }, [isAuthenticated, settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('nwh_admin_token', data.token);
        setAdminToken(data.token);
        setIsAuthenticated(true);
        showBanner('Secure login achieved. Access granted for curator Shafiqullah Nooristani.', 'success');
      } else {
        setAuthError(data.error || 'Unauthorized. Credentials do not match.');
      }
    } catch {
      setAuthError('Communication failure. Please verify backend configurations.');
    }
  };

  const showBanner = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: 'success' }), 5000);
  };

  // --- MEDIA UPLOAD HELPER ---
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-token': adminToken
          },
          body: JSON.stringify({
            fileName: file.name,
            base64Data
          })
        });
        const data = await res.json();
        if (data.success) {
          setMediaUploadUrl(data.url);
          showBanner('Asset successfully written to local atelier cloud!', 'success');
        } else {
          showBanner('Asset uploading failed.', 'error');
        }
      } catch (err) {
        console.error(err);
        showBanner('Error uploading image', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- PRODUCT CRUD HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: '',
      title: { en: '', fa: '', ar: '' },
      description: { en: '', fa: '', ar: '' },
      story: { en: '', fa: '', ar: '' },
      category: 'heritage',
      materials: { en: '', fa: '', ar: '' },
      dimensions: { en: '', fa: '', ar: '' },
      craftingTime: { en: '', fa: '', ar: '' },
      image: '',
      featured: false
    });
    setMediaUploadUrl('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setMediaUploadUrl(prod.image);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setActionLoading(true);
    // Bind upload result or local image
    const payload = {
      ...editingProduct,
      image: mediaUploadUrl || editingProduct.image || '/src/assets/images/nuristani_hero_casket_1780946329749.png'
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showBanner('Product catalog record saved successfully!', 'success');
        setIsProductModalOpen(false);
        refreshProducts();
        loadAdminData();
      } else {
        showBanner('Database rejected product parameters.', 'error');
      }
    } catch (error) {
      console.error(error);
      showBanner('Failed to save product in database.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Forbid deletion of this heritage asset? Proceed only if decommissioned.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken
        }
      });
      if (res.ok) {
        showBanner('Product successfully purged from public registry.', 'success');
        refreshProducts();
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
      showBanner('purging failed.', 'error');
    }
  };

  // --- BLOG CRUD HANDLERS ---
  const handleOpenAddPost = () => {
    setEditingPost({
      id: '',
      title: { en: '', fa: '', ar: '' },
      slug: '',
      content: { en: '', fa: '', ar: '' },
      excerpt: { en: '', fa: '', ar: '' },
      image: '',
      category: 'Craftsmanship',
      date: new Date().toISOString().split('T')[0],
      author: { en: 'Shafiqullah Nooristani', fa: 'شفیق‌الله نورستانی', ar: 'شفيق الله نورستاني' },
      status: 'draft'
    });
    setMediaUploadUrl('');
    setIsBlogModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setActionLoading(true);
    const payload = {
      ...editingPost,
      image: mediaUploadUrl || editingPost.image || '/src/assets/images/nuristani_carving_detail_1780946369156.png',
      slug: editingPost.slug || `entry-${Date.now()}`
    };

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showBanner('Blog post entry successfully written and indexed!', 'success');
        setIsBlogModalOpen(false);
        refreshBlog();
      }
    } catch (err) {
      console.error(err);
      showBanner('Failed to save blog post.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Permit permanent purge of this chronicle entry?')) return;
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken
        }
      });
      if (res.ok) {
        showBanner('Chronicle post deleted.', 'success');
        refreshBlog();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- INQUIRY STATUS HANDLERS ---
  const handleUpdateInquiryStatus = async (id: string, status: 'pending' | 'contacted' | 'resolved', notes: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        showBanner('Inquiry file updated successfully.', 'success');
        loadAdminData();
      }
    } catch (e) {
      showBanner('Failed to write updates.', 'error');
    }
  };

  // --- ORDER STATUS HANDLERS ---
  const handleUpdateOrderStatus = async (id: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        showBanner('Order status advanced along the pipeline.', 'success');
        loadAdminData();
      }
    } catch (ee) {
      showBanner('Order update rejected.', 'error');
    }
  };

  // --- SAVE SYSTEM SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedSettings) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(editedSettings)
      });
      if (res.ok) {
        showBanner('Curator system configurations successfully published!', 'success');
        refreshSettings();
        loadAdminData();
      }
    } catch (e) {
      showBanner('Atelier rejects your configurations.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-24 bg-[#0E0E0E] border border-[#2A1E17] p-8 rounded shadow-2xl font-sans" dir="ltr">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 border border-[#C5A880]/30 rounded bg-[#151515] text-[#C5A880]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg uppercase tracking-widest font-bold text-[#C5A880] font-serif">Staff Sign In</h2>
          <p className="text-xs text-gray-500 font-light leading-relaxed">
            Authorized admin credentials required to modify product ledgers, read client commissions, and configure crypt wallets.
          </p>
        </div>

        {authError && (
          <div className="bg-red-950/40 border border-red-900 text-red-300 p-3 rounded text-xs mb-5 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">curator email</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-3 text-xs focus:outline-none focus:border-[#C5A880] rounded"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-gray-500 font-bold mb-2">atelier secret key</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-3 text-xs focus:outline-none focus:border-[#C5A880] rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-xs py-3.5 rounded transition-all cursor-pointer"
          >
            Unlock Ledger
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 font-sans" dir="ltr">
      
      {/* SUCCESS/ERROR BANNERS */}
      {statusMessage.text && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded shadow-2xl px-6 py-4.5 border text-xs flex items-center gap-3 animate-bounce ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-850 text-emerald-300' 
            : 'bg-red-950/90 border-red-850 text-red-300'
        }`}>
          <CheckCircle2 className="h-5 w-5 text-[#C5A880]" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#2A1E17] pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] tracking-[0.2em] text-[#C5A880] uppercase font-bold">Atelier Executive Console</span>
          <h1 className="text-2xl font-serif text-gray-100 uppercase tracking-widest mt-1.5">Management Portal</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 italic hidden sm:block">shafigullah@gmail.com (Root Admin)</p>
          <button
            onClick={async () => {
              try {
                await fetch('/api/admin/logout', {
                  method: 'POST',
                  headers: { 'x-admin-token': adminToken }
                });
              } catch {}
              sessionStorage.removeItem('nwh_admin_token');
              setAdminToken('');
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-1.5 border border-[#4E3629] text-gray-400 hover:text-white px-3 py-2 rounded text-xs transition-colors cursor-pointer"
          >
            <span>Lock</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL TAB MENU */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-[#1C130D] pb-3 text-xs">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'stats' ? 'bg-[#1C1612] border border-[#C5A880] text-[#EED6A3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Atelier Overview</span>
        </button>
        
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'products' ? 'bg-[#1C1612] border border-[#C5A880] text-[#EED6A3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          <span>Products</span>
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'blog' ? 'bg-[#1C1612] border border-[#C5A880] text-[#EED6A3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Chronicles</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer relative ${
            activeTab === 'inquiries' ? 'bg-[#1C1612] border border-[#C5A880] text-[#EED6A3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Inquiries</span>
          {stats.unreadInquiries > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {stats.unreadInquiries}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer relative ${
            activeTab === 'orders' ? 'bg-[#1C1612] border border-[#C5A880] text-[#EED6A3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Orders</span>
          {stats.pendingOrders > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {stats.pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'settings' ? 'bg-[#1C1612] border border-[#C5A880] text-[#EED6A3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Atelier Engine Config</span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}

      {/* 1) TAB: STATS OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0E0E0E] border border-[#2A1E17] p-6 rounded relative">
              <div className="text-gray-500 uppercase text-[9px] tracking-widest font-bold">Unprocessed Inquiries</div>
              <div className="text-3xl text-[#C5A880] font-serif font-semibold mt-2">{stats.unreadInquiries}</div>
              <div className="text-[10px] text-gray-500 mt-2">Active client quotes to call</div>
              <MessageSquare className="h-6 w-6 text-gray-800 absolute right-4 bottom-4" />
            </div>

            <div className="bg-[#0E0E0E] border border-[#2A1E17] p-6 rounded relative">
              <div className="text-gray-500 uppercase text-[9px] tracking-widest font-bold">Pending Orders</div>
              <div className="text-3xl text-emerald-500 font-serif font-semibold mt-2">{stats.pendingOrders}</div>
              <div className="text-[10px] text-gray-500 mt-2">Orders awaiting payment verification</div>
              <ShoppingCart className="h-6 w-6 text-gray-800 absolute right-4 bottom-4" />
            </div>

            <div className="bg-[#0E0E0E] border border-[#2A1E17] p-6 rounded relative">
              <div className="text-gray-500 uppercase text-[9px] tracking-widest font-bold">Total Inquiries Logged</div>
              <div className="text-3xl text-gray-300 font-serif font-semibold mt-2">{stats.inquiriesCount}</div>
              <div className="text-[10px] text-gray-500 mt-2">Historic lead collection</div>
              <TrendingUp className="h-6 w-6 text-gray-800 absolute right-4 bottom-4" />
            </div>

            <div className="bg-[#0E0E0E] border border-[#2A1E17] p-6 rounded relative">
              <div className="text-gray-500 uppercase text-[9px] tracking-widest font-bold">Catalog Items Count</div>
              <div className="text-3xl text-[#C5A880] font-serif font-semibold mt-2">{products.length}</div>
              <div className="text-[10px] text-gray-500 mt-2">Active wood designs on display</div>
              <Database className="h-6 w-6 text-gray-800 absolute right-4 bottom-4" />
            </div>
          </div>

          {/* Quick instructions and diagnostics */}
          <div className="bg-[#100D0B] border border-[#3A2A1E] p-6 rounded">
            <h3 className="text-[#C5A880] text-sm uppercase tracking-wider font-semibold font-serif mb-2">Curator Action Hub</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light mb-4">
              From this operational base, you can upload picture templates, view inquiries submitted by international high-end interior designers, toggle pricing visibility publicly, and configure Western Union recipient guidelines.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('products')} className="bg-[#C5A880] text-black hover:bg-[#EED6A3] text-[10px] font-semibold tracking-widest uppercase py-2 px-4 rounded cursor-pointer">
                Manage Products
              </button>
              <button onClick={() => setActiveTab('settings')} className="border border-[#4E3629] text-[#C5A880] hover:bg-[#C5A880]/15 text-[10px] font-semibold tracking-widest uppercase py-2 px-4 rounded cursor-pointer">
                Configure Wallet Addresses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2) TAB: PRODUCTS CRUD LISTINGS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#C5A880] font-serif">Product Catalog Ledger</h2>
            <button
              onClick={handleOpenAddProduct}
              className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold text-[10px] tracking-widest uppercase py-2 px-4 rounded flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom Piece</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#2A1E17] rounded">
            <table className="w-full text-left text-xs bg-[#0E0E0E]">
              <thead className="bg-[#050505] text-[10px] tracking-widest uppercase font-bold text-[#C5A880] border-b border-[#2A1E17]">
                <tr>
                  <th className="p-4">Visual</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Dimensions</th>
                  <th className="p-4">Crafting Time</th>
                  <th className="p-4">Promo</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1611]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#151515] transition-colors">
                    <td className="p-4">
                      <img src={prod.image} alt="" className="h-10 w-10 object-cover border border-[#2A1E17] rounded-sm" referrerPolicy="no-referrer" />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{prod.title.en}</div>
                      <div className="text-[10px] text-gray-500 font-serif leading-none mt-1">{prod.title.fa}</div>
                    </td>
                    <td className="p-4 capitalize text-gray-400 font-serif italic">{prod.category} Series</td>
                    <td className="p-4 text-gray-400 font-light text-[11px]">{prod.dimensions.en}</td>
                    <td className="p-4 text-gray-400 font-light text-[11px]">{prod.craftingTime.en}</td>
                    <td className="p-4">
                      {prod.featured ? (
                        <span className="bg-amber-900/40 border border-amber-800 text-[#C5A880] text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded">Featured</span>
                      ) : (
                        <span className="text-gray-600 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="bg-transparent border border-[#4E3629] text-[#C5A880] hover:bg-[#C5A880]/10 p-1.5 rounded transition-all cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="bg-transparent border border-red-950 text-red-400 hover:bg-red-950/20 p-1.5 rounded transition-all cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3) TAB: CLASSIFIED CHRONICLES */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#C5A880] font-serif font-medium">Historical Chronicles & Research</h2>
            <button
              onClick={handleOpenAddPost}
              className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold text-[10px] tracking-widest uppercase py-2 px-4 rounded flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Journal Entry</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#2A1E17] rounded">
            <table className="w-full text-left text-xs bg-[#0E0E0E]">
              <thead className="bg-[#050505] text-[10px] tracking-widest uppercase font-bold text-[#C5A880] border-b border-[#2A1E17]">
                <tr>
                  <th className="p-4">Visual</th>
                  <th className="p-4">Title (English)</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1611]">
                {blogPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#151515] transition-colors">
                    <td className="p-4">
                      <img src={post.image} alt="" className="h-10 w-10 object-cover border border-[#2A1E17] rounded-sm" referrerPolicy="no-referrer" />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{post.title.en}</div>
                      <div className="text-[10px] text-gray-500 font-serif leading-none mt-1">{post.title.fa}</div>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{post.category}</td>
                    <td className="p-4 text-gray-400 font-mono text-[11px]">{post.date}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold border ${
                        post.status === 'published' 
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                          : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setMediaUploadUrl(post.image);
                            setIsBlogModalOpen(true);
                          }}
                          className="bg-transparent border border-[#4E3629] text-[#C5A880] hover:bg-[#C5A880]/10 p-1.5 rounded transition-all cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(post.id)}
                          className="bg-transparent border border-red-950 text-red-400 hover:bg-red-950/20 p-1.5 rounded transition-all cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4) TAB: INQUIRIES REGISTER LOGS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#C5A880] font-serif font-medium">Bespoke Inquiries & Custom Quotes</h2>
            <span className="text-[10px] text-gray-500 font-mono">Store total: {inquiries.length} requests</span>
          </div>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-[#0E0E0E] p-6 rounded border border-[#2A1E17] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#231A15] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-semibold">{inq.name}</span>
                      <span className="bg-[#1C1612] text-[#C5A880] border border-[#4E3629] text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold">
                        {inq.trackingId}
                      </span>
                      <span className="text-xs text-gray-500 italic uppercase">({inq.type} request)</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 font-light leading-none">
                      {inq.email} | {inq.phone} | <span className="font-semibold text-[#C5A880]">{inq.country}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block sm:text-right">{new Date(inq.date).toLocaleString()}</span>
                    
                    {/* Status badge toggler */}
                    <div className="mt-2.5 flex items-center gap-1">
                      <span className="text-[9px] text-gray-600 uppercase tracking-wider mr-1">Status:</span>
                      {(['pending', 'contacted', 'resolved'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateInquiryStatus(inq.id, st, inq.notes || '')}
                          className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                            inq.status === st
                              ? st === 'pending'
                                ? 'bg-amber-950 border border-amber-700 text-amber-300'
                                : st === 'contacted'
                                ? 'bg-blue-950 border border-blue-700 text-blue-300'
                                : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                              : 'bg-transparent text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submited info description */}
                <div className="text-xs text-gray-300 bg-[#070707] p-3.5 border border-[#1A110D] font-light italic leading-relaxed whitespace-pre-wrap">
                  {inq.description}
                </div>

                {/* Parameters budget, quantity, uploaded images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-light text-gray-400">
                  {inq.budgetRange && (
                    <div>
                      <span className="text-[10px] uppercase text-gray-600 block leading-none mb-1">Declared Budget Group</span>
                      <span className="font-serif italic text-gray-300 text-sm">{inq.budgetRange}</span>
                    </div>
                  )}
                  {inq.quantity && (
                    <div>
                      <span className="text-[10px] uppercase text-gray-600 block leading-none mb-1">Bespoke Quantity</span>
                      <span className="font-serif italic text-gray-300 text-sm">{inq.quantity}</span>
                    </div>
                  )}
                  {inq.imageRef && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase text-gray-600 block leading-none mb-1">Client Attachement</span>
                      <a 
                        href={inq.imageRef} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#C5A880] hover:text-[#EED6A3] font-mono leading-none mt-1 underline truncate block"
                      >
                        [Open Attachment File]
                      </a>
                    </div>
                  )}
                </div>

                {/* Admin private notes */}
                <div className="bg-[#101010] p-4.5 rounded border border-[#271E1A] space-y-2">
                  <label className="block text-[10px] tracking-widest uppercase text-[#C5A880] font-bold">Curator Case Remarks</label>
                  <textarea
                    defaultValue={inq.notes || ''}
                    onBlur={(e) => handleUpdateInquiryStatus(inq.id, inq.status, e.target.value)}
                    placeholder="Enter private notes here (e.g. TIMCS cedar price quoted, sent WhatsApp draft...). Click outside box to save automatically."
                    className="w-full bg-[#050505] p-3 text-xs text-gray-300 border border-[#2A1E17] focus:outline-none focus:border-[#C5A880] rounded h-16 min-h-[64px]"
                  />
                  <p className="text-[9px] text-gray-600 italic">Click outside the text block directly to write the memo to server files.</p>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5) TAB: ORDERS PIPELINE */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#C5A880] font-serif font-medium">Atelier Order & Payments Registry</h2>
            <span className="text-[10px] text-gray-500 font-mono">Store total: {orders.length} orders</span>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-[#0E0E0E] p-6 rounded border border-[#2A1E17] space-y-4">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#231A15] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#C5A880] font-serif uppercase tracking-widest font-bold text-lg">{ord.id}</span>
                      <span className="text-gray-500 text-xs">|</span>
                      <span className="text-gray-300 font-medium">{ord.customerName}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 font-light leading-none">
                      {ord.email} | {ord.phone} | Submitted: <span className="font-mono">{new Date(ord.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs uppercase text-gray-500 font-light mr-1 block leading-none">Payment Channel:</span>
                    <span className="text-xs text-gray-200 font-semibold uppercase block mt-1.5">{ord.paymentMethod}</span>
                  </div>
                </div>

                {/* Grid layout containing structural parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  
                  {/* Ledger Items ordered */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Ordered Commissions</h4>
                    <div className="bg-[#050505] p-3 rounded border border-[#1C130D] space-y-2">
                      {ord.items.map((it, iIdx) => (
                        <div key={iIdx} className="flex justify-between hover:text-white">
                          <span>{it.productTitle.en}</span>
                          <span className="font-semibold text-[#C5A880]">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center bg-[#151210] p-3 border border-[#271F1A]">
                      <span className="uppercase text-[9px] text-[#C5A880] tracking-widest">Pricing range / Quote</span>
                      <span className="font-semibold text-gray-200 font-mono text-sm">{ord.total}</span>
                    </div>
                  </div>

                  {/* Payment Verification credentials uploaded */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Transaction Data Ledger</h4>
                    <div className="bg-[#050505] p-4.5 rounded border border-[#1C130D] space-y-2.5">
                      {ord.paymentDetails.txId && (
                        <div>
                          <span className="text-[9px] text-gray-600 uppercase block">Crypt Hash / MTCN code</span>
                          <span className="font-mono text-[10px] text-[#C5A880] block truncate">{ord.paymentDetails.txId}</span>
                        </div>
                      )}
                      {ord.paymentDetails.cryptoCoin && (
                        <div className="flex justify-between">
                          <span className="text-[9px] text-gray-600 uppercase">Coin network</span>
                          <span className="font-semibold text-gray-300">{ord.paymentDetails.cryptoCoin} ({ord.paymentDetails.cryptoNetwork})</span>
                        </div>
                      )}
                      
                      {/* Western Union physical receipt display */}
                      {ord.paymentDetails.receiptUrl && (
                        <div>
                          <span className="text-[9px] text-gray-600 uppercase block mb-1">Uploaded receipt</span>
                          <a 
                            href={ord.paymentDetails.receiptUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#C5A880] hover:text-[#EED6A3] font-mono hover:underline text-[11px] font-medium"
                          >
                            [Review Receipt Image]
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Workflow status advance timeline */}
                <div className="bg-[#121212] p-4 border border-[#2A1E17] flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                    <span className="uppercase tracking-widest text-[9px] text-gray-600 mr-2">Core Workflow Status:</span>
                    {['pending_payment', 'payment_verified', 'crafting', 'shipped', 'delivered', 'rejected'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(ord.id, st, ord.notes || '')}
                        className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded cursor-pointer ${
                          ord.status === st
                            ? 'bg-[#C5A880] text-black border border-[#C5A880]'
                            : 'bg-[#181818] text-gray-400 hover:text-white border border-[#282828]'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Executive notes updates */}
                <div className="bg-[#050505] p-4 border border-[#231710]">
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Curator Case Notes</label>
                  <textarea
                    defaultValue={ord.notes || ''}
                    onBlur={(e) => handleUpdateOrderStatus(ord.id, ord.status, e.target.value)}
                    placeholder="Provide logistics comments (commissioned to master carver, freight tracking numbers...). Saved automatically."
                    className="w-full bg-[#101010] p-3 text-xs text-gray-300 border border-[#2A1E17] focus:outline-none focus:border-[#C5A880] rounded h-16 min-h-[64px]"
                  />
                  <p className="text-[9px] text-gray-650 italic mt-1 font-light">Writes immediately back when text focus is released.</p>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6) TAB: PORTAL SETTINGS & TEXT GENERATION */}
      {activeTab === 'settings' && editedSettings && (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-fadeIn text-xs">
          
          {/* Headline and text configs */}
          <div className="bg-[#0E0E0E] p-6 rounded border border-[#2A1E17] space-y-6">
            <h3 className="text-sm font-serif uppercase tracking-widest text-[#C5A880] font-bold border-b border-[#231A15] pb-2">Hero Headline Controls</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Headline block */}
              <div className="space-y-4">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hero Slate Headline (English)</h4>
                <input
                  type="text"
                  value={editedSettings.heroHeadline.en}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    heroHeadline: { ...editedSettings.heroHeadline, en: e.target.value }
                  })}
                  className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-3 text-xs rounded"
                />

                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hero Slate Headline (Dari)</h4>
                <input
                  type="text"
                  value={editedSettings.heroHeadline.fa}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    heroHeadline: { ...editedSettings.heroHeadline, fa: e.target.value }
                  })}
                  className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-3 text-xs text-right rounded"
                />

                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hero Slate Headline (Arabic)</h4>
                <input
                  type="text"
                  value={editedSettings.heroHeadline.ar}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    heroHeadline: { ...editedSettings.heroHeadline, ar: e.target.value }
                  })}
                  className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-3 text-xs text-right rounded"
                />
              </div>

              {/* Subheadline block */}
              <div className="space-y-4">
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hero Description (English)</h4>
                <textarea
                  value={editedSettings.heroSubheadline.en}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    heroSubheadline: { ...editedSettings.heroSubheadline, en: e.target.value }
                  })}
                  className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-3 text-xs rounded h-[148px]"
                />
                
                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hero Description (Dari)</h4>
                <textarea
                  value={editedSettings.heroSubheadline.fa}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    heroSubheadline: { ...editedSettings.heroSubheadline, fa: e.target.value }
                  })}
                  className="w-full bg-[#151515] text-gray-300 border border-[#2A1E17] p-3 text-xs rounded text-right h-[148px]"
                />
              </div>

            </div>
          </div>

          {/* CONTACT INFO ( editable via dashboard ) */}
          <div className="bg-[#0E0E0E] p-6 rounded border border-[#2A1E17] space-y-6">
            <h3 className="text-sm font-serif uppercase tracking-widest text-[#C5A880] font-bold border-b border-[#231A15] pb-2">Atelier & Showrooms Contacts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Primary WhatsApp Line Desk</label>
                  <input
                    type="text"
                    value={editedSettings.contact.primaryWhatsApp}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      contact: { ...editedSettings.contact, primaryWhatsApp: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Secondary WhatsApp Line (International)</label>
                  <input
                    type="text"
                    value={editedSettings.contact.secondaryWhatsApp}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      contact: { ...editedSettings.contact, secondaryWhatsApp: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Public Display Location (English)</label>
                  <input
                    type="text"
                    value={editedSettings.contact.location.en}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      contact: {
                        ...editedSettings.contact,
                        location: { ...editedSettings.contact.location, en: e.target.value }
                      }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Executive Assistant Phone (Click-to-Call)</label>
                  <input
                    type="text"
                    value={editedSettings.contact.phone}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      contact: { ...editedSettings.contact, phone: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Executive Desk Email Address</label>
                  <input
                    type="email"
                    value={editedSettings.contact.email}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      contact: { ...editedSettings.contact, email: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5">Public Display Location (Dari)</label>
                  <input
                    type="text"
                    value={editedSettings.contact.location.fa}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      contact: {
                        ...editedSettings.contact,
                        location: { ...editedSettings.contact.location, fa: e.target.value }
                      }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded text-right"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* PAYMENT METHODS ACTIVATION GATEWAYS */}
          <div className="bg-[#0E0E0E] p-6 rounded border border-[#2A1E17] space-y-6">
            <h3 className="text-sm font-serif uppercase tracking-widest text-[#C5A880] font-bold border-b border-[#231A15] pb-2">Payment Gateway Architectures</h3>
            
            {/* Show Price toggle */}
            <div className="flex items-center justify-between bg-[#151210] p-4.5 border border-[#3E2723]/30">
              <div>
                <h4 className="font-serif text-[#EED6A3] text-sm">Public Price Visibility</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Turn ON to display estimated price tags publicly. Turn OFF to replace price tags with private consultation quote forms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditedSettings({ ...editedSettings, showPrices: !editedSettings.showPrices })}
                className={`py-2 px-5 text-[10px] tracking-widest font-bold uppercase rounded cursor-pointer border ${
                  editedSettings.showPrices
                    ? 'bg-amber-600 text-black border-amber-600'
                    : 'bg-transparent text-gray-400 border-[#4E3629]'
                }`}
              >
                {editedSettings.showPrices ? 'Show Prices (ON)' : 'Inquire Only (OFF - DEFAULT)'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* (1) HesabPay Afghanistan */}
              <div className="bg-[#050505] p-5 rounded border border-[#1A1A1A] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2.5">
                  <h4 className="font-serif font-bold text-gray-200">HesabPay Afghanistan</h4>
                  <input
                    type="checkbox"
                    checked={editedSettings.payment.hesabpayEnabled}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: { ...editedSettings.payment, hesabpayEnabled: e.target.checked }
                    })}
                    className="accent-[#C5A880] h-4 w-4"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-500 mb-1">merchant identification hash</label>
                  <input
                    type="text"
                    value={editedSettings.payment.hesabpayMerchantId}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: { ...editedSettings.payment, hesabpayMerchantId: e.target.value }
                    })}
                    className="w-full bg-[#101010] border border-[#2A1E17] p-2.5 text-xs rounded font-mono"
                    placeholder="Merchant hash..."
                  />
                </div>
              </div>

              {/* (2) Crypt wallets */}
              <div className="bg-[#050505] p-5 rounded border border-[#1A1A1A] space-y-3 col-span-1 lg:col-span-1">
                <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2.5">
                  <h4 className="font-serif font-bold text-gray-200">Cryptocurrency Ledger</h4>
                  <input
                    type="checkbox"
                    checked={editedSettings.payment.cryptoEnabled}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: { ...editedSettings.payment, cryptoEnabled: e.target.checked }
                    })}
                    className="accent-[#C5A880] h-4 w-4"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-500 mb-1">USDT (TRC20 Wallet Address)</label>
                  <input
                    type="text"
                    value={editedSettings.payment.cryptoWallets.usdt_trc20}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: {
                        ...editedSettings.payment,
                        cryptoWallets: { ...editedSettings.payment.cryptoWallets, usdt_trc20: e.target.value }
                      }
                    })}
                    className="w-full bg-[#101010] border border-[#2A1E17] p-2 text-xs rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-500 mb-1">USDT (BEP20 Wallet Address)</label>
                  <input
                    type="text"
                    value={editedSettings.payment.cryptoWallets.usdt_bep20}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: {
                        ...editedSettings.payment,
                        cryptoWallets: { ...editedSettings.payment.cryptoWallets, usdt_bep20: e.target.value }
                      }
                    })}
                    className="w-full bg-[#101010] border border-[#2A1E17] p-2 text-xs rounded font-mono"
                  />
                </div>
              </div>

              {/* (3) Western Union Transfer */}
              <div className="bg-[#050505] p-5 rounded border border-[#1A1A1A] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2.5">
                  <h4 className="font-serif font-bold text-gray-200">Western Union Transfer</h4>
                  <input
                    type="checkbox"
                    checked={editedSettings.payment.westernUnionEnabled}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: { ...editedSettings.payment, westernUnionEnabled: e.target.checked }
                    })}
                    className="accent-[#C5A880] h-4 w-4"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-500 mb-1">Recipient Beneficiary Name</label>
                  <input
                    type="text"
                    value={editedSettings.payment.westernUnionRecipient}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: { ...editedSettings.payment, westernUnionRecipient: e.target.value }
                    })}
                    className="w-full bg-[#101010] border border-[#2A1E17] p-2 text-xs rounded font-serif font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-500 mb-1">Instructions (English)</label>
                  <textarea
                    value={editedSettings.payment.westernUnionInstructions.en}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      payment: {
                        ...editedSettings.payment,
                        westernUnionInstructions: { ...editedSettings.payment.westernUnionInstructions, en: e.target.value }
                      }
                    })}
                    className="w-full bg-[#101010] border border-[#2A1E17] p-1.5 text-[10px] rounded h-16"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Core submit button */}
          <div className="flex justify-end pt-4 border-t border-[#1F1611]">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest text-[11px] py-3.5 px-10 rounded shadow transition-all cursor-pointer disabled:opacity-40"
            >
              {actionLoading ? 'Publishing settings...' : 'Publish System Parameters'}
            </button>
          </div>

        </form>
      )}


      {/* --- CRUD DIALOGS/MODALS & CORE FORM LAYOUT CODES --- */}

      {/* MODAL: PRODUCT SAVE */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto text-xs">
          <div className="bg-[#0E0E0E] border border-[#2A1E17] rounded shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            
            <div className="flex justify-between items-center border-b border-[#231A15] pb-3 shrink-0">
              <h3 className="text-sm font-serif uppercase tracking-widest text-[#C5A880] font-bold">
                {editingProduct.id ? 'Edit Heirloom Masterpiece' : 'Register New Masterpiece Asset'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left col: Title (Multiple Languages) */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Linguistic Identifications</h4>
                  
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Title (English) *</label>
                    <input
                      type="text"
                      value={editingProduct.title?.en}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        title: { ...editingProduct.title!, en: e.target.value }
                      })}
                      className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-2.5 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Title (Dari) *</label>
                    <input
                      type="text"
                      value={editingProduct.title?.fa}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        title: { ...editingProduct.title!, fa: e.target.value }
                      })}
                      className="w-full bg-[#151515] text-gray-300 border border-[#2A1E17] p-2.5 rounded text-right"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Title (Arabic) *</label>
                    <input
                      type="text"
                      value={editingProduct.title?.ar}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        title: { ...editingProduct.title!, ar: e.target.value }
                      })}
                      className="w-full bg-[#151515] text-gray-300 border border-[#2A1E17] p-2.5 rounded text-right"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Category Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-2.5 rounded"
                    >
                      <option value="heritage">Heritage Series</option>
                      <option value="royal">Royal Series</option>
                      <option value="signature">Signature Series</option>
                      <option value="custom">Custom Series</option>
                    </select>
                  </div>

                  {/* Featured checkbox */}
                  <div className="flex items-center space-x-2 bg-[#151515] border border-[#2A1E17] p-2.5 rounded">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="accent-[#C5A880] h-4 w-4"
                    />
                    <label className="text-gray-300 block">Show in Featured Promo line</label>
                  </div>
                </div>

                {/* Middle col: Physical Parameters & Timbers */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Physical Dimensions & Timbers</h4>
                  
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Timber Ingredients (English)</label>
                    <input
                      type="text"
                      value={editingProduct.materials?.en}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        materials: { ...editingProduct.materials!, en: e.target.value }
                      })}
                      className="w-full bg-[#151515] text-gray-200 border border-[#2A1E17] p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Timber Ingredients (Dari)</label>
                    <input
                      type="text"
                      value={editingProduct.materials?.fa}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        materials: { ...editingProduct.materials!, fa: e.target.value }
                      })}
                      className="w-full bg-[#151515] text-gray-300 border border-[#2A1E17] p-2 rounded text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Dimensions Sizing (English)</label>
                    <input
                      type="text"
                      value={editingProduct.dimensions?.en}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        dimensions: { ...editingProduct.dimensions!, en: e.target.value }
                      })}
                      className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Atelier Crafting period (English) *</label>
                    <input
                      type="text"
                      value={editingProduct.craftingTime?.en}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        craftingTime: { ...editingProduct.craftingTime!, en: e.target.value }
                      })}
                      placeholder="e.g. 12-16 weeks"
                      className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded"
                      required
                    />
                  </div>
                </div>

                {/* Right col: Image upload & media preview */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Visual Assets Library</h4>
                  
                  {/* File Selector */}
                  <div className="border border-dashed border-[#4E3629] p-4 text-center rounded bg-[#090909] space-y-2 relative cursor-pointer">
                    <Upload className="h-4.5 w-4.5 text-[#C5A880] mx-auto" />
                    <p className="text-[10px] text-gray-500">Click to upload raw image directly down local disk folders</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMediaUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {isUploading && (
                    <div className="text-[10px] text-amber-500">Writing file buffer to static asset pool...</div>
                  )}

                  {/* Manual visual text box URL input */}
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Manual image asset path/URL</label>
                    <input
                      type="text"
                      value={mediaUploadUrl}
                      onChange={(e) => setMediaUploadUrl(e.target.value)}
                      placeholder="/src/assets/images/...."
                      className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded font-mono text-[10px]"
                    />
                  </div>

                  {mediaUploadUrl && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-gray-600 block">Active asset preview:</span>
                      <img
                        src={mediaUploadUrl}
                        alt=""
                        className="w-full h-32 object-cover rounded border border-[#2A1E17]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Extended narrative text descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1C130D]">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Showcase narrative story description (English) *</label>
                  <textarea
                    value={editingProduct.description?.en}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      description: { ...editingProduct.description!, en: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded text-[11px] h-20"
                    required
                  />
                  
                  <label className="block text-gray-400 text-[10px] mt-3 mb-1">Cultural heritage background chronicles (English)</label>
                  <textarea
                    value={editingProduct.story?.en}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      story: { ...editingProduct.story!, en: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded text-[11px] h-20"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Showcase narrative story description (Dari) *</label>
                  <textarea
                    value={editingProduct.description?.fa}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      description: { ...editingProduct.description!, fa: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded text-[11px] text-right h-20"
                    required
                  />
                  
                  <label className="block text-gray-400 text-[10px] mt-3 mb-1 font-sans">Cultural heritage background chronicles (Dari)</label>
                  <textarea
                    value={editingProduct.story?.fa}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      story: { ...editingProduct.story!, fa: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded text-[11px] text-right h-20"
                  />
                </div>
              </div>

              {/* Save layout controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#231A15] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-transparent border border-[#4D3A30] text-gray-400 hover:text-white py-2 px-6 rounded hover:bg-[#151515] cursor-pointer"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#C5A880] text-black font-semibold uppercase tracking-widest hover:bg-[#EED6A3] py-2.5 px-8 rounded shadow transition-all cursor-pointer"
                >
                  {actionLoading ? 'Writing records...' : 'Commit to Database'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: BLOG POST SAVE */}
      {isBlogModalOpen && editingPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto text-xs">
          <div className="bg-[#0E0E0E] border border-[#2A1E17] rounded shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            
            <div className="flex justify-between items-center border-b border-[#231A15] pb-3 shrink-0">
              <h3 className="text-sm font-serif uppercase tracking-widest text-[#C5A880] font-bold">
                {editingPost.id ? 'Edit Chronicle post' : 'Create Journal Chronicle entry'}
              </h3>
              <button onClick={() => setIsBlogModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Titles */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Title (English) *</label>
                    <input
                      type="text"
                      value={editingPost.title?.en}
                      onChange={(e) => setEditingPost({
                        ...editingPost,
                        title: { ...editingPost.title!, en: e.target.value }
                      })}
                      className="w-full bg-[#151515] border border-[#2A1E17] p-2.5 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Title (Dari) *</label>
                    <input
                      type="text"
                      value={editingPost.title?.fa}
                      onChange={(e) => setEditingPost({
                        ...editingPost,
                        title: { ...editingPost.title!, fa: e.target.value }
                      })}
                      className="w-full bg-[#151515] border border-[#2A1E17] p-2.5 rounded text-right"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1 font-serif">Slug (English URL safe) *</label>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      placeholder="cryptography-nuristani-wood"
                      className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1">Category</label>
                      <input
                        type="text"
                        value={editingPost.category}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                        className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1 font-serif">Status</label>
                      <select
                        value={editingPost.status}
                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                        className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded"
                      >
                        <option value="draft">Draft (Private)</option>
                        <option value="published">Published (Public)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image and metadata */}
                <div className="space-y-3">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Visual Cover</span>
                  
                  {/* Local image uploader */}
                  <div className="border border-dashed border-[#4E3629] p-3 text-center rounded bg-[#090909] relative cursor-pointer">
                    <p className="text-[9px] text-gray-500">Upload cover image</p>
                    <input type="file" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>

                  <input
                    type="text"
                    value={mediaUploadUrl}
                    onChange={(e) => setMediaUploadUrl(e.target.value)}
                    placeholder="Enter file URL path manually..."
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded text-[10px] font-mono"
                  />
                  {mediaUploadUrl && (
                    <img src={mediaUploadUrl} alt="" className="w-full h-24 object-cover border border-[#2A1E17] mt-2 rounded" referrerPolicy="no-referrer" />
                  )}
                </div>

              </div>

              {/* Contents block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1C130D]">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Excerpt (English)</span>
                  <textarea
                    value={editingPost.excerpt?.en}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      excerpt: { ...editingPost.excerpt!, en: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded h-14"
                  />
                  
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mt-3 mb-1">Body Text (English) *</span>
                  <textarea
                    value={editingPost.content?.en}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      content: { ...editingPost.content!, en: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded h-40 font-mono text-[11px]"
                    required
                  />
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Excerpt (Dari)</span>
                  <textarea
                    value={editingPost.excerpt?.fa}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      excerpt: { ...editingPost.excerpt!, fa: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-2 rounded text-right h-14"
                  />
                  
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mt-3 mb-1">Body Text (Dari) *</span>
                  <textarea
                    value={editingPost.content?.fa}
                    onChange={(e) => setEditingPost({
                      ...editingPost,
                      content: { ...editingPost.content!, fa: e.target.value }
                    })}
                    className="w-full bg-[#151515] border border-[#2A1E17] p-3 rounded text-right h-40 font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#231A15] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="bg-transparent border border-[#4D3A30] text-gray-400 hover:text-white py-2 px-6 rounded"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  className="bg-[#C5A880] hover:bg-[#EED6A3] text-black font-semibold uppercase tracking-widest py-2.5 px-8 rounded transition-colors"
                >
                  Write Chronicle
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
