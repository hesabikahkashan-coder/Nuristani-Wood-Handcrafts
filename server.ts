import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environmental parameters
dotenv.config();

// Imports from our unified cloud/local persistence adapter
import {
  getSettings,
  saveSettings,
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  getBlog,
  getBlogByIdentifier,
  saveBlog,
  deleteBlog,
  getInquiries,
  saveInquiry,
  updateInquiryStatus,
  getOrders,
  getOrderById,
  saveOrder,
  updateOrderStatus
} from './server/db';

// Safely resolve filename and dirname for both ESM development and CJS production environments
const getFilenameAndDirname = () => {
  let filepath = '';
  let dirpath = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      filepath = fileURLToPath(import.meta.url);
      dirpath = path.dirname(filepath);
    } else {
      filepath = typeof __filename !== 'undefined' ? __filename : '';
      dirpath = typeof __dirname !== 'undefined' ? __dirname : '';
    }
  } catch (e) {
    // fallback
  }
  return { filepath, dirpath };
};

const { filepath: __filename, dirpath: __dirname } = getFilenameAndDirname();

const app = express();
const PORT = 3000;

// Set up body parsing limits for holding base64 invoice graphics
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Dynamic Paths for local file storages
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Static route for serving uploaded images
app.use('/data/uploads', express.static(UPLOADS_DIR));

// ------------------------------------------------------------
// SECURITY / ADMIN PANEL MANAGEMENT SESSIONS
// ------------------------------------------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nuristaniwood.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shafiqullah123';

const activeAdminSessions = new Map<string, { email: string; expires: number }>();

// Basic Anti-Abuse Rate Limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function ipRateLimiter(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    let limitInfo = rateLimits.get(key);
    if (!limitInfo || now > limitInfo.resetAt) {
      limitInfo = { count: 0, resetAt: now + windowMs };
    }

    limitInfo.count++;
    rateLimits.set(key, limitInfo);

    if (limitInfo.count > limit) {
      return res.status(429).json({
        error: 'Secured request threshold exceeded. Please try again in dynamic time.'
      });
    }

    next();
  };
}

// Session requirement middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader as string;
  }

  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Action restricted to atelier curators.' });
  }

  const session = activeAdminSessions.get(token)!;
  if (Date.now() > session.expires) {
    activeAdminSessions.delete(token);
    return res.status(401).json({ error: 'Administrative session expired.' });
  }

  session.expires = Date.now() + 60 * 60 * 1000; // Extend duration on activity
  activeAdminSessions.set(token, session);

  next();
}

// Clean Rate limit memory cache
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimits.entries()) {
    if (now > val.resetAt) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Admin Authentication Handshakes
app.post('/api/admin/login', ipRateLimiter(5, 5 * 60 * 1000), (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const targetEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (cleanEmail === targetEmail && password === ADMIN_PASSWORD) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeAdminSessions.set(sessionToken, {
      email: cleanEmail,
      expires: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    });

    res.json({
      success: true,
      token: sessionToken,
      email: cleanEmail
    });
  } else {
    setTimeout(() => {
      res.status(401).json({ error: 'Unauthorized. Credentials mismatch.' });
    }, 1000);
  }
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  let token = '';

  if (typeof authHeader === 'string') {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }

  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ authenticated: false });
  }

  const session = activeAdminSessions.get(token)!;
  if (Date.now() > session.expires) {
    activeAdminSessions.delete(token);
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true, email: session.email });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.slice(7);
  if (typeof token === 'string') {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true });
});

// ------------------------------------------------------------
// BOT RESISTANCE CHALLENGES (Math solver)
// ------------------------------------------------------------
const activePuzzles = new Map<string, { answer: number; expires: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [id, value] of activePuzzles.entries()) {
    if (now > value.expires) {
      activePuzzles.delete(id);
    }
  }
}, 5 * 60 * 1000);

