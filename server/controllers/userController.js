const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Create user by Administrator (ADMIN-002)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: 'Email is already registered.',
        errors: { email: 'Email is already registered.' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, address, created_at`,
      [name.trim(), normalizedEmail, hashedPassword, address.trim(), role]
    );

    return res.status(201).json({
      message: 'User created successfully.',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Internal server error while creating user.' });
  }
};

// Get users with filtering & sorting (ADMIN-003, ADMIN-004, ADMIN-005)
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const conditions = [];
    const params = [];

    if (name && name.trim()) {
      params.push(`%${name.trim().toLowerCase()}%`);
      conditions.push(`LOWER(name) LIKE $${params.length}`);
    }

    if (email && email.trim()) {
      params.push(`%${email.trim().toLowerCase()}%`);
      conditions.push(`LOWER(email) LIKE $${params.length}`);
    }

    if (address && address.trim()) {
      params.push(`%${address.trim().toLowerCase()}%`);
      conditions.push(`LOWER(address) LIKE $${params.length}`);
    }

    if (role && role.trim()) {
      params.push(role.trim().toUpperCase());
      conditions.push(`role = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortFields = {
      name: 'name',
      email: 'email',
      address: 'address',
      role: 'role',
      created_at: 'created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const sql = `
      SELECT id, name, email, address, role, created_at
      FROM users
      ${whereClause}
      ORDER BY ${sortColumn} ${direction}
    `;

    const result = await db.query(sql, params);
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Internal server error while retrieving users.' });
  }
};

// Get single user details (ADMIN-006)
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userResult.rows[0];

    // If role is STORE_OWNER, fetch their stores and average store rating
    if (user.role === 'STORE_OWNER') {
      const storeResult = await db.query(
        `SELECT s.id, s.name, s.email, s.address,
                ROUND(AVG(r.rating)::numeric, 1) as average_rating,
                COUNT(r.id)::int as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id, s.name, s.email, s.address`,
        [user.id]
      );

      user.stores = storeResult.rows.map(s => ({
        ...s,
        average_rating: s.average_rating !== null ? Number(s.average_rating) : null
      }));
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Get user details error:', err);
    return res.status(500).json({ message: 'Internal server error while retrieving user details.' });
  }
};

// Get eligible store owners for store creation dropdown
const getStoreOwners = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE role = 'STORE_OWNER' ORDER BY name ASC"
    );
    return res.status(200).json({ owners: result.rows });
  } catch (err) {
    console.error('Get store owners error:', err);
    return res.status(500).json({ message: 'Internal server error while retrieving store owners.' });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserDetails,
  getStoreOwners
};
