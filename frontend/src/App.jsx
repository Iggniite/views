import { useEffect, useState, useCallback } from "react";
import { addVideo, getVideos, getViews } from "./api";
import { socket } from "./socket";
import VideoCard from "./components/VideoCard";

export default function App() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [data, setData] = useState({});
  
  // Initialize from storage
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("admin_secret"));

  const loadVideos = useCallback(async () => {
    try {
      // getVideos will use the secret from localStorage automatically inside api.js
      const res = await getVideos();
      setVideos(res.data);
      for (const v of res.data) {
        const d = await getViews(v.videoId);
        setData(prev => ({ ...prev, [v.videoId]: d.data }));
      }
    } catch (err) {
      // If the saved token is wrong/expired, log out automatically
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("admin_secret");
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    loadVideos();

    const handleKeyDown = async (e) => {
      // Trigger on Alt + L
      if (e.altKey && e.key.toLowerCase() === 'l') {
        const password = prompt("Enter Admin Password:");
        if (!password) return;

        try {
          // 1. Temporarily store to test the request
          localStorage.setItem("admin_secret", password); 
          
          // 2. Try to fetch videos. If password is wrong, this THROWS an error
          const check = await getVideos();
          
          if (check.status === 200) {
            // 3. ONLY if successful, update the UI state
            setIsAdmin(true);
            alert("Access Granted");
            window.location.reload();
          }
        } catch (err) {
          // 4. If wrong password (401/403), the code jumps here
          localStorage.removeItem("admin_secret"); // Wipe the wrong password
          setIsAdmin(false); // Keep buttons hidden
          alert("Wrong Password. Access Denied.");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    function handleUpdate(update) {
      setData(prev => ({
        ...prev,
        [update.videoId]: [...(prev[update.videoId] || []), update]
      }))
    }
    socket.on("viewUpdate", handleUpdate);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      socket.off("viewUpdate", handleUpdate);
    };
  }, [loadVideos]);

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
      </div>

      {/* Buttons ONLY appear if isAdmin is strictly true */}
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
            style={{marginLeft: '10px', background: '#ccc', cursor: 'pointer', border: 'none', padding: '5px 10px', borderRadius: '4px'}}
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