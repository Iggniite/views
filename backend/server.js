import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import db from "./db.js";
import { startTracker } from "./tracker.js";
import { getViews } from "./youtube.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ADMIN MIDDLEWARE ---
const verifyAdmin = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  // This matches the key in your .env file
  if (secret && secret === process.env.ADMIN_SECRET_KEY) {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized: Access Denied" });
  }
};

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

startTracker(io);

function extractVideoId(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match && match[1] ? match[1] : url;
}

// PUBLIC: Anyone can view
app.get("/videos", (req, res) => {
  db.all("SELECT * FROM videos", (err, rows) => res.json(rows));
});

app.get("/views/:videoId", (req, res) => {
  db.all("SELECT * FROM views WHERE videoId=?", [req.params.videoId], (err, rows) => res.json(rows));
});

// PROTECTED: Requires Admin Secret
app.post("/track", verifyAdmin, async (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: "Missing URL" });
  const videoId = extractVideoId(url);
  const data = await getViews(videoId);
  if (!data) return res.status(404).json({ error: "Video not accessible" });

  db.run(
    "INSERT OR IGNORE INTO videos(videoId, title, thumbnail, status) VALUES(?, ?, ?, 'active')",
    [videoId, data.title, data.thumbnail]
  );
  res.json({ message: "tracking started" });
});

app.delete("/video/:videoId", verifyAdmin, (req, res) => {
  const id = decodeURIComponent(req.params.videoId);
  db.serialize(() => {
    db.run("DELETE FROM views WHERE videoId=?", [id]);
    db.run("DELETE FROM videos WHERE videoId=?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete" });
      res.json({ message: "Video removed" });
    });
  });
});

app.put("/video/:videoId/pause", verifyAdmin, (req, res) => {
  const id = decodeURIComponent(req.params.videoId);
  db.run("UPDATE videos SET status = 'paused' WHERE videoId = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to pause" });
    res.json({ message: "Video paused" });
  });
});

app.put("/video/:videoId/resume", verifyAdmin, (req, res) => {
  const id = decodeURIComponent(req.params.videoId);
  db.run("UPDATE videos SET status = 'active' WHERE videoId = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to resume" });
    res.json({ message: "Video resumed" });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on", PORT));