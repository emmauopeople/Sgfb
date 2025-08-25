export default function authToken(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token || token !== process.env.MOBILE_API_TOKEN) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
