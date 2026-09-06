const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'store-rating-jwt-secret-key-2026';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }

    const result = await db.query(
      'SELECT id, name, email, role, address, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User associated with token no longer exists.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

module.exports = {
  authenticate,
  JWT_SECRET
};
