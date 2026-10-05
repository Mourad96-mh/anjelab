import jwt from "jsonwebtoken";

// JWT in an `Authorization: Bearer <token>` header, not a cookie: the website
// and the API live on two different origins, and third-party cookies are
// blocked by default in modern browsers. The dashboard keeps the token in
// localStorage.

export function signToken(admin) {
  return jwt.sign({ sub: String(admin._id), email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "12h",
  });
}

function readToken(req) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}

export default function auth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Authentification requise." });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    return res.status(401).json({
      message: expired ? "Session expirée, reconnectez-vous." : "Jeton invalide.",
      expired,
    });
  }
}

// Same check, but never blocks: public routes use it to show drafts to a
// logged-in admin and only published items to everyone else.
export function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.admin = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.admin = null;
    }
  }
  next();
}
