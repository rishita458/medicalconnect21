function requireAuth(req, res, next) {
  // Simple auth guard: expects req.user to be set by your auth middleware (JWT/session)
  if (!req.user) {
    console.warn('[auth] request blocked - no req.user. Path:', req.path);
    return res.status(401).json({
      message: 'Authentication required',
      hint: 'Ensure this route is not protected for public endpoints (e.g. signup).'
    });
  }
  next();
}

function requireRole(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  // if no roles provided, behave as requireAuth
  return (req, res, next) => {
    if (!req.user) {
      console.warn('[auth] requireRole blocked - no req.user. Path:', req.path, 'Expected roles:', roles);
      return res.status(401).json({
        message: 'Authentication required',
        hint: 'If this is signup, do not attach role/authorization middleware to the route.'
      });
    }
    if (roles.length === 0) return next();
    if (!roles.includes(req.user.role)) {
      console.warn('[auth] forbidden - user role not allowed:', req.user.role, 'Expected:', roles);
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