app.get('/api/security-puzzle', (req, res) => {
  const op1 = Math.floor(Math.random() * 8) + 2; 
  const op2 = Math.floor(Math.random() * 8) + 2; 
  const answer = op1 + op2;
  const puzzleId = `puz_${crypto.randomBytes(8).toString('hex')}`;

  activePuzzles.set(puzzleId, { answer, expires: Date.now() + 10 * 60 * 1000 });

  res.json({
    id: puzzleId,
    question: `Please solve: What is ${op1} + ${op2}?`
  });
});

// ------------------------------------------------------------
// MASTER SETTINGS & WEBPAGE METADATA APPLET APIs
// ------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const data = await getSettings();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed getting settings parameters.' });
  }
});

app.post('/api/settings', requireAdmin, async (req, res) => {
  try {
    await saveSettings(req.body);
    res.json({ success: true, settings: req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed updating configs.' });
  }
});

// ------------------------------------------------------------
// PRODUCTS CONTROLLERS (CRUD)
// ------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const items = await getProducts();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed extracting products.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const item = await getProductById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Product not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed retrieving product.' });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  const { id, title, description, story, category, materials, dimensions, craftingTime, image, featured } = req.body;

  if (!title || !description || !dimensions || !materials) {
    return res.status(400).json({ error: 'Product title, description, materials, and dimensions are required.' });
  }

  const finalId = id || `prod-${Date.now()}`;
  const newProduct = {
    id: finalId,
    title,
    description,
    story: story || { en: '', fa: '', ar: '' },
    category: category || 'heritage',
    materials,
    dimensions,
    craftingTime: craftingTime || { en: '', fa: '', ar: '' },
    image: image || '',
    featured: !!featured
  };

  try {
    await saveProduct(newProduct);
    res.json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ error: 'Failed writing product record.' });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed removing product.' });
  }
});

// ------------------------------------------------------------
// CHRONICLES / BLOG LOGISTICS (CRUD)
// ------------------------------------------------------------
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await getBlog();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed reading chronicles.' });
  }
});

app.get('/api/blog/:identifier', async (req, res) => {
  try {
    const post = await getBlogByIdentifier(req.params.identifier);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post entry not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed extracting blog entry.' });
  }
});

app.post('/api/blog', requireAdmin, async (req, res) => {
  const { id, title, slug, content, excerpt, image, category, date, author, status, metaTitle, metaDesc } = req.body;

  if (!title || !content || !excerpt) {
    return res.status(400).json({ error: 'Blog post title, excerpt and content are required.' });
  }

  const finalId = id || `post-${Date.now()}`;
  const finalSlug = slug || `slug-${Date.now()}`;
  const finalDate = date || new Date().toISOString().split('T')[0];

  const newPost = {
    id: finalId,
    title,
    slug: finalSlug,
    content,
    excerpt,
    image: image || '',
    category: category || 'Craftsmanship',
    date: finalDate,
    author: author || { en: 'Shafiqullah Nooristani', fa: 'شفیق‌الله نورستانی', ar: 'شفيق الله نورستاني' },
    status: status || 'draft',
    metaTitle: metaTitle || '',
    metaDesc: metaDesc || ''
  };

  try {
    await saveBlog(newPost);
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed writing blog entry.' });
  }
});

