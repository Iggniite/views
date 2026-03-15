import { useEffect, useState } from "react";
import { addVideo, getVideos, getViews } from "./api";
import { socket } from "./socket";
import VideoCard from "./components/VideoCard";

export default function App() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [data, setData] = useState({});

  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("admin_secret"));

  async function loadVideos() {
    const res = await getVideos();
    setVideos(res.data);

    for (const v of res.data) {
      const d = await getViews(v.videoId);
      setData(prev => ({ ...prev, [v.videoId]: d.data }));
    }
  }

  // 🔐 VERIFY ADMIN PASSWORD WITH SERVER
  async function verifyAdmin(password) {
    try {
      const res = await fetch("/verify-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        localStorage.setItem("admin_secret", password);
        setIsAdmin(true);
        window.location.reload();
      } else {
        alert("Wrong password");
        localStorage.removeItem("admin_secret");
        setIsAdmin(false);
      }
    } catch (err) {
      alert("Server error while verifying admin.");
    }
  }

  useEffect(() => {
    loadVideos();

    // 🔑 HIDDEN SHORTCUT: ALT + L
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "l") {

        const password = prompt("Enter Admin Password:");

        if (password) {
          verifyAdmin(password);
        }

      }
    };

    window.addEventListener("keydown", handleKeyDown);

    function handleUpdate(update) {
      setData(prev => ({
        ...prev,
        [update.videoId]: [...(prev[update.videoId] || []), update]
      }));
    }

    socket.on("viewUpdate", handleUpdate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      socket.off("viewUpdate", handleUpdate);
    };

  }, []);

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
        <p style={{ color: 'var(--text-muted)' }}>
          Monitor real-time view growth natively via API.
        </p>
      </div>

      {isAdmin && (
        <form className="input-group" onSubmit={track}>
          <input
            value={url}
            placeholder="Paste YouTube URL..."
            onChange={(e) => setUrl(e.target.value)}
          />

          <button type="submit" className="btn-primary">
            Track Video
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("admin_secret");
              window.location.reload();
            }}
            className="btn-sm"
            style={{ marginLeft: '10px', background: '#ccc' }}
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