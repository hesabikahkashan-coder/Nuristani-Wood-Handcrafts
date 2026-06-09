import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Load default local structures
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let hasConfig = false;
let dbFirestore: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    dbFirestore = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    hasConfig = true;
    console.log('--- DATABASE INTEGRATION: Firebase Firestore initialized successfully ---');
  } else {
    console.warn('--- DATABASE WARNING: firebase-applet-config.json not found, falling back ---');
  }
} catch (e) {
  console.error('--- DATABASE ERROR: Failed to initialize Firebase Firestore:', e);
}

// Fallback db.json loading
function getLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read local fallback DB:', err);
  }
  return { products: [], blog: [], inquiries: [], orders: [], settings: {} };
}

function saveLocalDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write local fallback DB:', err);
  }
}

// Initial seed values if Firestore is fresh
const defaultSettings = {
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
};

const defaultProducts = [
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
];

const defaultBlog = [
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
];

// Seeding engine
export async function seedFirestoreIfNeeded() {
  if (!dbFirestore) return;
  try {
    // 1. Settings Seeding
    const settingsDocRef = doc(dbFirestore, 'settings', 'global');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      console.log('Seeding settings into Firestore...');
      await setDoc(settingsDocRef, defaultSettings);
    }

    // 2. Products Seeding
    const productsCollRef = collection(dbFirestore, 'products');
    const productsSnap = await getDocs(productsCollRef);
    if (productsSnap.empty) {
      console.log('Seeding products into Firestore...');
      for (const p of defaultProducts) {
        await setDoc(doc(dbFirestore, 'products', p.id), p);
      }
    }

    // 3. Blog Seeding
    const blogCollRef = collection(dbFirestore, 'blog');
    const blogSnap = await getDocs(blogCollRef);
    if (blogSnap.empty) {
      console.log('Seeding blog posts into Firestore...');
      for (const b of defaultBlog) {
        await setDoc(doc(dbFirestore, 'blog', b.id), b);
      }
    }
    console.log('--- DATABASE SEEDING: Firestore collections verified and seeded ---');
  } catch (error) {
    console.error('Failed to seed Firestore database: ', error);
  }
}

// ------------------------------------------------------------
// DB INTERFACES FOR SERVER
// ------------------------------------------------------------

export async function getSettings() {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'settings', 'global');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.error('Firestore getSettings failed, falling back:', e);
    }
  }
  return getLocalDb().settings || defaultSettings;
}

export async function saveSettings(data: any) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'settings', 'global');
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (e) {
      console.error('Firestore saveSettings failed:', e);
    }
  }
  const db = getLocalDb();
  db.settings = { ...db.settings, ...data };
  saveLocalDb(db);
  return true;
}

export async function getProducts() {
  if (dbFirestore) {
    try {
      const coll = collection(dbFirestore, 'products');
      const snap = await getDocs(coll);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data());
      });
      if (list.length > 0) {
        return list;
      }
    } catch (e) {
      console.error('Firestore getProducts failed, falling back:', e);
    }
  }
  return getLocalDb().products || defaultProducts;
}

export async function getProductById(id: string) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.error('Firestore getProductById failed:', e);
    }
  }
  const products = await getProducts();
  return products.find((p: any) => p.id === id) || null;
}

export async function saveProduct(product: any) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'products', product.id);
      await setDoc(docRef, product);
      return true;
    } catch (e) {
      console.error('Firestore saveProduct failed:', e);
    }
  }
  const db = getLocalDb();
  db.products = db.products || [];
  const idx = db.products.findIndex((p: any) => p.id === product.id);
  if (idx > -1) {
    db.products[idx] = product;
  } else {
    db.products.push(product);
  }
  saveLocalDb(db);
  return true;
}

export async function deleteProduct(id: string) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'products', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Firestore deleteProduct failed:', e);
    }
  }
  const db = getLocalDb();
  db.products = (db.products || []).filter((p: any) => p.id !== id);
  saveLocalDb(db);
  return true;
}

export async function getBlog() {
  if (dbFirestore) {
    try {
      const coll = collection(dbFirestore, 'blog');
      const snap = await getDocs(coll);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data());
      });
      if (list.length > 0) {
        return list;
      }
    } catch (e) {
      console.error('Firestore getBlog failed, falling back:', e);
    }
  }
  return getLocalDb().blog || defaultBlog;
}

