const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // In production, use environment variable

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

module.exports = { JWT_SECRET, authenticateToken }; 