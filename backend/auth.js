import dotenv from "dotenv";
dotenv.config();

export const verifyAdmin = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (secret === process.env.ADMIN_SECRET_KEY) {
    next(); // Pass: You are the admin
  } else {
    res.status(403).json({ error: "Unauthorized: Read-only access." });
  }
};