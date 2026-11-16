import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('purplecart.db');
db.pragma('journal_mode = WAL');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,
    discount_percentage INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT 0,
    is_best_seller BOOLEAN DEFAULT 0,
    is_deal BOOLEAN DEFAULT 0,
    is_new BOOLEAN DEFAULT 0,
    brand TEXT,
    stock_status TEXT DEFAULT 'In Stock',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wishlist_id INTEGER,
    product_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_number TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    shipping_fee REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    shipping_address_id INTEGER,
    payment_method TEXT DEFAULT 'Credit Card',
    payment_status TEXT DEFAULT 'Paid',
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    transaction_id TEXT,
    payment_gateway TEXT DEFAULT 'Sandbox',
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
    discount_value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    expiry_date TEXT,
    is_active BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER UNIQUE,
    stock_quantity INTEGER DEFAULT 50,
    low_stock_threshold INTEGER DEFAULT 5,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

// Seed initial data if empty
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (catCount.count === 0) {
  console.log('Seeding initial database...');

  // Seed Categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', desc: 'Cutting-edge gadgets, smartphones, audio & smart home devices', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600' },
    { name: 'Fashion', slug: 'fashion', desc: 'Trendy apparel, footwear, luxury wear & daily style', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', desc: 'Modern kitchenware, decor, cookware & smart appliances', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', desc: 'Skincare, luxury cosmetics, haircare & wellness essentials', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600' },
    { name: 'Books', slug: 'books', desc: 'Bestselling novels, tech guides, biographies & educational reads', img: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=600' },
    { name: 'Sports & Fitness', slug: 'sports-fitness', desc: 'Workout gear, yoga equipment, outdoor & athletic accessories', img: 'https://images.unsplash.com/photo-1517649763962-0c6232660102?auto=format&fit=crop&q=80&w=600' },
    { name: 'Toys & Games', slug: 'toys-games', desc: 'Educational toys, board games, puzzles & action figures', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=600' },
    { name: 'Grocery', slug: 'grocery', desc: 'Organic snacks, gourmet coffees, pantry staples & healthy treats', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600' },
    { name: 'Accessories', slug: 'accessories', desc: 'Smartwatches, luxury bags, premium wallets & sunglasses', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600' },
  ];

  const insertCat = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
  const catMap: Record<string, number> = {};
  for (const c of categories) {
    const info = insertCat.run(c.name, c.slug, c.desc, c.img);
    catMap[c.slug] = Number(info.lastInsertRowid);
  }

  // Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const custHash = bcrypt.hashSync('customer123', salt);

  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)');
  const adminId = Number(insertUser.run('Admin User', 'admin@purplecart.com', adminHash, 'admin', '+1 (555) 019-2834').lastInsertRowid);
  const custId = Number(insertUser.run('Sophia Taylor', 'customer@purplecart.com', custHash, 'customer', '+1 (555) 789-0123').lastInsertRowid);

  // Seed Addresses
  const insertAddr = db.prepare('INSERT INTO addresses (user_id, full_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertAddr.run(custId, 'Sophia Taylor', '742 Evergreen Terrace', 'Apt 4B', 'Springfield', 'IL', '62704', 'United States', '+1 (555) 789-0123', 1);

  // Seed Coupons
  const insertCoupon = db.prepare('INSERT INTO coupons (code, discount_type, discount_value, min_purchase, expiry_date, is_active) VALUES (?, ?, ?, ?, ?, ?)');
  insertCoupon.run('PURPLE10', 'percentage', 10, 50, '2027-12-31', 1);
  insertCoupon.run('CART20', 'percentage', 20, 100, '2027-12-31', 1);
  insertCoupon.run('SAVE50', 'fixed', 50, 250, '2027-12-31', 1);

  // Seed Products
  const products = [
    {
      cat: 'electronics',
      name: 'Pulse Pro Wireless ANC Headphones',
      slug: 'pulse-pro-wireless-headphones',
      desc: 'Experience studio-grade acoustic clarity with active noise cancellation, 40-hour battery life, and plush memory foam ear cushions for ultimate comfort.',
      price: 249.99,
      orig: 299.99,
      disc: 17,
      rating: 4.8,
      reviews: 142,
      trending: 1,
      best: 1,
      deal: 0,
      new: 0,
      brand: 'PulseAudio',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'electronics',
      name: 'Cyberpunk Neon Mechanical Keyboard',
      slug: 'cyberpunk-neon-mechanical-keyboard',
      desc: 'RGB backlit mechanical keyboard with hot-swappable purple switches, aircraft-grade aluminum frame, and customizable macro keys.',
      price: 129.99,
      orig: 159.99,
      disc: 19,
      rating: 4.9,
      reviews: 89,
      trending: 1,
      best: 0,
      deal: 1,
      new: 0,
      brand: 'VortexGear',
      img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'electronics',
      name: 'Zenith Ultra 4K HDR Smart Monitor',
      slug: 'zenith-ultra-4k-smart-monitor',
      desc: '27-inch 4K UHD IPS display with 99% sRGB color accuracy, built-in USB-C power delivery, and immersive Dolby Atmos speakers.',
      price: 459.99,
      orig: 549.99,
      disc: 16,
      rating: 4.7,
      reviews: 64,
      trending: 0,
      best: 1,
      deal: 0,
      new: 1,
      brand: 'ZenithTech',
      img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'fashion',
      name: 'Velvet Horizon Luxury Purple Hoodie',
      slug: 'velvet-horizon-luxury-purple-hoodie',
      desc: 'Crafted from ultra-soft organic cotton fleece with a relaxed streetwear fit, double-lined hood, and subtle embroidered logo.',
      price: 79.99,
      orig: 110.00,
      disc: 27,
      rating: 4.9,
      reviews: 210,
      trending: 1,
      best: 1,
      deal: 1,
      new: 0,
      brand: 'VelvetStitch',
      img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'fashion',
      name: 'Aura Minimalist Trench Coat',
      slug: 'aura-minimalist-trench-coat',
      desc: 'Water-resistant tailored trench coat with classic lapels, adjustable waist belt, and deep side pockets for timeless elegance.',
      price: 189.99,
      orig: 230.00,
      disc: 17,
      rating: 4.6,
      reviews: 45,
      trending: 0,
      best: 0,
      deal: 0,
      new: 1,
      brand: 'AuraLondon',
      img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'home-kitchen',
      name: 'Royal Brew Programmable Espresso Machine',
      slug: 'royal-brew-programmable-espresso-machine',
      desc: '15-bar Italian pump espresso maker with integrated conical burr grinder, milk frother, and gorgeous stainless steel & purple finish.',
      price: 349.99,
      orig: 420.00,
      disc: 17,
      rating: 4.8,
      reviews: 118,
      trending: 1,
      best: 1,
      deal: 1,
      new: 0,
      brand: 'RoyalBrew',
      img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'home-kitchen',
      name: 'Amethyst Ceramic Non-Stick Cookware Set',
      slug: 'amethyst-ceramic-non-stick-cookware-set',
      desc: '10-piece eco-friendly ceramic non-stick cookware set free from PTFE and PFOA. Features glass lids and ergonomic stay-cool handles.',
      price: 199.99,
      orig: 260.00,
      disc: 23,
      rating: 4.7,
      reviews: 92,
      trending: 0,
      best: 1,
      deal: 0,
      new: 1,
      brand: 'ChefCraft',
      img: 'https://images.unsplash.com/photo-1584990347426-c785bc6757c2?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1584990347426-c785bc6757c2?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'beauty-personal-care',
      name: 'Lumina Glow Hyaluronic Serum & Cream Kit',
      slug: 'lumina-glow-hyaluronic-serum-cream-kit',
      desc: 'Deeply hydrating daily skincare regimen infused with pure hyaluronic acid, niacinamide, and botanical antioxidants for radiant skin.',
      price: 64.99,
      orig: 85.00,
      disc: 24,
      rating: 4.9,
      reviews: 310,
      trending: 1,
      best: 1,
      deal: 1,
      new: 0,
      brand: 'LuminaGlow',
      img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'books',
      name: 'The Art of Full-Stack Architecture (Hardcover)',
      slug: 'art-of-full-stack-architecture',
      desc: 'Comprehensive masterclass on designing scalable web applications, distributed microservices, and high-performance React frontends.',
      price: 49.99,
      orig: 65.00,
      disc: 23,
      rating: 4.9,
      reviews: 78,
      trending: 1,
      best: 0,
      deal: 0,
      new: 1,
      brand: 'TechPress',
      img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'sports-fitness',
      name: 'Titanium Grip Pro Smart Fitness Watch',
      slug: 'titanium-grip-pro-smart-fitness-watch',
      desc: 'Advanced biometric health tracker with ECG, GPS tracking, 100+ sports modes, 7-day battery life, and AMOLED sapphire crystal display.',
      price: 179.99,
      orig: 229.99,
      disc: 22,
      rating: 4.8,
      reviews: 156,
      trending: 1,
      best: 1,
      deal: 1,
      new: 0,
      brand: 'TitanFit',
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'toys-games',
      name: 'Nebula Galaxy Electric RC Drone 4K',
      slug: 'nebula-galaxy-electric-rc-drone-4k',
      desc: 'Foldable 4K dual-camera drone with obstacle avoidance, GPS auto-return, 30 minutes flight time, and beginner-friendly controls.',
      price: 299.99,
      orig: 379.99,
      disc: 21,
      rating: 4.6,
      reviews: 83,
      trending: 1,
      best: 0,
      deal: 1,
      new: 1,
      brand: 'SkyMaster',
      img: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'grocery',
      name: 'Artisan Organic Dark Roast Coffee Beans',
      slug: 'artisan-organic-dark-roast-coffee-beans',
      desc: 'Single-origin 100% Arabica coffee beans with rich notes of dark chocolate, caramel, and roasted hazelnuts. Fair-trade certified (1kg).',
      price: 24.99,
      orig: 32.00,
      disc: 22,
      rating: 4.9,
      reviews: 420,
      trending: 1,
      best: 1,
      deal: 1,
      new: 0,
      brand: 'BeanCo',
      img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      cat: 'accessories',
      name: 'Monarch Full-Grain Leather RFID Wallet',
      slug: 'monarch-full-grain-leather-rfid-wallet',
      desc: 'Slim bifold wallet crafted from premium vegetable-tanned leather with advanced RFID-blocking security and quick-access card slots.',
      price: 45.99,
      orig: 60.00,
      disc: 23,
      rating: 4.8,
      reviews: 135,
      trending: 0,
      best: 1,
      deal: 0,
      new: 1,
      brand: 'Monarch',
      img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'
      ]
    }
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (category_id, name, slug, description, price, original_price, discount_percentage, rating, review_count, is_trending, is_best_seller, is_deal, is_new, brand, stock_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)');
  const insertInv = db.prepare('INSERT INTO inventory (product_id, stock_quantity) VALUES (?, ?)');
  const insertRev = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)');

  for (const p of products) {
    const catId = catMap[p.cat] || 1;
    const res = insertProd.run(
      catId, p.name, p.slug, p.desc, p.price, p.orig, p.disc, p.rating, p.reviews,
      p.trending, p.best, p.deal, p.new, p.brand, 'In Stock'
    );
    const prodId = Number(res.lastInsertRowid);

    let isFirst = 1;
    for (const imgUrl of p.images) {
      insertImg.run(prodId, imgUrl, isFirst);
      isFirst = 0;
    }

    insertInv.run(prodId, Math.floor(Math.random() * 40) + 15);
    insertRev.run(prodId, custId, 5, 'Absolute top tier quality! Exceeded all my expectations.');
  }

  // Seed Cart & Wishlist for customer
  const cartRes = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(custId);
  const cartId = Number(cartRes.lastInsertRowid);
  db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cartId, 1, 1);

  const wishRes = db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(custId);
  const wishId = Number(wishRes.lastInsertRowid);
  db.prepare('INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)').run(wishId, 2);

  // Seed an initial order
  const ordRes = db.prepare(`
    INSERT INTO orders (user_id, order_number, total_amount, shipping_fee, discount_amount, final_amount, status, shipping_address_id, payment_method, payment_status, tracking_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(custId, 'PC-982341', 249.99, 0.00, 0.00, 249.99, 'Shipped', 1, 'Credit Card', 'Paid', 'TRK-89234189');
  const ordId = Number(ordRes.lastInsertRowid);
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').run(ordId, 1, 1, 249.99);
  db.prepare('INSERT INTO payments (order_id, transaction_id, payment_gateway, amount, status) VALUES (?, ?, ?, ?, ?)').run(ordId, 'TXN-998234', 'Sandbox', 249.99, 'Completed');

  console.log('Database seeded successfully!');
}

const app = express();
app.use(express.json());

// API Routes
// 1. Auth
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const info = db.prepare('INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)').run(name, email, hash, phone || '');
    const userId = Number(info.lastInsertRowid);

    // Create cart & wishlist
    db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
    db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(userId);

    const user = db.prepare('id, name, email, role, phone, created_at FROM users WHERE id = ?').get(userId);
    res.json({ message: 'Registration successful', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Products
app.get('/api/products', (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, rating, sort, deal, trending, best, new: isNew } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }
    if (rating) {
      query += ` AND p.rating >= ?`;
      params.push(Number(rating));
    }
    if (deal === 'true') {
      query += ` AND p.is_deal = 1`;
    }
    if (trending === 'true') {
      query += ` AND p.is_trending = 1`;
    }
    if (best === 'true') {
      query += ` AND p.is_best_seller = 1`;
    }
    if (isNew === 'true') {
      query += ` AND p.is_new = 1`;
    }

    if (sort === 'price_low') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_high') {
      query += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY p.rating DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY p.created_at DESC`;
    } else {
      query += ` ORDER BY p.review_count DESC`;
    }

    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? OR p.slug = ?
    `).get(id, id) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = db.prepare('SELECT image_url, is_primary FROM product_images WHERE product_id = ?').all(product.id);
    const inventory = db.prepare('SELECT stock_quantity FROM inventory WHERE product_id = ?').get(product.id);
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(product.id);

    res.json({
      ...product,
      images: images.map((i: any) => i.image_url),
      stock_quantity: (inventory as any)?.stock_quantity || 50,
      reviews
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cart
app.get('/api/cart', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 2; // Default to customer if not passed
    let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId) as any;
    if (!cart) {
      const info = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
      cart = { id: Number(info.lastInsertRowid) };
    }

    const items = db.prepare(`
      SELECT ci.id as cart_item_id, ci.quantity, p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.cart_id = ?
    `).all(cart.id);

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    res.json({ cart_id: cart.id, items, subtotal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', (req, res) => {
  try {
    const { userId = 2, productId, quantity = 1 } = req.body;
    let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId) as any;
    if (!cart) {
      const info = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId);
      cart = { id: Number(info.lastInsertRowid) };
    }

    const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?').get(cart.id, productId) as any;
    if (existing) {
      const newQty = existing.quantity + Number(quantity);
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cart.id, productId, quantity);
    }

    res.json({ message: 'Added to cart successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cart/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
    } else {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, itemId);
    }
    res.json({ message: 'Cart updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
    res.json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Wishlist
app.get('/api/wishlist', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 2;
    let wish = db.prepare('SELECT id FROM wishlists WHERE user_id = ?').get(userId) as any;
    if (!wish) {
      const info = db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(userId);
      wish = { id: Number(info.lastInsertRowid) };
    }

    const items = db.prepare(`
      SELECT wi.id as wishlist_item_id, p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE wi.wishlist_id = ?
    `).all(wish.id);

    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlist', (req, res) => {
  try {
    const { userId = 2, productId } = req.body;
    let wish = db.prepare('SELECT id FROM wishlists WHERE user_id = ?').get(userId) as any;
    if (!wish) {
      const info = db.prepare('INSERT INTO wishlists (user_id) VALUES (?)').run(userId);
      wish = { id: Number(info.lastInsertRowid) };
    }

    const existing = db.prepare('SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?').get(wish.id, productId);
    if (!existing) {
      db.prepare('INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)').run(wish.id, productId);
    }
    res.json({ message: 'Wishlist updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wishlist/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.headers['x-user-id'] || 2;
    const wish = db.prepare('SELECT id FROM wishlists WHERE user_id = ?').get(userId) as any;
    if (wish) {
      db.prepare('DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?').run(wish.id, productId);
    }
    res.json({ message: 'Removed from wishlist' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Addresses
app.get('/api/addresses', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 2;
    const addrs = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(userId);
    res.json(addrs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/addresses', (req, res) => {
  try {
    const userId = req.body.userId || 2;
    const { full_name, address_line1, address_line2, city, state, postal_code, country, phone } = req.body;
    const info = db.prepare(`
      INSERT INTO addresses (user_id, full_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(userId, full_name, address_line1, address_line2, city, state, postal_code, country, phone);
    res.json({ message: 'Address added', id: Number(info.lastInsertRowid) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Coupons
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code) as any;
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }
    if (subtotal < coupon.min_purchase) {
      return res.status(400).json({ error: `Minimum purchase of $${coupon.min_purchase} required for this coupon` });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    res.json({ valid: true, discount: Math.min(discount, subtotal), code: coupon.code, type: coupon.discount_type, value: coupon.discount_value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Orders & Checkout
app.post('/api/orders', (req, res) => {
  try {
    const { userId = 2, addressId, paymentMethod = 'Credit Card', couponCode } = req.body;
    
    // Get cart items
    const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId) as any;
    if (!cart) return res.status(400).json({ error: 'Cart not found' });

    const items = db.prepare(`
      SELECT ci.product_id, ci.quantity, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `).all(cart.id) as any[];

    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal > 100 ? 0 : 9.99;
    
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(couponCode) as any;
      if (coupon && subtotal >= coupon.min_purchase) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
        } else {
          discountAmount = coupon.discount_value;
        }
      }
    }

    const finalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
    const orderNumber = 'PC-' + Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = 'TRK-' + Math.floor(10000000 + Math.random() * 90000000);

    const orderRes = db.prepare(`
      INSERT INTO orders (user_id, order_number, total_amount, shipping_fee, discount_amount, final_amount, status, shipping_address_id, payment_method, payment_status, tracking_number)
      VALUES (?, ?, ?, ?, ?, ?, 'Processing', ?, ?, 'Paid', ?)
    `).run(userId, orderNumber, subtotal, shippingFee, discountAmount, finalAmount, addressId || null, paymentMethod, trackingNumber);

    const orderId = Number(orderRes.lastInsertRowid);

    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    for (const item of items) {
      insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
      // Reduce inventory
      db.prepare('UPDATE inventory SET stock_quantity = MAX(0, stock_quantity - ?) WHERE product_id = ?').run(item.quantity, item.product_id);
    }

    // Record payment
    db.prepare('INSERT INTO payments (order_id, transaction_id, payment_gateway, amount, status) VALUES (?, ?, ?, ?, ?)').run(
      orderId, 'TXN-' + Math.floor(100000 + Math.random() * 900000), 'Sandbox', finalAmount, 'Completed'
    );

    // Clear cart
    db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);

    res.json({ message: 'Order placed successfully', orderId, orderNumber, finalAmount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 2;
    const orders = db.prepare(`
      SELECT o.*, a.full_name, a.address_line1, a.city, a.state
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(userId);

    const ordersWithItems = orders.map((ord: any) => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.slug,
               (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(ord.id);
      return { ...ord, items };
    });

    res.json(ordersWithItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare(`
      SELECT o.*, a.*
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.id = ? OR o.order_number = ?
    `).get(id, id) as any;

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = db.prepare(`
      SELECT oi.*, p.name, p.slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Reviews
app.post('/api/products/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 2, rating, comment } = req.body;
    db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(id, userId, rating, comment);
    
    // Recalculate average rating
    const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?').get(id) as any;
    db.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?').run(Number(stats.avg_rating.toFixed(1)), stats.count, id);

    res.json({ message: 'Review added successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Admin Endpoints
app.get('/api/admin/stats', (req, res) => {
  try {
    const usersCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const productsCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c;
    const ordersCount = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
    const revenueRes = db.prepare('SELECT SUM(final_amount) as rev FROM orders WHERE payment_status = "Paid"').get() as any;
    const revenue = revenueRes?.rev || 0;

    const recentOrders = db.prepare(`
      SELECT o.*, u.name as user_name 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `).all();

    res.json({
      usersCount,
      productsCount,
      ordersCount,
      revenue,
      recentOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, i.stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      ORDER BY p.id DESC
    `).all();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', (req, res) => {
  try {
    const { category_id, name, slug, description, price, original_price, discount_percentage, brand, stock_quantity, image_url } = req.body;
    const resProd = db.prepare(`
      INSERT INTO products (category_id, name, slug, description, price, original_price, discount_percentage, brand, stock_status, is_new)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'In Stock', 1)
    `).run(category_id || 1, name, slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description, price, original_price || price, discount_percentage || 0, brand || 'PurpleCart');

    const prodId = Number(resProd.lastInsertRowid);
    if (image_url) {
      db.prepare('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)').run(prodId, image_url);
    }
    db.prepare('INSERT INTO inventory (product_id, stock_quantity) VALUES (?, ?)').run(prodId, stock_quantity || 50);

    res.json({ message: 'Product created successfully', productId: prodId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, original_price, discount_percentage, brand, stock_quantity } = req.body;
    db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, original_price = ?, discount_percentage = ?, brand = ?
      WHERE id = ?
    `).run(name, description, price, original_price, discount_percentage, brand, id);

    if (stock_quantity !== undefined) {
      db.prepare('UPDATE inventory SET stock_quantity = ? WHERE product_id = ?').run(stock_quantity, id);
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: 'Order status updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`PurpleCart server running on http://localhost:${port}`);
  });
}

startServer();
