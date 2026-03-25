const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "vizsga_secret";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Nincs token" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Érvénytelen token" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // a tokenben { id: user.id }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Érvénytelen vagy lejárt token" });
  }
};