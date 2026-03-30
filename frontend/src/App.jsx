import { useEffect, useState } from "react";
import { addVideo, getVideos, getViews } from "./api";
import { socket } from "./socket";
import VideoCard from "./components/VideoCard";
import Navbar from "./components/Navbar";
import Proof from "./components/Proof";

export default function App() {

  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [data, setData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("live");

  // 🔥 NEW: selected video for proof tab
  const [selectedVideoId, setSelectedVideoId] = useState("");

  async function loadVideos() {
    const res = await getVideos();
    setVideos(res.data);

    // 🔥 SET DEFAULT SELECTED VIDEO
    if (res.data.length > 0 && !selectedVideoId) {
      setSelectedVideoId(res.data[0].videoId);
    }

    const newData = {};
    for (const v of res.data) {
      const d = await getViews(v.videoId);
      newData[v.videoId] = d.data;
    }
    setData(newData);
  }

  async function verifyAdmin(password) {
    const res = await fetch("https://youtube-view-pq0x.onrender.com/verify-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      localStorage.setItem("admin_secret", password);
      setIsAdmin(true);
    } else {
      alert("Wrong password");
      localStorage.removeItem("admin_secret");
      setIsAdmin(false);
    }
  }

  useEffect(() => {

    loadVideos();

    const stored = localStorage.getItem("admin_secret");
    if (stored) verifyAdmin(stored);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        const password = prompt("Enter Admin Password:");
        if (password) verifyAdmin(password);
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
    e.preventDefault();
    if (!url.trim()) return;

    try {
      await addVideo(url);
      setUrl("");
      loadVideos();
    } catch {
      alert("Unauthorized action.");
    }
  }

  const liveVideos = videos.filter(v => v.status === "active");
  const pausedVideos = videos.filter(v => v.status === "paused");

  let displayedVideos = [];
  if (activeTab === "live") displayedVideos = liveVideos;
  else if (activeTab === "paused") displayedVideos = pausedVideos;

  // 🔥 FIND SELECTED VIDEO OBJECT
  const selectedVideo = videos.find(v => v.videoId === selectedVideoId);

  return (
    <div className="dashboard-container">

      <div className="header">
        <h1>YouTube View Tracker</h1>
      </div>

      {isAdmin && (
        <form className="input-group" onSubmit={track}>
          <input
            value={url}
            placeholder="Paste YouTube URL..."
            onChange={(e) => setUrl(e.target.value)}
          />
      <button type="submit" className="btn-prim">
          Track
      </button>

         <button
           type="button"
           className="btn-sm btn-logout"
           onClick={() => {
             localStorage.removeItem("admin_secret");
             setIsAdmin(false);
           }}
           style={{ marginLeft: "10px" }}
         >
           Logout
         </button>
        </form>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🔥 PROOF TAB WITH DROPDOWN */}
      {activeTab === "proof" && (
        <div style={{ maxWidth: "900px", margin: "20px auto" }}>

          {/* 🔥 DROPDOWN */}
          <select
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            {videos.map(v => (
              <option key={v.videoId} value={v.videoId}>
                {v.title}
              </option>
            ))}
          </select>

          {/* 🔥 SHOW SELECTED VIDEO ONLY */}
          {selectedVideo && (
            <Proof video={selectedVideo} isAdmin={isAdmin} />
          )}
        </div>
      )}

      {/* 🔥 OTHER TABS */}
      {activeTab !== "proof" && (
        <div className="video-grid">
          {displayedVideos.map(v => (
            <VideoCard
              key={v.videoId}
              video={v}
              data={data[v.videoId] || []}
              refresh={loadVideos}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

    </div>
  );
}