app.delete('/api/blog/:id', requireAdmin, async (req, res) => {
  try {
    await deleteBlog(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed removing post.' });
  }
});

// ------------------------------------------------------------
// CLIENT INQUIRIES & ORDERS PIPELINES + WEBHOOKS
// ------------------------------------------------------------
app.get('/api/inquiries', requireAdmin, async (req, res) => {
  try {
    const list = await getInquiries();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed loading files.' });
  }
});

// Submit Inquiry (with Auto-Linked Order generation so they can pay or track it instantly!)
app.post('/api/inquiries', ipRateLimiter(6, 10 * 60 * 1000), async (req, res) => {
  const { name, email, description, phone, country, type, budgetRange, quantity, imageRef, verify_identity_fax, puzzleId, puzzleAnswer } = req.body;

  // 1. Silent Honeypot
  if (verify_identity_fax) {
    return res.json({ success: true, trackingId: `NWH-${Math.floor(10000 + Math.random() * 90000)}` });
  }

  // 2. Validate
  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Name, email, and description are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Verifiable email required.' });
  }

  // 3. Challenge solver
  if (!puzzleId || !puzzleAnswer) {
    return res.status(400).json({ error: 'Verification required. Please provide the sum of the protection puzzle.' });
  }

  const challenge = activePuzzles.get(puzzleId);
  if (!challenge || Date.now() > challenge.expires) {
    return res.status(400).json({ error: 'Verification puzzle expired.' });
  }

  if (parseInt(puzzleAnswer) !== challenge.answer) {
    return res.status(400).json({ error: 'Incorrect puzzle sum.' });
  }

  activePuzzles.delete(puzzleId);

  const trackingId = `NWH-${Math.floor(10000 + Math.random() * 90000)}`;
  const finalId = `inq-${Date.now()}`;
  const finalDate = new Date().toISOString();

  const newInquiry = {
    id: finalId,
    type: type || 'custom',
    trackingId,
    name,
    email,
    phone: phone || '',
    country: country || 'International',
    description,
    budgetRange: budgetRange || '',
    quantity: quantity ? parseInt(quantity) : undefined,
    imageRef: imageRef || '',
    date: finalDate,
    status: 'pending',
    notes: ''
  };

  try {
    await saveInquiry(newInquiry);

    // AUTO-CREATE PEDESTAL LINKED ORDER IN PENDING PAYMENT
    const linkedOrderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 890)}`;
    const linkedOrder = {
      id: linkedOrderId,
      customerName: name,
      email: email,
      phone: phone || '+93749274000',
      items: [{
        title: {
          en: `Heritage Commission [${trackingId}]`,
          fa: `اثر مینیاتوری سفارشی [${trackingId}]`,
          ar: `تحفة فنية حصرية [${trackingId}]`
        },
        category: type || 'custom',
        image: imageRef || '/src/assets/images/nuristani_hero_casket_1780946329749.png'
      }],
      paymentMethod: 'crypto',
      paymentDetails: {},
      status: 'pending_payment',
      total: budgetRange || 'Consultation (Quoted)',
      date: finalDate,
      notes: `Generated from handcraft inquiry details: ${description}`
    };

    await saveOrder(linkedOrder);

    res.json({ 
      success: true, 
      trackingId, 
      orderId: linkedOrderId, 
      inquiry: newInquiry 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed saving inquiry commission.' });
  }
});

app.post('/api/inquiries/:id/status', requireAdmin, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const updated = await updateInquiryStatus(req.params.id, status, notes);
    if (updated) {
      res.json({ success: true, inquiry: updated });
    } else {
      res.status(404).json({ error: 'Inquiry not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed editing note.' });
  }
});

// ------------------------------------------------------------
// CLIENT ORDERS TRACING & WEBHOOK PAYMENTS
// ------------------------------------------------------------
app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const list = await getOrders();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed loading order registries.' });
  }
});

// Public single order tracker retrieve
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed reading order trace.' });
  }
});

// Public orders submission
app.post('/api/orders', ipRateLimiter(6, 10 * 60 * 1000), async (req, res) => {
  const { customerName, email, phone, items, paymentMethod, paymentDetails, total, notes, verify_identity_fax, puzzleId, puzzleAnswer } = req.body;

  if (verify_identity_fax) {
    return res.json({ success: true, orderId: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}` });
  }

  if (!customerName || !email || !phone || !paymentMethod) {
    return res.status(400).json({ error: 'Name, email, phone and payment method are required.' });
  }

  if (!puzzleId || !puzzleAnswer) {
    return res.status(400).json({ error: 'Puzzle solve captcha required.' });
  }

  const puz = activePuzzles.get(puzzleId);
  if (!puz || Date.now() > puz.expires) {
    return res.status(400).json({ error: 'Captcha expired.' });
  }

  if (parseInt(puzzleAnswer) !== puz.answer) {
    return res.status(400).json({ error: 'Incorrect math challenge.' });
  }

  activePuzzles.delete(puzzleId);

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const finalDate = new Date().toISOString();

  const newOrder = {
    id: orderId,
    customerName,
    email,
    phone,
    items: items || [],
    paymentMethod,
    paymentDetails: paymentDetails || {},
    status: 'pending_payment',
    total: total || 'To be calculated (Quoted)',
    date: finalDate,
    notes: notes || ''
  };

  try {
    await saveOrder(newOrder);
    res.json({ success: true, orderId, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed creating order.' });
  }
});

