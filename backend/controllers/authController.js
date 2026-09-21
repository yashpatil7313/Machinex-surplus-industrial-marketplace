const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Register a new user (buyer or seller)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, company_name, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const assignedRole = role === 'seller' ? 'seller' : 'buyer';

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, phone, role, company_name, location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        phone || null,
        assignedRole,
        company_name || null,
        location || null
      ]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      {
        id: userId,
        email: email.toLowerCase().trim(),
        role: assignedRole,
        name: name.trim(),
        company_name: company_name || null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        role: assignedRole,
        company_name: company_name || null,
        location: location || null
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        company_name: user.company_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        company_name: user.company_name,
        location: user.location,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, role, company_name, location, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, company_name, location } = req.body;
    await db.query(
      'UPDATE users SET name = ?, phone = ?, company_name = ?, location = ? WHERE id = ?',
      [name, phone, company_name, location, req.user.id]
    );

    const [rows] = await db.query('SELECT id, name, email, phone, role, company_name, location, created_at FROM users WHERE id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Profile updated successfully.', user: rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let sql = 'SELECT id, name, email, phone, role, company_name, location, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR company_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id DESC';
    const [users] = await db.query(sql, params);
    return res.json({ success: true, users });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};
