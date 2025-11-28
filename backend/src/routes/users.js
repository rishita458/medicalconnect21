const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.use(auth);

// GET /users - allow filtering by role for authenticated users, full list for admins only
// This route MUST come before /:id to avoid route matching issues
router.get('/', async (req, res) => {
  try {
    console.log('[Users GET] Request received - Query:', req.query, 'User:', req.user?.role);
    const query = {};
    
    // If role filter is provided, allow any authenticated user to filter by role
    if (req.query.role) {
      query.role = req.query.role;
      console.log('[Users] Filtering by role:', req.query.role, 'Requesting user role:', req.user.role);
    } else if (req.user.role !== 'admin') {
      // Only admins can see all users without a role filter
      console.log('[Users] No role filter provided and user is not admin');
      return res.status(403).json({ message: 'Forbidden: role filter required' });
    }
    
    const users = await User.find(query).select('-password');
    console.log('[Users] Found', users.length, 'users matching query:', query);
    res.json(users);
  } catch (err) {
    console.error('[Users] Error fetching users:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin-only routes for individual user management
router.get('/:id', requireRole('admin'), async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

router.patch('/:id', requireRole('admin'), [
  body('name').optional().isLength({ min: 2 }),
  body('role').optional().isIn(['patient','doctor','pharmacist','admin'])
], async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
