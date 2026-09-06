const db = require('../config/db');

// Create a new store (ADMIN-007)
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Verify owner exists and has STORE_OWNER role
    const ownerResult = await db.query(
      "SELECT id, role FROM users WHERE id = $1",
      [owner_id]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(400).json({
        message: 'Assigned store owner does not exist.',
        errors: { owner_id: 'User not found.' }
      });
    }

    if (ownerResult.rows[0].role !== 'STORE_OWNER') {
      return res.status(400).json({
        message: 'Assigned user is not a Store Owner.',
        errors: { owner_id: 'Selected user must have the STORE_OWNER role.' }
      });
    }

    const result = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name.trim(), normalizedEmail, address.trim(), owner_id]
    );

    return res.status(201).json({
      message: 'Store created successfully.',
      store: result.rows[0]
    });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ message: 'Internal server error while creating store.' });
  }
};

// Get stores with filtering, sorting, overall rating, and user's rating (ADMIN-008, 009, 010 & USER-001, 002)
const getStores = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      search, // generic search for normal user (matches name OR address)
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;

    const conditions = [];
    const params = [];

    if (name && name.trim()) {
      params.push(`%${name.trim().toLowerCase()}%`);
      conditions.push(`LOWER(s.name) LIKE $${params.length}`);
    }

    if (email && email.trim()) {
      params.push(`%${email.trim().toLowerCase()}%`);
      conditions.push(`LOWER(s.email) LIKE $${params.length}`);
    }

    if (address && address.trim()) {
      params.push(`%${address.trim().toLowerCase()}%`);
      conditions.push(`LOWER(s.address) LIKE $${params.length}`);
    }

    // Normal User Store Search (USER-002: search partial match by name OR address)
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      conditions.push(`(LOWER(s.name) LIKE $${pIdx} OR LOWER(s.address) LIKE $${pIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'average_rating',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Build query with left join on ratings to calculate average and user's rating
    let userRatingSelect = 'NULL as user_rating, NULL as user_rating_id';
    let userRatingJoin = '';

    if (currentUserId) {
      params.push(currentUserId);
      const userParamIdx = params.length;
      userRatingSelect = `ur.rating as user_rating, ur.id as user_rating_id`;
      userRatingJoin = `LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $${userParamIdx}`;
    }

    const sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.category,
        s.image_url,
        s.owner_id,
        u.name as owner_name,
        s.created_at,
        ROUND(AVG(r.rating)::numeric, 1) as average_rating,
        COUNT(r.id)::int as total_ratings,
        ${userRatingSelect}
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${userRatingJoin}
      ${whereClause}
      GROUP BY s.id, s.name, s.email, s.address, s.category, s.image_url, s.owner_id, u.name, s.created_at${currentUserId ? ', ur.rating, ur.id' : ''}
      ORDER BY ${sortColumn} ${direction}
    `;

    const result = await db.query(sql, params);

    const stores = result.rows.map(row => ({
      ...row,
      category: row.category || 'General',
      image_url: row.image_url || null,
      average_rating: row.average_rating !== null ? Number(row.average_rating) : null,
      user_rating: row.user_rating !== null ? Number(row.user_rating) : null
    }));

    return res.status(200).json({ stores });
  } catch (err) {
    console.error('Get stores error:', err);
    return res.status(500).json({ message: 'Internal server error while retrieving stores.' });
  }
};

// Get single store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    let userRatingSelect = 'NULL as user_rating, NULL as user_rating_id';
    let userRatingJoin = '';
    const params = [id];

    if (currentUserId) {
      params.push(currentUserId);
      userRatingSelect = `ur.rating as user_rating, ur.id as user_rating_id`;
      userRatingJoin = `LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $2`;
    }

    const sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.category,
        s.image_url,
        s.owner_id,
        u.name as owner_name,
        s.created_at,
        ROUND(AVG(r.rating)::numeric, 1) as average_rating,
        COUNT(r.id)::int as total_ratings,
        ${userRatingSelect}
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${userRatingJoin}
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.category, s.image_url, s.owner_id, u.name, s.created_at${currentUserId ? ', ur.rating, ur.id' : ''}
    `;

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const store = {
      ...result.rows[0],
      average_rating: result.rows[0].average_rating !== null ? Number(result.rows[0].average_rating) : null,
      user_rating: result.rows[0].user_rating !== null ? Number(result.rows[0].user_rating) : null
    };

    return res.status(200).json({ store });
  } catch (err) {
    console.error('Get store by ID error:', err);
    return res.status(500).json({ message: 'Internal server error while retrieving store.' });
  }
};

module.exports = {
  createStore,
  getStores,
  getStoreById
};
