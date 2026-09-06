const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Unified Login for all roles (AUTH-001)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// User Registration with Role Preference (AUTH-002)
const register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check unique email
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = (role === 'STORE_OWNER' || role === 'ADMIN') ? role : 'USER';

    const result = await db.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, address, created_at`,
      [name.trim(), normalizedEmail, hashedPassword, address.trim(), assignedRole]
    );

    const newUser = result.rows[0];
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.message && err.message.includes('unique')) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

// Change Password (AUTH-003)
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const storedHash = userResult.rows[0].password;
    const isMatch = await bcrypt.compare(currentPassword, storedHash);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect.',
        errors: { currentPassword: 'The current password you entered is incorrect.' }
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHashedPassword, userId]
    );

    return res.status(200).json({ message: 'Password has been updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Internal server error while changing password.' });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      address: req.user.address,
      role: req.user.role,
      createdAt: req.user.created_at
    }
  });
};

// Logout (AUTH-004)
const logout = async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = {
  login,
  register,
  changePassword,
  getMe,
  logout
};
