const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No valid token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract the token

  jwt.verify(token, "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
};
