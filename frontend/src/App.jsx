import { useEffect, useState } from "react";
import { addVideo, getVideos, getViews } from "./api";
import { socket } from "./socket";
import VideoCard from "./components/VideoCard";

export default function App() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [data, setData] = useState({});
  
  // Use state for isAdmin so the UI updates immediately after login
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("admin_secret"));

  async function loadVideos() {
   const res = await getVideos();
    setVideos(res.data);
    const newData = {};
    for (const v of res.data) {
      const d = await getViews(v.videoId);
      newData[v.videoId] = d.data;
    }    
    setData(newData);
  }

  useEffect(() => {
    loadVideos();

     const handleKeyDown = (e) => {
       if (
    (e.ctrlKey || e.metaKey) && 
         e.shiftKey &&
         e.key.toLowerCase() === "l"
       ) {
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
      }))
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
        <p style={{ color: 'var(--text-muted)' }}>Monitor real-time view growth natively via API.</p>
        
        {/* CLUE REMOVED: The <small> tag is gone. 
            Only you know that Alt+L works. */}
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
            style={{marginLeft: '10px', background: '#ccc'}}
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