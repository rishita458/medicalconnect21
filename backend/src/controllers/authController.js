const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Improved signup with JWT
async function signup(req, res) {
  const { name, email, password, role, specialty, pharmacyName, adminSecret } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required' });
  }

  const allowedRoles = ['patient', 'doctor', 'pharmacist', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'invalid role' });
  }

  // Protect admin creation with a secret
  if (role === 'admin') {
    if (!process.env.ADMIN_SECRET) {
      return res.status(500).json({ message: 'admin signup not configured on server' });
    }
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'invalid admin secret' });
    }
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role
    };

    // Role-specific small profile fields (non-mandatory)
    if (role === 'doctor') {
      userData.profile = Object.assign({}, userData.profile, { specialty: specialty || '' });
    } else if (role === 'pharmacist') {
      userData.profile = Object.assign({}, userData.profile, { pharmacyName: pharmacyName || '' });
    }

    const user = await new User(userData).save();

    // Generate JWT token after successful signup
    const token = generateToken(user);

    // Return user info with token
    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('[auth.signup] error:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// Add login functionality
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('[auth.login] error:', err);
    return res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

module.exports = { signup, login };
