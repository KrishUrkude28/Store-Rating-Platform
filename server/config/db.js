const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let dbClient = null;
let isPgPool = false;

async function getClient() {
  if (dbClient) return dbClient;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: databaseUrl });
      // Test connection
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL via DATABASE_URL');
      dbClient = pool;
      isPgPool = true;
      return dbClient;
    } catch (err) {
      console.warn('Could not connect to external PostgreSQL with DATABASE_URL:', err.message);
      console.log('Falling back to integrated PostgreSQL (PGlite)...');
    }
  }

  // Use embedded PGlite (official PostgreSQL engine in WASM with persistent disk storage)
  const { PGlite } = require('@electric-sql/pglite');
  const dataDir = process.env.PGDATA_PATH || path.join(__dirname, '../../pgdata');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`Initializing integrated PostgreSQL database at: ${dataDir}`);
  try {
    const pglite = new PGlite(dataDir);
    await pglite.query('SELECT 1');
    dbClient = pglite;
    isPgPool = false;
    return dbClient;
  } catch (err) {
    console.warn(`PostgreSQL local storage could not be opened cleanly (${err.message}). Auto-recovering clean state...`);
    try {
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
      console.error('Failed to clean data directory:', e);
    }
    const pglite = new PGlite(dataDir);
    await pglite.query('SELECT 1');
    dbClient = pglite;
    isPgPool = false;
    return dbClient;
  }
}

async function closeDb() {
  if (dbClient && !isPgPool && typeof dbClient.close === 'function') {
    try {
      await dbClient.close();
      console.log('PostgreSQL database cleanly closed.');
    } catch (e) {
      // ignore
    }
  }
}

async function query(text, params = []) {
  const client = await getClient();
  if (isPgPool) {
    const res = await client.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.rowCount || 0
    };
  } else {
    // PGlite query
    const res = await client.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.affectedRows !== undefined ? res.affectedRows : (res.rows ? res.rows.length : 0)
    };
  }
}

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying PostgreSQL database schema...');
  // Strip comments first, then split on semicolon
  const cleanSql = schemaSql.replace(/--.*$/gm, '');
  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      await query(stmt);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.error('Schema initialization statement error:', err.message, '\nStatement:', stmt);
        throw err;
      }
    }
  }
  console.log('PostgreSQL database schema initialized successfully.');
}

module.exports = {
  query,
  initDb,
  getClient,
  closeDb
};
