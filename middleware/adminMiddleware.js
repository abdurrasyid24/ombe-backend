const adminMiddleware = (req, res, next) => {
  // Check if user is admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      status: 403
    });
  }

  next();
};

module.exports = adminMiddleware;