export async function getBlogByIdentifier(identifier: string) {
  if (dbFirestore) {
    try {
      // Check directly by ID
      const docRef = doc(dbFirestore, 'blog', identifier);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      
      // Otherwise query by slug
      const coll = collection(dbFirestore, 'blog');
      const q = query(coll, where('slug', '==', identifier));
      const snapQ = await getDocs(q);
      let match: any = null;
      snapQ.forEach(d => {
        match = d.data();
      });
      if (match) return match;
    } catch (e) {
      console.error('Firestore getBlogByIdentifier failed:', e);
    }
  }
  const blog = await getBlog();
  return blog.find((b: any) => b.id === identifier || b.slug === identifier) || null;
}

export async function saveBlog(post: any) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'blog', post.id);
      await setDoc(docRef, post);
      return true;
    } catch (e) {
      console.error('Firestore saveBlog failed:', e);
    }
  }
  const db = getLocalDb();
  db.blog = db.blog || [];
  const idx = db.blog.findIndex((b: any) => b.id === post.id);
  if (idx > -1) {
    db.blog[idx] = post;
  } else {
    db.blog.push(post);
  }
  saveLocalDb(db);
  return true;
}

export async function deleteBlog(id: string) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'blog', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Firestore deleteBlog failed:', e);
    }
  }
  const db = getLocalDb();
  db.blog = (db.blog || []).filter((b: any) => b.id !== id);
  saveLocalDb(db);
  return true;
}

export async function getInquiries() {
  if (dbFirestore) {
    try {
      const coll = collection(dbFirestore, 'inquiries');
      const snap = await getDocs(coll);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data());
      });
      return list;
    } catch (e) {
      console.error('Firestore getInquiries failed:', e);
    }
  }
  return getLocalDb().inquiries || [];
}

export async function saveInquiry(inquiry: any) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'inquiries', inquiry.id);
      await setDoc(docRef, inquiry);
      return true;
    } catch (e) {
      console.error('Firestore saveInquiry failed:', e);
    }
  }
  const db = getLocalDb();
  db.inquiries = db.inquiries || [];
  db.inquiries.unshift(inquiry);
  saveLocalDb(db);
  return true;
}

export async function updateInquiryStatus(id: string, status: string, notes?: string) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'inquiries', id);
      const updates: any = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      await updateDoc(docRef, updates);
      
      const snap = await getDoc(docRef);
      return snap.data();
    } catch (e) {
      console.error('Firestore updateInquiryStatus failed:', e);
    }
  }
  const db = getLocalDb();
  db.inquiries = db.inquiries || [];
  const idx = db.inquiries.findIndex((i: any) => i.id === id);
  if (idx > -1) {
    if (status) db.inquiries[idx].status = status;
    if (notes !== undefined) db.inquiries[idx].notes = notes;
    saveLocalDb(db);
    return db.inquiries[idx];
  }
  return null;
}

export async function getOrders() {
  if (dbFirestore) {
    try {
      const coll = collection(dbFirestore, 'orders');
      const snap = await getDocs(coll);
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data());
      });
      return list;
    } catch (e) {
      console.error('Firestore getOrders failed:', e);
    }
  }
  return getLocalDb().orders || [];
}

export async function getOrderById(id: string) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'orders', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.error('Firestore getOrderById failed:', e);
    }
  }
  const orders = await getOrders();
  return orders.find((o: any) => o.id === id) || null;
}

export async function saveOrder(order: any) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'orders', order.id);
      await setDoc(docRef, order);
      return true;
    } catch (e) {
      console.error('Firestore saveOrder failed:', e);
    }
  }
  const db = getLocalDb();
  db.orders = db.orders || [];
  const idx = db.orders.findIndex((o: any) => o.id === order.id);
  if (idx > -1) {
    db.orders[idx] = order;
  } else {
    db.orders.unshift(order);
  }
  saveLocalDb(db);
  return true;
}

export async function updateOrderStatus(id: string, status: string, notes?: string) {
  if (dbFirestore) {
    try {
      const docRef = doc(dbFirestore, 'orders', id);
      const updates: any = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      await updateDoc(docRef, updates);
      
      const snap = await getDoc(docRef);
      return snap.data();
    } catch (e) {
      console.error('Firestore updateOrderStatus failed:', e);
    }
  }
  const db = getLocalDb();
  db.orders = db.orders || [];
  const idx = db.orders.findIndex((o: any) => o.id === id);
  if (idx > -1) {
    if (status) db.orders[idx].status = status;
    if (notes !== undefined) db.orders[idx].notes = notes;
    saveLocalDb(db);
    return db.orders[idx];
  }
  return null;
}
