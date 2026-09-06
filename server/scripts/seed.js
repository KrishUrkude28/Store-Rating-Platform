const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  console.log('Seeding RateStore PostgreSQL database...');
  await db.initDb();

  // Clear existing data to allow fresh deterministic seeding
  await db.query('DELETE FROM ratings');
  await db.query('DELETE FROM stores');
  await db.query('DELETE FROM users');

  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const ownerHash = await bcrypt.hash('Owner@123456', 10);
  const userHash = await bcrypt.hash('User@123456', 10);

  // 1. Insert System Administrator (Priya Sharma)
  const adminRes = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role`,
    [
      'Priya Sharma System Admin',
      'admin@storerating.com',
      adminHash,
      'Corporate Headquarters Suite 400, Embassy TechVillage, Outer Ring Road, Bengaluru, KA',
      'ADMIN'
    ]
  );
  console.log('Created Admin:', adminRes.rows[0].email);

  // 2. Insert Store Owners
  // Rohan Mehta (FreshMart Owner)
  const owner1 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Rohan Mehta Store Owner',
      'alex.owner@freshmart.com',
      ownerHash,
      'Plot 42, Palm Meadows Boulevard, Whitefield, Bengaluru, Karnataka',
      'STORE_OWNER'
    ]
  );

  // Vikramaditya (Brew House Owner)
  const owner2 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Vikramaditya Singhania',
      'vikram.owner@brewhouse.com',
      ownerHash,
      '100 Feet Road, 12th Main, Indiranagar, Bengaluru, Karnataka',
      'STORE_OWNER'
    ]
  );

  // Maria (TechWorld Owner)
  const owner3 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Maria Elena Hernandez',
      'maria.owner@techworld.com',
      ownerHash,
      '7th Block, Sony World Junction, Koramangala, Bengaluru, Karnataka',
      'STORE_OWNER'
    ]
  );

  console.log('Created 3 Store Owners.');

  // 3. Insert Stores matching the 8 Store Cards in Image 2 & 3
  const storesData = [
    {
      name: 'FreshMart',
      email: 'freshmart@store.com',
      address: 'MG Road, Bengaluru, KA',
      category: 'Grocery',
      owner_id: owner1.rows[0].id
    },
    {
      name: 'The Brew House',
      email: 'contact@thebrewhouse.com',
      address: 'Indiranagar, Bengaluru, KA',
      category: 'Cafe',
      owner_id: owner2.rows[0].id
    },
    {
      name: 'TechWorld',
      email: 'support@techworld.com',
      address: 'Koramangala, Bengaluru, KA',
      category: 'Electronics',
      owner_id: owner3.rows[0].id
    },
    {
      name: 'StyleHub',
      email: 'info@stylehubfashion.com',
      address: 'Phoenix Mall, Bengaluru, KA',
      category: 'Fashion',
      owner_id: owner1.rows[0].id
    },
    {
      name: 'HealthPlus',
      email: 'care@healthpluspharma.com',
      address: 'HSR Layout, Bengaluru, KA',
      category: 'Pharmacy',
      owner_id: owner2.rows[0].id
    },
    {
      name: 'HomeEssentials',
      email: 'service@homeessentials.com',
      address: 'Marathahalli, Bengaluru, KA',
      category: 'Home & Living',
      owner_id: owner3.rows[0].id
    },
    {
      name: 'The Cake Studio',
      email: 'bakes@thecakestudio.com',
      address: 'Whitefield, Bengaluru, KA',
      category: 'Bakery',
      owner_id: owner1.rows[0].id
    },
    {
      name: 'Spice Villa',
      email: 'dine@spicevilladining.com',
      address: 'JP Nagar, Bengaluru, KA',
      category: 'Restaurant',
      owner_id: owner2.rows[0].id
    },
    {
      name: 'Artisan Gourmet Market',
      email: 'artisan@gourmetmarket.com',
      address: 'Linking Road, Bandra West, Mumbai, Maharashtra',
      category: 'Grocery',
      owner_id: owner3.rows[0].id
    }
  ];

  const storeMap = {};
  for (const s of storesData) {
    const res = await db.query(
      `INSERT INTO stores (name, email, address, category, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name`,
      [s.name, s.email, s.address, s.category, s.owner_id]
    );
    storeMap[s.name] = res.rows[0].id;
  }
  console.log('Created 8 RateStore showcase stores.');

  // 4. Insert Normal Users
  const user1 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Ananya Verma Normal User',
      'chris.evans@example.com',
      userHash,
      'Flat 302, Palm Grove Apartments, Indiranagar, Bengaluru, KA',
      'USER'
    ]
  );

  const user2 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Aarav Mehta Reviewer One',
      'aarav.mehta@example.com',
      userHash,
      'Villa 14, Sunrise Residency, Whitefield, Bengaluru, KA',
      'USER'
    ]
  );

  const user3 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Sneha Kapoor Reviewer Two',
      'sneha.kapoor@example.com',
      userHash,
      'Quarter 18, Civil Lines, Koramangala, Bengaluru, KA',
      'USER'
    ]
  );

  const user4 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Karan Shah Customer User',
      'karan.shah@example.com',
      userHash,
      'Sector 3, HSR Layout, Bengaluru, KA',
      'USER'
    ]
  );

  const user5 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Priya Iyer Customer User',
      'priya.iyer@example.com',
      userHash,
      'Phase 2, JP Nagar, Bengaluru, KA',
      'USER'
    ]
  );

  const user6 = await db.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [
      'Aditya Nair Customer User',
      'aditya.nair@example.com',
      userHash,
      'Green Glen Layout, Bellandur, Bengaluru, KA',
      'USER'
    ]
  );
  console.log('Created Normal Users.');

  // 5. Insert Ratings with authentic reviews from the screenshots
  const ratings = [
    // FreshMart ratings (average 4.8 / 5)
    { user: user1.rows[0].id, store: storeMap['FreshMart'], rating: 5, review: 'Amazing experience! Very helpful staff and clean store.' },
    { user: user2.rows[0].id, store: storeMap['FreshMart'], rating: 5, review: 'Great products, friendly staff and excellent service!' },
    { user: user3.rows[0].id, store: storeMap['FreshMart'], rating: 4, review: 'Good collection and reasonable prices.' },
    { user: user4.rows[0].id, store: storeMap['FreshMart'], rating: 5, review: 'Always a pleasant experience. Highly recommended!' },
    { user: user5.rows[0].id, store: storeMap['FreshMart'], rating: 4, review: 'Well organized store with fresh products.' },
    { user: user6.rows[0].id, store: storeMap['FreshMart'], rating: 5, review: 'Best grocery store in the area. Keep it up!' },

    // TechWorld (average ~4.3)
    { user: user1.rows[0].id, store: storeMap['TechWorld'], rating: 4, review: 'Great selection of electronics and gadgets.' },
    { user: user2.rows[0].id, store: storeMap['TechWorld'], rating: 4, review: 'Helpful tech consultants. Smooth checkout.' },
    { user: user3.rows[0].id, store: storeMap['TechWorld'], rating: 3, review: 'Products are good, but waiting time was long.' },

    // The Brew House (average ~4.5)
    { user: user2.rows[0].id, store: storeMap['The Brew House'], rating: 5, review: 'The pour-over coffee and ambience are phenomenal.' },
    { user: user3.rows[0].id, store: storeMap['The Brew House'], rating: 4, review: 'Cozy place to work with fast Wi-Fi and good brew.' },

    // StyleHub (average ~4.6)
    { user: user3.rows[0].id, store: storeMap['StyleHub'], rating: 5, review: 'Trendy seasonal collection with good discounts.' },
    { user: user4.rows[0].id, store: storeMap['StyleHub'], rating: 4, review: 'Spacious store and helpful trial room staff.' },

    // The Cake Studio (average ~4.7)
    { user: user1.rows[0].id, store: storeMap['The Cake Studio'], rating: 4, review: 'Custom cakes are top notch and delicious.' },
    { user: user5.rows[0].id, store: storeMap['The Cake Studio'], rating: 5, review: 'Fresh artisan pastries every morning.' },

    // HealthPlus (average ~4.2)
    { user: user1.rows[0].id, store: storeMap['HealthPlus'], rating: 3, review: 'Prompt pharmacy service and genuine medicines.' },
    { user: user6.rows[0].id, store: storeMap['HealthPlus'], rating: 5, review: 'Open late and very courteous pharmacists.' },

    // HomeEssentials (average ~4.1)
    { user: user4.rows[0].id, store: storeMap['HomeEssentials'], rating: 4, review: 'Everything you need for kitchen and home decor.' },

    // Spice Villa (average ~4.0)
    { user: user5.rows[0].id, store: storeMap['Spice Villa'], rating: 4, review: 'Authentic Indian flavors and excellent hospitality.' }
  ];

  for (const r of ratings) {
    await db.query(
      `INSERT INTO ratings (user_id, store_id, rating, review)
       VALUES ($1, $2, $3, $4)`,
      [r.user, r.store, r.rating, r.review]
    );
  }

  console.log(`Inserted ${ratings.length} authentic customer ratings.`);
  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
