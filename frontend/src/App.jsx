import { useEffect, useState, useCallback } from "react";
import { addVideo, getVideos, getViews } from "./api"; 
import { socket } from "./socket";
import VideoCard from "./components/VideoCard";
import "./index.css"; // Fixed: Using your actual CSS file

export default function App() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [data, setData] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("admin_secret"));

  // --- IST TIME FORMATTING (Manual Offset Fix) ---
  const formatToIST = (utcTime) => {
    if (!utcTime) return "---";
    try {
      const t = utcTime.split(/[- :T.Z]/);
      const d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
      return d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return utcTime;
    }
  };

  // --- DATA FETCHING ---
  const loadVideos = useCallback(async () => {
    try {
      const res = await getVideos();
      setVideos(res.data);
      for (const v of res.data) {
        const d = await getViews(v.videoId);
        setData(prev => ({ ...prev, [v.videoId]: d.data }));
      }
    } catch (err) {
      console.error("Error loading videos:", err);
    }
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    loadVideos();

    // 60-second ticking timer logic
    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    // Hidden Shortcut: Alt + L to login
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        const password = prompt("Enter Admin Password:");
        if (password) {
          localStorage.setItem("admin_secret", password);
          setIsAdmin(true);
          window.location.reload();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Socket listener for real-time updates
    function handleUpdate(update) {
      setData(prev => ({
        ...prev,
        [update.videoId]: [...(prev[update.videoId] || []), update]
      }));
      setTimeLeft(60); // Reset timer when update hits
    }
    
    socket.on("viewUpdate", handleUpdate);
    
    return () => {
      clearInterval(countdown);
      window.removeEventListener("keydown", handleKeyDown);
      socket.off("viewUpdate", handleUpdate);
    };
  }, [loadVideos]);

  // --- ACTIONS ---
  async function track(e) {
    if (e) e.preventDefault();
    if (!url.trim()) return;
    try {
      await addVideo(url);
      setUrl("");
      loadVideos();
    } catch (err) {
      alert("Unauthorized action.");
    }
  }

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>YouTube View Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor real-time view growth natively via API.</p>
        
        {/* Countdown Timer Badge */}
        <div style={{ 
          marginTop: '15px', 
          fontSize: '0.85rem', 
          background: 'rgba(99, 102, 241, 0.1)', 
          display: 'inline-block', 
          padding: '6px 14px', 
          borderRadius: '50px',
          color: '#6366f1',
          fontWeight: 'bold',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          ⏱ Next Refresh: {timeLeft}s
        </div>
      </div>

      {isAdmin && (
        <form className="input-group" onSubmit={track}>
          <input
            value={url}
            placeholder="Paste YouTube URL..."
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" className="btn-primary">Track Video</button>
          <button 
            type="button" 
            onClick={() => { localStorage.removeItem("admin_secret"); window.location.reload(); }} 
            className="btn-sm" 
            style={{marginLeft: '10px', background: '#ccc', border: 'none', cursor: 'pointer', borderRadius: '4px', padding: '5px 10px'}}
          >
            Logout
          </button>
        </form>
      )}

      <div className="video-grid">
        {videos.map(v => (
          <VideoCard
            key={v.videoId}
            video={v}
            data={data[v.videoId] || []}
            refresh={loadVideos}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}