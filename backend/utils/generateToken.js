const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token containing user id and role
 * @param {string} id - User ID
 * @param {string} role - User Role (requester, agent, admin)
 * @returns {string} - Signed JWT token string
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecrethelpdeskjwtkey_2026_safe_and_secure',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
