const app = require('../server/server');
const db = require('../server/config/db');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await db.initDb();
      const userCount = await db.query('SELECT COUNT(id)::int as count FROM users');
      if (userCount.rows[0].count === 0) {
        console.log('Database empty. Seeding initial dataset...');
        const seed = require('../server/scripts/seed');
        await seed();
      }
      isInitialized = true;
    } catch (err) {
      console.error('Database initialization warning:', err.message);
    }
  }
  return app(req, res);
};
