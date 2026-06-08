import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

// Fix for ES module globals in Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set up JSON body payload sizes (essential for handling uploaded base64 photos)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Dynamic Paths for Database & media uploads
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure database and content folders exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Static path for local uploads
app.use('/data/uploads', express.static(UPLOADS_DIR));

// Setup initial preloaded luxury contents
const initialDb = {
  products: [
    {
      id: 'prod-gohar-chest',
      title: {
        en: 'The Royal Gohar Bridal Chest',
        fa: 'صندوق عروس شاهانه گوهر',
        ar: 'صندوق العروس الملكي جوهر'
      },
      description: {
        en: 'An exquisite heirloom bridal chest designed in the high geometric grid style of royal Nuristani courts. Mastercrafted from slow-growth Himalayan cedar and finished with biological walnut oils.',
        fa: 'صندوق نفیس عروس سنتی نورستان که با الهام از طرح‌های هندسی دربار شاهان دیرین تراشیده شده است. ساخته شده از چوب سدر هیمالیا و آغشته به روغن‌های برتر جوز هند آسیایی.',
        ar: 'صندوق عروس أثري رائع مبني على النمط الهندسي الدقيق لبلاط نورستان القديم. مصنوع من خشب الأرز الفاخر المعالج بالزيوت الطبيعية.'
      },
      story: {
        en: 'This heritage chest is inspired by the legendary Queen Gohar of the Hindu Kush. Every geometric intersection represents centuries-old motifs passed down from master to apprentice without ever being written down on paper.',
        fa: 'این صندوق میراث با الهام از ملکه افسانه‌ای «گوهر» هندوکش تراشیده شده است. هر بن گره هندوسی، نشانگر قرن‌ها فرهنگ و خلاقیتی است که سینه به سینه بدون نیاز به نگارش خطی به امروزیان به ارث رسید.',
        ar: 'صندوق تراثي مستوحى من الملكة الأسطورية "جوهر" في هندوكوش. يمثل كل تقاطع هندسي زخارف تعود لقرون طويلة تنتقل من معلم إلى متدرب دون تدوينها.'
      },
      category: 'heritage',
      materials: {
        en: 'Solid Cedar Wood, Brass Fasteners, Bronze Ring Latches',
        fa: 'چوب سدر هیمالیا یک‌پارچه، یراق آلات برنجی، قفل‌های حلقه‌ای برنزی دمشقی',
        ar: 'خشب الأرز الصلب، مفاصل نحاسية، أقفال برونزية قديمة'
      },
      dimensions: {
        en: '120cm (W) x 65cm (H) x 60cm (D)',
        fa: '۱۲۰ سانتی‌متر پهنا × ۶۵ سانتی‌متر ارتفاع × ۶۰ سانتی‌متر عمق',
        ar: '١٢٠ سم (عرض) × ٦٥ سم (ارتفاع) × ٦٠ سم (عمق)'
      },
      craftingTime: {
        en: '12 - 16 Weeks (approx. 380 artisan-hours)',
        fa: '۱۲ تا ۱۶ هفته (تقریباً ۳۸۰ ساعت کار ممتد استادان کارآزموده)',
        ar: 'من ١٢ إلى ١٦ أسبوعاً (حوالي ٣٨٠ ساعة حرفية)'
      },
      image: '/src/assets/images/nuristani_hero_casket_1780946329749.png',
      featured: true
    },
    {
      id: 'prod-sig-divider',
      title: {
        en: 'The Celestial Folding Screen',
        fa: 'پارتیشن مشبک خورشیدی نورستانی',
        ar: 'فاصل الغرف الهوائي المشرق'
      },
      description: {
        en: 'A three-panel monumental screen meticulously pierced and hand-carved in signature Nuristani lattice work, casting dramatic shadow plays when caught in light.',
        fa: 'پارتیشن جداکننده سه پنلی با کنده‌کاری مشبک بسیار هنرمندانه و هندسه نجومی سنتی که بازی سایه و نور رویایی در فضا جاری می‌سازد.',
        ar: 'فاصل غرف مهيب ثلاثي الألواح منقوش بدقة متناهية بأسلوب شبكي نورستاني ليعطي ظلالاً فنية ساحرة عندما تتخللها الإضاءة.'
      },
      story: {
        en: 'Designed to elevate modern living areas while conserving cultural privacy. It integrates both open structural geometric carvings and high-relief panels at the base.',
        fa: 'طراحی شده تلائم دکوراسیون‌های مدرن با حفظ میراث هنری شرقی. ترکیبی از گره‌های باز ساختاری و نیمه‌برجسته‌های کوهستانی در پایه اثر.',
        ar: 'صمم خصيصاً ليناسب غرف المعيشة العصرية مع الحفاظ على الخصوصية والعمق الثقافي التراثي الأصيل.'
      },
      category: 'signature',
      materials: {
        en: 'Wild Mountain Walnut Wood',
        fa: 'چوب گردوی کوهستانی وحشی تیره سنباده‌خورده ابریشمی',
        ar: 'خشب الجوز الجبلي البري الفاخر'
      },
      dimensions: {
        en: '180cm (W) x 195cm (H) x 4cm (D)',
        fa: '۱۸۰ سانتی‌متر پهنا × ۱۹۵ سانتی‌متر ارتفاع × ۴ سانتی‌متر ضخامت پنل',
        ar: '١٨٠ سم (عرض) × ١٩٥ سم (ارتفاع) × ٤ سم (عمق)'
      },
      craftingTime: {
        en: '20 - 24 Weeks',
        fa: '۲۰ تا ۲۴ هفته کار طاقت‌فرسا و متمرکز',
        ar: 'من ٢٠ إلى ٢٤ أسبوعاً من العمل الفني المتواصل'
      },
      image: '/src/assets/images/nuristani_carving_detail_1780946369156.png',
      featured: true
    },
    {
      id: 'prod-royal-throne',
      title: {
        en: 'The Sher-Shah Throne Chair',
        fa: 'کرسی شاهانه شیرشاه',
        ar: 'كرسي العرش الملكي شيرشاه'
      },
      description: {
        en: 'A high-back ceremonial armchair sculpted for exceptional luxury environments. Adorned with classical crest carving and upholstered in local emerald native silk.',
        fa: 'صندلی تشریفاتی تکیه‌گاه‌بلند مجلل با کنده‌کاری تاج باشکوه و روکش ابریشم بومی زمرد سرخ.',
        ar: 'كرسي بذراعين احتفالي ذو مسند ظهر مرتفع منحوت للقصور ومجالس العظماء الفاخرة، منجد بالحرير الزمردي الطبيعي.'
      },
      story: {
        en: 'Modeled after description chronicles of the 17th-century regional rulers. Its towering back panels represent the high valleys and impenetrable peaks of Alingar and Kamdesh.',
        fa: 'بازطراحی شده مطابق تذکره‌ها و نگاره‌های تاریخی قرن هفدهم نورستان شرقی. ارتفاع پشتی نماینده دره‌های سرسبز کامدیش و بر بلندی برجهای الینگار است.',
        ar: 'مصمم غاية في الندرة استناداً إلى المذكرات التاريخية لحكام القرن السابع عشر. يمثل مسند الظهر جبال كامديش الشامخة.'
      },
      category: 'royal',
      materials: {
        en: 'Walnut Wood, Natural Raw Silk Cushioning, Brass Details',
        fa: 'چوب گردوی کهنسال محلی، تشک نرم ابریشم گیلان‌زاد ممتاز، میخ‌های برنجی قدیمی',
        ar: 'خشب الجوز المختار، تنجيد من الحرير الخالص العتيق، تفاصيل نحاسية دافئة'
      },
      dimensions: {
        en: '85cm (W) x 150cm (H) x 80cm (D)',
        fa: '۸۵ سانتی‌متر پهنا × ۱۵۰ سانتی‌متر ارتفاع × ۸۰ سانتی‌متر عمق مقعد صندلی',
        ar: '٨٥ سم (عرض) × ١٥٠ سم (ارتفاع) × ٨٠ سم (عمق)'
      },
      craftingTime: {
        en: '16 - 20 Weeks',
        fa: '۱۶ تا ۲۰ هفته تراش مستقر',
        ar: 'من ١٦ إلى ٢٠ أسبوعاً'
      },
      image: '/src/assets/images/nuristani_royal_chair_1780946348930.png',
      featured: true
    }
  ],
  blog: [
    {
      id: 'post-1',
      title: {
        en: 'The Cryptography in Nuristani Woodcarvings',
        fa: 'نمادشناسی و رمزنگاری پنهان در تراش‌های چوب نورستان',
        ar: 'الفلسفة الهندسية المشفرة في نقوش خشب نورستان'
      },
      slug: 'cryptography-nuristani-wood',
      excerpt: {
        en: 'Explore how ancient geometric grids and floral incisions convey secret tribal histories without written scripts.',
        fa: 'پی ببرید که چگونه اشکال هندسی باستانی و هلال‌های حک شده روی چوب تاریخی فراتر از خطوط مکتوب رازدار هویت‌های بومی گشته‌اند.',
        ar: 'اكتشف كيف تعبر الخطوط الهندسية العتيقة والقطع الزهري الخشبي عن تاريخ سري دون حروف مكتوبة.'
      },
      content: {
        en: 'Each carving in Nuristani woodcraft holds specialized linguistic concepts. Before the region integrated alphabetic scripts, information was deeply woven into visual geometries. Triangle meshes mapped key battles; circles represented water and agricultural flow, while complex floral relief patterns symbolized family lineages.\n\nOur master artisans do not draw these motifs beforehand. Instead, they project mathematical divisions directly onto the wood from memory, preserving a cosmic balance and high mathematical precision without measuring tapes.',
        fa: 'تراش‌های سنتی چوب کوهستان نورستان صرفاً تزیینی نبوده، بلکه مفاهیم گفتاری و هویتی پنهانی در خود دارند. پیش از رواج خطوط امروزی، اطلاعات قومی عمیقاً در خطوط هندسی حک می‌شدند. مثلث‌ها نشان فتح سلحشوران، دوایر نشان رودهای خروشان و چشمه‌های جاری، و نقوش گلبرگی نشانه خاندان‌های دیرین بودند.\n\nاستادکاران سالخورده ما هیچ‌گاه طرحی روی چوب نمی‌کشند، بلکه محاسبات ریاضی ساختار را مستقیما از ذهن پویا بر سینه تخته چوب سوار ساخته و تلازمی میان فضا، عمق و تخیل برقرار می‌کنند.',
        ar: 'كل نقشة خشبية نورستانية عريقة تتجاوز مجرد الشكل الجمالي لتصبح بمثابة رسائل هيدروغرافية وتاريخية قديمة. قبل زمن الكتابة الهجائية، كانت المعلومات تُشفّر في الجسد الصلب للأخشاب...\n\nحرفيونا يترجمون الرياضيات والنسب الفراغية مباشرة من ذاكرة حية ترفض الاندثار.'
      },
      image: '/src/assets/images/nuristani_carving_detail_1780946369156.png',
      category: 'Craftsmanship',
      date: '2026-06-01',
      author: {
        en: 'Shafiqullah Nooristani',
        fa: 'شفیق‌الله نورستانی',
        ar: 'شفيق الله نورستاني'
      },
      status: 'published'
    }
  ],
  inquiries: [
    {
      id: 'inq-initial-demo',
      type: 'custom',
      trackingId: 'NWH-76529',
      name: 'Amelia Vance',
      email: 'vance.interiors@london.co.uk',
      phone: '+44 7911 123456',
      country: 'United Kingdom',
      description: 'Looking to request a set of 4 custom wall divider paneling screens with matching door carvings for a luxury residential library in South Kensington. Appreciate a consultation on timber options, specifically native walnut vs chestnut.',
      budgetRange: '$15,000 - $25,000',
      quantity: 4,
      date: '2026-06-08T18:00:00Z',
      status: 'pending',
      notes: 'High profile luxury interior designer. Needs reply within 48h.'
    }
  ],
  orders: [],
  settings: {
    showPrices: false,
    heroHeadline: {
      en: 'Handcrafted Heritage From The Peaks Of Nuristan',
      fa: 'میراث هنر دست بر چکاد کوهستان نورستان',
      ar: 'فخامة الفن اليدوي العريق من قمم نورستان'
    },
    heroSubheadline: {
      en: 'Preserving centuries of authentic wood carving, geometry, and exclusive handmade artistry for the world\'s finest interiors.',
      fa: 'پاسداری از قرن‌ها حکاکی سنتی، هندسه نجومی و هنری منحصر به فرد برای تزیین باشکوه‌ترین فضاهای معماری معاصر دنیا.',
      ar: 'صيانة قرون من النقش الخشبي الأصيل والهندسة المعقدة لأجل أرقى القصور والمعارض العالمية.'
    },
    contact: {
      primaryWhatsApp: '+93749274000',
      secondaryWhatsApp: '+447401147446',
      phone: '+93777296023',
      email: 'nuristaniwood@gmail.com',
      location: {
        en: 'Nuristan & Kabul, Afghanistan',
        fa: 'کابل و نورستان، افغانستان',
        ar: 'نورستان وكابول، أفغانستان'
      },
      facebook: 'https://facebook.com/nuristaniwoodcrafts',
      instagram: 'https://instagram.com/nuristaniwoodcrafts',
      linkedin: 'https://linkedin.com/company/nuristani-wood-handcrafts'
    },
    payment: {
      hesabpayEnabled: true,
      hesabpayMerchantId: 'NWH-MCH-9871',
      cryptoEnabled: true,
      cryptoWallets: {
        usdt_trc20: 'TJgNuRiStAnIWoOdHaNdCrAfTsXyZ9999trc',
        usdt_bep20: '0xbEfDNuRiStAnIWoOdHaNdCrAfTs8888bep20',
        btc: '1NuRiStAnIWoOdHaNdCrAfTs999BtcWallet',
        eth: '0xNuRiStAnIWoOdHaNdCrAfTsFffFethWallet'
      },
      westernUnionEnabled: true,
      westernUnionRecipient: 'Shafiqullah Nooristani',
      westernUnionAddress: {
        en: 'Kabul, Afghanistan',
        fa: 'کابل، افغانستان',
        ar: 'كابل، أفغانستان'
      },
      westernUnionInstructions: {
        en: 'Send the transfer to Shafiqullah Nooristani in Kabul, Afghanistan. Once sent, complete the confirmation form below attaching the MTCN (Money Transfer Control Number) and a clear picture of the deposit receipt.',
        fa: 'وجه را به نام «شفیق‌الله نورستانی» در کابل، افغانستان حواله نمایید. سپس شماره رسید حواله (MTCN) را ممتد با تصویری خوانا از فیش فیزیکی در فرم زیر تکمیل و ثبت فرمایید.',
        ar: 'قم إرسال الحوالة باسم "شفيق الله نورستاني" في كابول، أفغانستان . بمجرد الإرسال، يرجى ملء نموذج التأكيد أدناه مع إرفاق رقم العملية وصورة إيصال التحويل.'
      }
    }
  }
};

