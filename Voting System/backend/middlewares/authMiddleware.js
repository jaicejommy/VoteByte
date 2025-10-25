const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-with-secure-secret';

async function authMiddleware(req, res, next) {
  try {
    let token = null;
    // prefer cookie
    if (req.cookies && req.cookies.token) token = req.cookies.token;
    // fallback to Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
    }

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await authService.getUserById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