app.post('/api/orders/:id/status', requireAdmin, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const updated = await updateOrderStatus(req.params.id, status, notes);
    if (updated) {
      res.json({ success: true, order: updated });
    } else {
      res.status(404).json({ error: 'Order not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed editing order.' });
  }
});

// Custom payment-proof submissions (Upload TXID / Western Union MTCN and base64 slips)
app.post('/api/orders/:id/payment-proof', async (req, res) => {
  const { method, notes, receiptUrl } = req.body;
  const orderId = req.params.id;

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      method,
      submittedAt: new Date().toISOString(),
      receiptUrl: receiptUrl || '',
      notes: notes
    };
    
    // Prefix notes to show in the Admin panels clearly
    order.notes = `[${method.toUpperCase()} RECEIPT REGISTERED] ${notes}. ${order.notes || ''}`;
    
    await saveOrder(order);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed writing receipts.' });
  }
});

// ------------------------------------------------------------
// HESABPAY SESSIONS GATES & INCOMING WEBHOOK VERIFICATIONS
// ------------------------------------------------------------
app.post('/api/payment/create-session', ipRateLimiter(5, 5 * 60 * 1000), async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order reference is required.' });
  }

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order record linked to checkout not found.' });
    }

    const domainUrl = process.env.BASE_URL || 'https://your-domain.com';
    const apiKey = process.env.HESABPAY_API_KEY;

    const returnUrl = `${domainUrl}/track?orderId=${orderId}&payment=success`;
    let payment_url = `/track?orderId=${orderId}&payment=simulate_hesabpay`;
    let sessionId = `HSB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (apiKey && apiKey !== 'MY_HESABPAY_API_KEY' && apiKey !== '') {
      try {
        const response = await fetch('https://api.hesabpay.com/api/v1/payments/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            merchantId: 'NWH-MCH-9871',
            amount: 75000, // standard pre-estimation AFN or custom
            currency: 'AFN',
            description: `Nuristani Wood Handcrafts Atelier Order ${orderId}`,
            callbackUrl: returnUrl,
            webhookUrl: `${domainUrl}/api/webhook/hesabpay`
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.payment_url) payment_url = result.payment_url;
          if (result.sessionId) sessionId = result.sessionId;
        }
      } catch (err) {
        console.error('HesabPay server transaction initiation fallback:', err);
      }
    }

    // Embed session ID reference to look up when callback webhooks trigger
    order.hesabpaySessionId = sessionId;
    await saveOrder(order);

    res.json({ success: true, payment_url, sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Aesthetic checkout initialization failed.' });
  }
});

// Webhook endpoint
app.post('/api/webhook/hesabpay', async (req, res) => {
  const { sessionId, status, orderId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session identifier is missing.' });
  }

  try {
    const orders = await getOrders();
    const order = orders.find((o: any) => o.hesabpaySessionId === sessionId || o.id === orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Link transaction order not located.' });
    }

    if (status === 'SUCCESS' || status === 'paid' || status === 'completed') {
      order.status = 'paid';
    } else {
      order.status = 'rejected';
    }

    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      webhookProcessedAt: new Date().toISOString(),
      rawWebhookPayload: req.body
    };

    await saveOrder(order);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processed with faults.' });
  }
});

// ------------------------------------------------------------
// ATELIER METRICS SUMMARY FOR PORTAL MONITOR
// ------------------------------------------------------------
app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const inquiries = await getInquiries();
    const orders = await getOrders();

    res.json({
      inquiriesCount: inquiries.length,
      ordersCount: orders.length,
      unreadInquiries: inquiries.filter((i: any) => i.status === 'pending').length,
      pendingOrders: orders.filter((o: any) => o.status === 'pending_payment').length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed loading metrics.' });
  }
});

// ------------------------------------------------------------
// FILE UPLOADER ENGINE WITH FILE TYPES PROTECTION
// ------------------------------------------------------------
app.post('/api/upload', ipRateLimiter(6, 10 * 60 * 1000), (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ error: 'Filename and base64 buffer required.' });
  }

  const parts = base64Data.split(';base64,');
  if (parts.length !== 2) {
    return res.status(400).json({ error: 'Malformed base64 buffers.' });
  }

  const mime = parts[0];
  const buffer = Buffer.from(parts[1], 'base64');

  // Strict allowed mime types
  const allowedMime = /^data:(image\/(png|jpeg|webp)|application\/pdf)$/;
  if (!allowedMime.test(mime)) {
    return res.status(400).json({ error: 'Allowed types are limited to PNG, JPEG, WEBP and PDF.' });
  }

  // Security: Check magic values checking signatures
  const hexHeader = buffer.toString('hex', 0, 4).toUpperCase();
  const isPng = hexHeader.startsWith('89504E47');
  const isJpeg = hexHeader.startsWith('FFD8FF');
  const isWebp = hexHeader.startsWith('52494646'); 
  const isPdf = hexHeader.startsWith('25504446');

  if (!isPng && !isJpeg && !isWebp && !isPdf) {
    return res.status(400).json({ error: 'Security breach: data headers violate standard graphic vectors.' });
  }

  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds maximum threshold allowance of 5MB.' });
  }

  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const savedName = `${Date.now()}_${cleanFileName}`;
    const filePath = path.join(UPLOADS_DIR, savedName);
    
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/data/uploads/${savedName}`,
      thumbnailUrl: `/data/uploads/${savedName}`,
      mediumUrl: `/data/uploads/${savedName}`,
      largeUrl: `/data/uploads/${savedName}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed writing file.' });
  }
});

// ------------------------------------------------------------
// XML SEO GOOGLE SITEMAPS DYNAMIC EXCHANGES
// ------------------------------------------------------------
app.get('/sitemap.xml', async (req, res) => {
  const domainUrl = 'https://ais-pre-xkpnjwuqe5hsiixak5qwqa-316403213147.europe-west2.run.app';
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const staticList = ['', '/about', '/collections', '/portfolio', '/wholesale', '/custom-order', '/blog', '/contact', '/track'];
  staticList.forEach(r => {
    xml += `  <url>\n    <loc>${domainUrl}${r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${r === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });

  try {
    const products = await getProducts();
    products.forEach(p => {
      xml += `  <url>\n    <loc>${domainUrl}/products/${p.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    const blog = await getBlog();
    blog.filter((b: any) => b.status === 'published').forEach(b => {
      xml += `  <url>\n    <loc>${domainUrl}/blog/${b.slug || b.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
  } catch (e) {
    console.error('Sitemap elements parsing failed:', e);
  }

  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ------------------------------------------------------------
// AI SYSTEM GROQ LLAMA 3.3 PROXIES APIS (Server-Side Only)
// ------------------------------------------------------------
app.post('/api/ai/chat', ipRateLimiter(15, 60 * 1000), async (req, res) => {
  const { message, history } = req.body;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const systemInstruction = `You are the NWH Heritage Representative, an elite, professional AI ambassador for Nuristani Wood Handcrafts (NWH), a world-class luxury artisan atelier from Nuristan, Afghanistan. 

Our core values: Exclusivity, Master Handcrafted Authenticity, Cultural Preservation, Timeless Beauty, Apple-level luxury client service.
Our primary business goal: Convert luxury collectors, interior designers, five-star resorts, and enthusiasts of deep woodcraft into clients.

IMPORTANT CUSTOMER ADVISEMENTS:
1) Fixed Prices: We DO NOT list fixed retail prices because every luxury panel, throne chair, or bride chest is handmade-to-order on solid Himalayan Cedar, Mountain Walnut, or Mahogany. Timbers vary in grade, dimensions are custom, carving density can be fine, double-sided, or royal high-relief, and premium courier delivery requires specific crates. Encourage requesting a private quote.
2) Contact Information:
   - Primary WhatsApp Desk: +93749274000
   - Secondary WhatsApp Desk: +447401147446
   - Tel Support: +93777296023
   - Official Email: nuristaniwood@gmail.com
3) Custom Order Process: Clients describe their libraries, doors, or commissions, specify dimensions, select slow-growth timbers, and upload inspiration images. Typical custom carving queues span 12 to 24 weeks. We ship worldwide with specialized wooden shipping vaults to secure carvings.
4) Payment Options Available:
   - HesabPay (Priority Afghanistan digital gateway)
   - Cryptocurrency (USDT TRC20/BEP20, Bitcoin, Ethereum)
   - Western Union Manual Transfers (Beneficiary Recipient: Shafiqullah Nooristani, Kabul, Afghanistan)

Respond to the customer query in an elegant, cultured, warm, respectful luxury-editorial voice. Keep answers compact, inspiring, and always tie back to our cultural preservation mission. Support English, Arabic, and Dari (Farsi) seamlessly based on user query language. Ensure no sensitive technical parameters or JSON codes are exposed in output.`;

  // Fallback if no GROQ_API_KEY is configured
  if (!groqApiKey || groqApiKey === 'YOUR_GROQ_API_KEY' || groqApiKey === '') {
    return res.json({
      text: "Thank you for contacting the Nuristani Wood Handcrafts Atelier. Shafiqullah Nooristani and our master carvers are currently in the valleys of Nuristan crafting exclusive commissions, occasionally out of network reach. Shipping typically takes 8-12 weeks worldwide via premium air freight. To order custom folding panels, doors, or royal thrones, please submit a Custom Inquiry or WhatsApp our primary desk directly at +93749274000. I can guide you through pricing methods (Crypto, HesabPay, or Western Union) once we receive your specific timber request!"
    });
  }

  try {
    const formattedMessages = [
      { role: 'system', content: systemInstruction }
    ];

    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        formattedMessages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text
        });
      });
    }

    formattedMessages.push({ role: 'user', content: message });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Our team has received your query and will contact you via WhatsApp soon.';
      res.json({ text: reply });
    } else {
      const errResponseText = await response.text();
      console.error('Groq Llama API status error response:', errResponseText);
      throw new Error(`Failed response from Groq server. status: ${response.status}`);
    }
  } catch (error: any) {
    console.error('Groq connection error:', error);
    res.status(500).json({
      error: 'The AI Concierge is currently crossing valleys in Nuristan out of network coverage. Please consult our direct WhatsApp helpdesk!'
    });
  }
});

// ------------------------------------------------------------
// SERVE CLIENT-SIDE SPA & PRODUCTION EXECS
// ------------------------------------------------------------
import { createServer as createViteServer } from 'vite';

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nuristani Wood Handcrafts running on port ${PORT}`);
  });
}

startServer();