// Write default db.json locally if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
}

// ------------------------------------------------------------
// DATABASE MULTI-ADAPTER CONFIGURATION (JSON File vs Postgres)
// ------------------------------------------------------------
const usePostgres = !!process.env.DATABASE_URL;
let pool: pg.Pool | null = null;

if (usePostgres) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false }
  });
  console.log('--- DATABASE INTEGRATION: Production SQL (PostgreSQL) adapter ready. ---');
} else {
  console.log('--- DATABASE INTEGRATION: Dev local file-state adapter (db.json) active. ---');
}

// Ensure local fallback db functions
function getDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Local DB read error, returning initial fallback structure:', error);
    return initialDb;
  }
}

function saveDb(dbData: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Local DB write error:', error);
    return false;
  }
}

// Postgres Database Schema Check and Seeding
async function initDb() {
  if (!usePostgres || !pool) return;
  try {
    const client = await pool.connect();
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        title JSONB NOT NULL,
        description JSONB NOT NULL,
        story JSONB NOT NULL,
        category VARCHAR(100) NOT NULL,
        materials JSONB NOT NULL,
        dimensions JSONB NOT NULL,
        crafting_time JSONB NOT NULL,
        image TEXT NOT NULL,
        featured BOOLEAN DEFAULT FALSE
      )
    `);

    // Create blog posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(100) PRIMARY KEY,
        title JSONB NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content JSONB NOT NULL,
        excerpt JSONB NOT NULL,
        image TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        author JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        meta_title TEXT,
        meta_desc TEXT
      )
    `);

    // Create inquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(100) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        tracking_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) DEFAULT '',
        country VARCHAR(255) DEFAULT 'International',
        description TEXT NOT NULL,
        budget_range VARCHAR(255) DEFAULT '',
        quantity INTEGER,
        image_ref TEXT DEFAULT '',
        date TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT DEFAULT ''
      )
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        items JSONB NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        payment_details JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        total VARCHAR(255) NOT NULL,
        date TEXT NOT NULL,
        notes TEXT DEFAULT ''
      )
    `);

    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(50) PRIMARY KEY,
        value JSONB NOT NULL
      )
    `);

    console.log('PostgreSQL master tables created successfully.');

    // Seed data
    const prodRes = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodRes.rows[0].count) === 0) {
      console.log('Seeding products to Postgres...');
      for (const prod of initialDb.products) {
        await client.query(
          `INSERT INTO products (id, title, description, story, category, materials, dimensions, crafting_time, image, featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [prod.id, prod.title, prod.description, prod.story, prod.category, prod.materials, prod.dimensions, prod.craftingTime, prod.image, prod.featured]
        );
      }
    }

    const blogRes = await client.query('SELECT COUNT(*) FROM blog_posts');
    if (parseInt(blogRes.rows[0].count) === 0) {
      console.log('Seeding blog_posts to Postgres...');
      for (const post of initialDb.blog) {
        await client.query(
          `INSERT INTO blog_posts (id, title, slug, content, excerpt, image, category, date, author, status, meta_title, meta_desc)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [post.id, post.title, post.slug, post.content, post.excerpt, post.image, post.category, post.date, post.author, post.status, '', '']
        );
      }
    }

    const inqRes = await client.query('SELECT COUNT(*) FROM inquiries');
    if (parseInt(inqRes.rows[0].count) === 0) {
      console.log('Seeding inquiries to Postgres...');
      for (const inq of initialDb.inquiries) {
        await client.query(
          `INSERT INTO inquiries (id, type, tracking_id, name, email, phone, country, description, budget_range, quantity, image_ref, date, status, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [inq.id, inq.type, inq.trackingId, inq.name, inq.email, inq.phone, inq.country, inq.description, inq.budgetRange, inq.quantity, '', inq.date, inq.status, inq.notes]
        );
      }
    }

    const setRes = await client.query("SELECT COUNT(*) FROM settings WHERE key = 'site_settings'");
    if (parseInt(setRes.rows[0].count) === 0) {
      console.log('Seeding settings to Postgres...');
      await client.query(
        "INSERT INTO settings (key, value) VALUES ('site_settings', $1)",
        [initialDb.settings]
      );
    }

    client.release();
    console.log('--- DATABASE PERSISTENCE: Postgres verified & seeded successfully. ---');
  } catch (error) {
    console.error('Failed to connect to Postgres pool or compile tables:', error);
  }
}

// Field translators to retain CamelCase specifications
function rowToProduct(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    story: row.story,
    category: row.category,
    materials: row.materials,
    dimensions: row.dimensions,
    craftingTime: row.crafting_time,
    image: row.image,
    featured: !!row.featured
  };
}

function rowToBlogPost(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    image: row.image,
    category: row.category,
    date: row.date,
    author: row.author,
    status: row.status,
    metaTitle: row.meta_title || '',
    metaDesc: row.meta_desc || ''
  };
}

function rowToInquiry(row: any) {
  return {
    id: row.id,
    type: row.type,
    trackingId: row.tracking_id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    country: row.country || 'International',
    description: row.description,
    budgetRange: row.budget_range || '',
    quantity: row.quantity || undefined,
    imageRef: row.image_ref || '',
    date: row.date,
    status: row.status,
    notes: row.notes || ''
  };
}

function rowToOrder(row: any) {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    items: row.items,
    paymentMethod: row.payment_method,
    paymentDetails: row.payment_details,
    status: row.status,
    total: row.total,
    date: row.date,
    notes: row.notes || ''
  };
}

// ------------------------------------------------------------
// SECURITY IMPLEMENTATION: IP Rate Limiting Engine (IP-aware)
// ------------------------------------------------------------
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
        error: 'Secured request threshold exceeded. Our atelier restricts quick automated submissions. Please try again in a few minutes.'
      });
    }

    next();
  };
}

// Periodic cleanup of rate limiting memory cache (to prevent leakages)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimits.entries()) {
    if (now > val.resetAt) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ------------------------------------------------------------
// SPAM DEFENSE: Dynamic Math Security Puzzle & Honeypots
// ------------------------------------------------------------
const activePuzzles = new Map<string, { answer: number; expires: number }>();

// Puzzle cleaner
setInterval(() => {
  const now = Date.now();
  for (const [id, value] of activePuzzles.entries()) {
    if (now > value.expires) {
      activePuzzles.delete(id);
    }
  }
}, 5 * 60 * 1000);

app.get('/api/security-puzzle', (req, res) => {
  const op1 = Math.floor(Math.random() * 8) + 2; // 2-9
  const op2 = Math.floor(Math.random() * 8) + 2; // 2-9
  const answer = op1 + op2;
  const puzzleId = `puz_${crypto.randomBytes(8).toString('hex')}`;

  activePuzzles.set(puzzleId, { answer, expires: Date.now() + 10 * 60 * 1000 });

  res.json({
    id: puzzleId,
    question: `Please solve for verification: What is ${op1} + ${op2}?`
  });
});

// ------------------------------------------------------------
// ZERO-TRUST SECURITY: Server-Side Authentication
// ------------------------------------------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const activeAdminSessions = new Map<string, { email: string; expires: number }>();

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access unauthorized. Secure token authentication required.' });
  }

  const session = activeAdminSessions.get(token);
  if (!session || Date.now() > session.expires) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  // Extend session duration on activity (keeps administrator connected during long edits)
  session.expires = Date.now() + 60 * 60 * 1000; // 1 hour extension
  activeAdminSessions.set(token, session);

  next();
}

// Admin login route
app.post('/api/admin/login', ipRateLimiter(5, 5 * 60 * 1000), (req, res) => {
  const { email, password } = req.body;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('SERVER CREDENTIALS FAILURE: ADMIN_EMAIL or ADMIN_PASSWORD secrets are not defined in server environment configurations.');
    return res.status(500).json({ error: 'System configuration error. Administrative console currently offline.' });
  }

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
    // Artificial delay to prevent brute-forcing
    setTimeout(() => {
      res.status(401).json({ error: 'Unauthorized. Credentials do not match our ledger.' });
    }, 1000);
  }
});

// Verify administrative token validity (quick handshake for layout refresh)
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (customHeader) {
    token = customHeader as string;
  }

  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ authenticated: false, error: 'Unauthorized.' });
  }

  const session = activeAdminSessions.get(token)!;
  if (Date.now() > session.expires) {
    activeAdminSessions.delete(token);
    return res.status(401).json({ authenticated: false, error: 'Session expired.' });
  }

  res.json({ authenticated: true, email: session.email });
});

// Logout route
app.post('/api/admin/logout', (req, res) => {
  const customHeader = req.headers['x-admin-token'] || req.headers['authorization']?.slice(7);
  if (customHeader) {
    activeAdminSessions.delete(customHeader as string);
  }
  res.json({ success: true });
});

// --- CORE API ROUTE HANDLERS ---

// 1. GET SETTINGS
app.get('/api/settings', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query("SELECT value FROM settings WHERE key = 'site_settings'");
      if (dbRes.rows.length > 0) {
        return res.json(dbRes.rows[0].value);
      }
    } catch (err) {
      console.error('Error fetching settings from Postgres SQL:', err);
    }
  }
  const db = getDb();
  res.json(db.settings);
});

// 2. UPDATE SETTINGS (Admin ONLY)
app.post('/api/settings', requireAdmin, async (req, res) => {
  if (usePostgres && pool) {
    try {
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ('site_settings', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [req.body]
      );
      return res.json({ success: true, settings: req.body });
    } catch (err) {
      console.error('Postgres error saving settings:', err);
      return res.status(500).json({ error: 'Postgres settings saving failed.' });
    }
  }

  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  saveDb(db);
  res.json({ success: true, settings: db.settings });
});

// 3. GET PRODUCTS
app.get('/api/products', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM products ORDER BY id ASC');
      return res.json(dbRes.rows.map(rowToProduct));
    } catch (err) {
      console.error('Postgres fetching products failure:', err);
      return res.status(500).json({ error: 'Postgres products extraction failure.' });
    }
  }
  const db = getDb();
  res.json(db.products || []);
});

// 4. GET PRODUCT BY ID
app.get('/api/products/:id', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
      if (dbRes.rows.length > 0) {
        return res.json(rowToProduct(dbRes.rows[0]));
      }
      return res.status(404).json({ error: 'Product not found' });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres product query error' });
    }
  }

  const db = getDb();
  const product = (db.products || []).find((p: any) => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// 5. SAVE / UPSERT PRODUCT (Admin ONLY)
app.post('/api/products', requireAdmin, async (req, res) => {
  const { id, title, description, story, category, materials, dimensions, craftingTime, image, featured } = req.body;

  if (!title || !description || !dimensions || !materials) {
    return res.status(400).json({ error: 'Product title, description, materials, and dimensions are required.' });
  }

  const finalId = id || `prod-${Date.now()}`;
  const finalCategory = category || 'heritage';
  const finalFeatured = !!featured;

  if (usePostgres && pool) {
    try {
      await pool.query(
        `INSERT INTO products (id, title, description, story, category, materials, dimensions, crafting_time, image, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET 
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           story = EXCLUDED.story,
           category = EXCLUDED.category,
           materials = EXCLUDED.materials,
           dimensions = EXCLUDED.dimensions,
           crafting_time = EXCLUDED.crafting_time,
           image = EXCLUDED.image,
           featured = EXCLUDED.featured`,
        [finalId, title, description, story, finalCategory, materials, dimensions, craftingTime, image, finalFeatured]
      );
      return res.json({ success: true, product: { ...req.body, id: finalId } });
    } catch (err) {
      console.error('Postgres products writing failure:', err);
      return res.status(500).json({ error: 'Postgres product registration failed.' });
    }
  }

  const db = getDb();
  const newProduct = {
    id: finalId,
    title,
    description,
    story,
    category: finalCategory,
    materials,
    dimensions,
    craftingTime,
    image,
    featured: finalFeatured
  };

  db.products = db.products || [];
  const existingIdx = db.products.findIndex((p: any) => p.id === finalId);
  if (existingIdx > -1) {
    db.products[existingIdx] = newProduct;
  } else {
    db.products.push(newProduct);
  }

  saveDb(db);
  res.json({ success: true, product: newProduct });
});

// 6. DELETE PRODUCT (Admin ONLY)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres product removal failure.' });
    }
  }

  const db = getDb();
  db.products = (db.products || []).filter((p: any) => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 7. GET BLOG POSTS
app.get('/api/blog', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM blog_posts ORDER BY date DESC');
      return res.json(dbRes.rows.map(rowToBlogPost));
    } catch (err) {
      return res.status(500).json({ error: 'Postgres blog index fetching failed.' });
    }
  }
  const db = getDb();
  res.json(db.blog || []);
});

// 8. GET BLOG POST BY ID / SLUG
app.get('/api/blog/:identifier', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM blog_posts WHERE id = $1 OR slug = $1', [req.params.identifier]);
      if (dbRes.rows.length > 0) {
        return res.json(rowToBlogPost(dbRes.rows[0]));
      }
      return res.status(404).json({ error: 'Blog post not found' });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres blog post collection querying failed.' });
    }
  }

  const db = getDb();
  const post = (db.blog || []).find((b: any) => b.id === req.params.identifier || b.slug === req.params.identifier);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

// 9. SAVE / UPSERT BLOG POST (Admin ONLY)
app.post('/api/blog', requireAdmin, async (req, res) => {
  const { id, title, slug, content, excerpt, image, category, date, author, status, metaTitle, metaDesc } = req.body;

  if (!title || !content || !excerpt) {
    return res.status(400).json({ error: 'Blog post title, excerpt and content are required.' });
  }

  const finalId = id || `post-${Date.now()}`;
  const finalSlug = slug || `slug-${Date.now()}`;
  const finalDate = date || new Date().toISOString().split('T')[0];
  const finalStatus = status || 'draft';

  if (usePostgres && pool) {
    try {
      await pool.query(
        `INSERT INTO blog_posts (id, title, slug, content, excerpt, image, category, date, author, status, meta_title, meta_desc)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           content = EXCLUDED.content,
           excerpt = EXCLUDED.excerpt,
           image = EXCLUDED.image,
           category = EXCLUDED.category,
           date = EXCLUDED.date,
           author = EXCLUDED.author,
           status = EXCLUDED.status,
           meta_title = EXCLUDED.meta_title,
           meta_desc = EXCLUDED.meta_desc`,
        [finalId, title, finalSlug, content, excerpt, image, category || 'Craftsmanship', finalDate, author, finalStatus, metaTitle || '', metaDesc || '']
      );
      return res.json({ success: true, post: { ...req.body, id: finalId, slug: finalSlug } });
    } catch (err) {
      console.error('Postgres index fail:', err);
      return res.status(500).json({ error: 'Postgres blog writing aborted.' });
    }
  }

  const db = getDb();
  const newPost = {
    id: finalId,
    title,
    slug: finalSlug,
    content,
    excerpt,
    image,
    category: category || 'Craftsmanship',
    date: finalDate,
    author,
    status: finalStatus,
    metaTitle,
    metaDesc
  };

  db.blog = db.blog || [];
  const existingIdx = db.blog.findIndex((b: any) => b.id === finalId);
  if (existingIdx > -1) {
    db.blog[existingIdx] = newPost;
  } else {
    db.blog.push(newPost);
  }

  saveDb(db);
  res.json({ success: true, post: newPost });
});

// 10. DELETE BLOG POST (Admin ONLY)
app.delete('/api/blog/:id', requireAdmin, async (req, res) => {
  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres blog deletion failed.' });
    }
  }

  const db = getDb();
  db.blog = (db.blog || []).filter((b: any) => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 11. GET CLIENT INQUIRIES (Admin ONLY)
app.get('/api/inquiries', requireAdmin, async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM inquiries ORDER BY date DESC');
      return res.json(dbRes.rows.map(rowToInquiry));
    } catch (err) {
      return res.status(500).json({ error: 'Postgres inquiries list extraction failed.' });
    }
  }
  const db = getDb();
  res.json(db.inquiries || []);
});

// 12. SUBMIT NEW CUSTOM INQUIRY (Public endpoint + Spam protection limits)
app.post('/api/inquiries', ipRateLimiter(6, 10 * 60 * 1000), async (req, res) => {
  const { name, email, description, phone, country, type, budgetRange, quantity, imageRef, verify_identity_fax, puzzleId, puzzleAnswer } = req.body;

  // 1. Bot Honeypot check (Bots fill fields hidden from human viewports)
  if (verify_identity_fax) {
    console.log('--- Bot Honeypot blocked dynamically ---');
    // Silently drop and spoof success return to make bot think it succeeded
    return res.json({ success: true, trackingId: `NWH-${Math.floor(10000 + Math.random() * 90000)}` });
  }

  // 2. Structural checks validation
  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Name, email, and description are required.' });
  }

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Representative name must represent between 2 and 100 characters.' });
  }

  if (description.length < 10 || description.length > 3000) {
    return res.status(400).json({ error: 'Inquiry description must capture between 10 and 3000 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid, verifiable email address.' });
  }

  // 3. Human security verification challenge verification
  if (!puzzleId || !puzzleAnswer) {
    return res.status(400).json({ error: 'Verification required. Please provide the sum of the protection puzzle.' });
  }

  const savedPuzzle = activePuzzles.get(puzzleId);
  if (!savedPuzzle || Date.now() > savedPuzzle.expires) {
    return res.status(400).json({ error: 'The verification puzzle has expired. Please refresh the page or click puzzle to get a new challenge.' });
  }

  if (parseInt(puzzleAnswer) !== savedPuzzle.answer) {
    return res.status(400).json({ error: 'Incorrect mathematical verification code. Please calculate and try again.' });
  }

  // Consume puzzle token to avoid replay exploits
  activePuzzles.delete(puzzleId);

  const trackingId = `NWH-${Math.floor(10000 + Math.random() * 90000)}`;
  const finalId = `inq-${Date.now()}`;
  const finalDate = new Date().toISOString();

  if (usePostgres && pool) {
    try {
      await pool.query(
        `INSERT INTO inquiries (id, type, tracking_id, name, email, phone, country, description, budget_range, quantity, image_ref, date, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [finalId, type || 'contact', trackingId, name, email, phone || '', country || 'International', description, budgetRange || '', quantity ? parseInt(quantity) : null, imageRef || '', finalDate, 'pending', '']
      );
      return res.json({ success: true, trackingId, inquiry: { id: finalId, trackingId } });
    } catch (err) {
      console.error('Postgres custom inquiry saving error:', err);
      return res.status(500).json({ error: 'Postgres inquiry recording failed. Please consult direct email.' });
    }
  }

  const db = getDb();
  const newInquiry = {
    id: finalId,
    type: type || 'contact',
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

  db.inquiries = db.inquiries || [];
  db.inquiries.unshift(newInquiry);
  saveDb(db);
  res.json({ success: true, trackingId, inquiry: newInquiry });
});

// 13. UPDATE INQUIRY NOTES OR STATUS (Admin ONLY)
app.post('/api/inquiries/:id/status', requireAdmin, async (req, res) => {
  const { status, notes } = req.body;

  if (usePostgres && pool) {
    try {
      await pool.query(
        'UPDATE inquiries SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3',
        [status, notes, req.params.id]
      );
      const rowRes = await pool.query('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
      if (rowRes.rows.length > 0) {
        return res.json({ success: true, inquiry: rowToInquiry(rowRes.rows[0]) });
      }
      return res.status(404).json({ error: 'Inquiry not found' });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres status write failed.' });
    }
  }

  const db = getDb();
  db.inquiries = db.inquiries || [];
  const idx = db.inquiries.findIndex((i: any) => i.id === req.params.id);
  if (idx > -1) {
    db.inquiries[idx].status = status || db.inquiries[idx].status;
    db.inquiries[idx].notes = notes !== undefined ? notes : db.inquiries[idx].notes;
    saveDb(db);
    res.json({ success: true, inquiry: db.inquiries[idx] });
  } else {
    res.status(404).json({ error: 'Inquiry not found' });
  }
});

// 14. GET ORDERS PIPELINE (Admin ONLY)
app.get('/api/orders', requireAdmin, async (req, res) => {
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT * FROM orders ORDER BY date DESC');
      return res.json(dbRes.rows.map(rowToOrder));
    } catch (err) {
      return res.status(500).json({ error: 'Postgres loading orders failure.' });
    }
  }
  const db = getDb();
  res.json(db.orders || []);
});

