import jwt from "jsonwebtoken"

export const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, process.env.SecretKey, options)
}

export const verifyToken = (req, res, next) => {
  try {

    const token = req.headers['authorization']?.split(" ")[1]; // פורמט "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.SecretKey);

    // שמירת פרטי המשתמש ב-request
    req.user = {
      email: decoded.email,
      name: decoded.fullName,
      userName: decoded.userName,
      description: decoded.description
    };

    next(); // ממשיכים לראוטר הבא
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