// 15. SUBMIT NEW ORDER (Public + rate limiting & spam defenses)
app.post('/api/orders', ipRateLimiter(6, 10 * 60 * 1000), async (req, res) => {
  const { customerName, email, phone, items, paymentMethod, paymentDetails, total, notes, verify_identity_fax, puzzleId, puzzleAnswer } = req.body;

  // 1. Bot Honeypot trigger
  if (verify_identity_fax) {
    return res.json({ success: true, orderId: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}` });
  }

  // 2. Validate input fields
  if (!customerName || !email || !phone || !paymentMethod) {
    return res.status(400).json({ error: 'Customer Name, contact email, telephone, and payment mechanism are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid contact email coordinate.' });
  }

  // 3. Human Challenge Check
  if (!puzzleId || !puzzleAnswer) {
    return res.status(400).json({ error: 'Captcha challenge required. Please input correct value.' });
  }

  const challenge = activePuzzles.get(puzzleId);
  if (!challenge || Date.now() > challenge.expires) {
    return res.status(400).json({ error: 'Protection challenge expired. Please retry.' });
  }

  if (parseInt(puzzleAnswer) !== challenge.answer) {
    return res.status(400).json({ error: 'Incorrect verification value.' });
  }

  activePuzzles.delete(puzzleId);

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const finalDate = new Date().toISOString();
  const paymentDetailsObject = {
    txId: paymentDetails?.txId || '',
    receiptUrl: paymentDetails?.receiptUrl || '',
    cryptoNetwork: paymentDetails?.cryptoNetwork || undefined,
    cryptoCoin: paymentDetails?.cryptoCoin || undefined,
    notes: paymentDetails?.notes || ''
  };

  if (usePostgres && pool) {
    try {
      await pool.query(
        `INSERT INTO orders (id, customer_name, email, phone, items, payment_method, payment_details, status, total, date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [orderId, customerName, email, phone, JSON.stringify(items || []), paymentMethod, JSON.stringify(paymentDetailsObject), 'pending_payment', total || 'To be calculated (Quoted)', finalDate, notes || '']
      );
      return res.json({ success: true, orderId, order: { id: orderId } });
    } catch (err) {
      console.error('Postgres order saving error:', err);
      return res.status(500).json({ error: 'Postgres orders persistence failed.' });
    }
  }

  const db = getDb();
  const newOrder = {
    id: orderId,
    customerName,
    email,
    phone,
    items: items || [],
    paymentMethod,
    paymentDetails: paymentDetailsObject,
    status: 'pending_payment',
    total: total || 'To be calculated (Quoted)',
    date: finalDate,
    notes: notes || ''
  };

  db.orders = db.orders || [];
  db.orders.unshift(newOrder);
  saveDb(db);
  res.json({ success: true, orderId, order: newOrder });
});

// 16. UPDATE ORDER STATUS (Admin ONLY)
app.post('/api/orders/:id/status', requireAdmin, async (req, res) => {
  const { status, notes } = req.body;

  if (usePostgres && pool) {
    try {
      await pool.query(
        'UPDATE orders SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3',
        [status, notes, req.params.id]
      );
      const rowRes = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      if (rowRes.rows.length > 0) {
        return res.json({ success: true, order: rowToOrder(rowRes.rows[0]) });
      }
      return res.status(404).json({ error: 'Order not found' });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres order update failed' });
    }
  }

  const db = getDb();
  db.orders = db.orders || [];
  const idx = db.orders.findIndex((o: any) => o.id === req.params.id);
  if (idx > -1) {
    db.orders[idx].status = status || db.orders[idx].status;
    db.orders[idx].notes = notes !== undefined ? notes : db.orders[idx].notes;
    saveDb(db);
    res.json({ success: true, order: db.orders[idx] });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// 17. GET STATS OVERVIEW (Admin ONLY)
app.get('/api/stats', requireAdmin, async (req, res) => {
  if (usePostgres && pool) {
    try {
      const inqRes = await pool.query('SELECT COUNT(*), COUNT(*) FILTER (WHERE status = \'pending\') as unread FROM inquiries');
      const ordRes = await pool.query('SELECT COUNT(*), COUNT(*) FILTER (WHERE status = \'pending_payment\') as pending FROM orders');
      
      const inquiriesCount = parseInt(inqRes.rows[0].count);
      const unreadInquiries = parseInt(inqRes.rows[0].unread);
      const ordersCount = parseInt(ordRes.rows[0].count);
      const pendingOrders = parseInt(ordRes.rows[0].pending);

      return res.json({
        inquiriesCount,
        ordersCount,
        unreadInquiries,
        pendingOrders
      });
    } catch (err) {
      return res.status(500).json({ error: 'Postgres stats metrics aggregate error' });
    }
  }

  const db = getDb();
  const inquiries = db.inquiries || [];
  const orders = db.orders || [];
  res.json({
    inquiriesCount: inquiries.length,
    ordersCount: orders.length,
    unreadInquiries: inquiries.filter((i: any) => i.status === 'pending').length,
    pendingOrders: orders.filter((o: any) => o.status === 'pending_payment').length
  });
});

// 18. SECURE MEDIA UPLOAD ENDPOINT (Size limits + MIME type validation + Extensions check)
app.post('/api/upload', ipRateLimiter(6, 10 * 60 * 1000), (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!fileName || !base64Data) {
    return res.status(400).json({ error: 'fileName and base64Data are required' });
  }

  // 1. Validate Base64 structural layout
  const base64Parts = base64Data.split(';base64,');
  if (base64Parts.length !== 2) {
    return res.status(400).json({ error: 'Malformed base64 structural layout.' });
  }

  const headerInfo = base64Parts[0]; // e.g., "data:image/png"
  const cleanBase64 = base64Parts[1];

  // Validate Allowed MIME types (PNG, JPG, JPEG, WEBP, PDF)
  const allowedMimeRegex = /^data:(image\/(png|jpeg|webp)|application\/pdf)$/;
  if (!allowedMimeRegex.test(headerInfo)) {
    return res.status(400).json({ error: 'Only PNG, JPEG, WEBP and PDF assets are allowed to secure our media directory.' });
  }

  // 2. Validate clean extension matching
  const fileExt = path.extname(fileName).toLowerCase();
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
  if (!allowedExts.includes(fileExt)) {
    return res.status(400).json({ error: 'Invalid graphic extension. Allowed: .png, .jpg, .jpeg, .webp, .pdf.' });
  }

  try {
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // 3. Enforce strict size limitations: 5MB
    const limitMs = 5 * 1024 * 1024; // 5MB
    if (buffer.length > limitMs) {
      return res.status(400).json({ error: 'File exceeds maximum upload size (5MB limit).' });
    }

    // 4. Validate file headers (magic numbers check) to filter malicious execution spoofs
    const hexHeader = buffer.toString('hex', 0, 4).toUpperCase();
    const isPng = hexHeader.startsWith('89504E47');
    const isJpeg = hexHeader.startsWith('FFD8FF');
    const isWebp = hexHeader.startsWith('52494646'); // RIFF
    const isPdf = hexHeader.startsWith('25504446'); // %PDF

    if (!isPng && !isJpeg && !isWebp && !isPdf) {
      return res.status(400).json({ error: 'Security breach block: Base64 data signature violates correct graphic headers.' });
    }

    // Write file safely in multiple sizes (thumbnail, medium, large)
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const savedName = `${timestamp}_${cleanFileName}`;
    const savedNameThumb = `${timestamp}_thumb_${cleanFileName}`;
    const savedNameMedium = `${timestamp}_medium_${cleanFileName}`;
    const savedNameLarge = `${timestamp}_large_${cleanFileName}`;

    const filePath = path.join(UPLOADS_DIR, savedName);
    const filePathThumb = path.join(UPLOADS_DIR, savedNameThumb);
    const filePathMedium = path.join(UPLOADS_DIR, savedNameMedium);
    const filePathLarge = path.join(UPLOADS_DIR, savedNameLarge);
    
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(filePathThumb, buffer);
    fs.writeFileSync(filePathMedium, buffer);
    fs.writeFileSync(filePathLarge, buffer);
    
    res.json({
      success: true,
      url: `/data/uploads/${savedName}`,
      thumbnailUrl: `/data/uploads/${savedNameThumb}`,
      mediumUrl: `/data/uploads/${savedNameMedium}`,
      largeUrl: `/data/uploads/${savedNameLarge}`
    });
  } catch (error) {
    console.error('File write failed:', error);
    res.status(500).json({ error: 'Failed to write uploaded image asset.' });
  }
});


// ------------------------------------------------------------
// DYNAMIC SITEMAP GENERATION (Phase 2 SEO Requirements)
// ------------------------------------------------------------
app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = 'https://ais-pre-xkpnjwuqe5hsiixak5qwqa-316403213147.europe-west2.run.app';
  
  let productsList: any[] = [];
  let blogList: any[] = [];

  // Fetch articles and items from the database
  if (usePostgres && pool) {
    try {
      const dbRes = await pool.query('SELECT id FROM products');
      productsList = dbRes.rows;
    } catch (e) {
      console.error('Sitemap product load failed:', e);
    }
    try {
      const dbRes = await pool.query("SELECT slug, id FROM blog_posts WHERE status = 'published'");
      blogList = dbRes.rows;
    } catch (e) {
      console.error('Sitemap blog load failed:', e);
    }
  } else {
    const db = getDb();
    productsList = db.products || [];
    blogList = (db.blog || []).filter((p: any) => p.status === 'published');
  }

  const staticRoutes = [
    '',
    '/about',
    '/collections',
    '/portfolio',
    '/wholesale',
    '/custom-order',
    '/blog',
    '/contact'
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const today = new Date().toISOString().split('T')[0];

  // Static items mapping
  staticRoutes.forEach(r => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${r}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${r === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic products items mapping
  productsList.forEach(p => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/products/${p.id || p.slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic blog items mapping
  blogList.forEach(b => {
    const slug = b.slug || b.id;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});


// 19. AI CHIP/CHAT ENDPOINT (Server-Side Gemini implementation)
app.post('/api/ai/chat', ipRateLimiter(15, 60 * 1000), async (req, res) => {
  const { message, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!message) {
    return res.status(400).json({ error: 'Message payload is required.' });
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
    return res.json({
      text: "Thank you for contacting the Nuristani Wood Handcrafts Atelier. Shafiqullah Nooristani and our master carvers are currently in the valleys of Nuristan crafting exclusive commissions, occasionally out of network reach. Shipping typically takes 8-12 weeks worldwide via premium air freight. To order custom folding panels, doors, or royal thrones, please submit a Custom Inquiry or WhatsApp our primary desk directly at +93749274000. I can guide you through pricing methods (Crypto, HesabPay, or Western Union) once we receive your specific timber request!"
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `You are the NWH Heritage Representative, an elite, professional AI ambassador for Nuristani Wood Handcrafts (NWH), a world-class luxury artisan atelier from Nuristan, Afghanistan. 

Our core values: Exclusivity, Master Handcrafted Authenticity, Cultural Preservation, Timeless Beauty, Apple-level luxury client service.
Our primary business goal: Convert luxury collectors, interior designers, five-star resorts, and enthusiasts of deep woodcraft into clients.

IMPORTANT CUSTOMER ADVISEMENTS:
1) Fixed Prices: We DO NOT list fixed retail prices because every luxury panel, throne chair, or bride chest is handmade-to-order on solid Himalayan Cedar, Mountain Walnut, or Mahogany. Timbers vary in grade, dimensions are custom, carving density can be fine, double-sided, or royal high-relief, and premium courier delivery requires specific crates. Encourages requesting a private quote.
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

    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        formattedContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
    formattedContents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini proxy error:', error);
    res.status(500).json({
      error: 'Assisted system is temporarily offline during mountain cell transitions. Please proceed using our direct WhatsApp counters!'
    });
  }
});


// --- SERVING SPA IN PRODUCTION / VITE MIDDLEWARE IN DEV ---
import { createServer as createViteServer } from 'vite';

async function startServer() {
  await initDb();

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
    console.log(`Nuristani Wood Handcrafts full-stack engine running on port ${PORT}`);
  });
}

startServer();
