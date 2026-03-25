import { useEffect, useState } from "react";

const BASE_URL = "https://youtube-view-pq0x.onrender.com";

export default function Proof({ video, isAdmin }) {

  const [url, setUrl] = useState("");
  const [time, setTime] = useState("");
  const [proofs, setProofs] = useState([]);

  const adminSecret = localStorage.getItem("admin_secret");

  // ✅ Load proofs
  async function loadProofs() {
    const res = await fetch(`${BASE_URL}/proofs/${video.videoId}`);
    const data = await res.json();
    setProofs(data);
  }

  useEffect(() => {
    loadProofs();
  }, [video.videoId]);

  // ✅ Extract videoId from URL
  function extractVideoId(url) {
    const match = url.match(
      /(?:youtube\.com.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }

  // ✅ Add schedule
  async function addSchedule() {
    if (!url || !time) return alert("Enter URL and time");

    const videoId = extractVideoId(url);
    if (!videoId) return alert("Invalid YouTube URL");

    const formatted = new Date(`1970-01-01T${time}`)
      .toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    await fetch(`${BASE_URL}/proof-schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret
      },
      body: JSON.stringify({
        videoId,
        time: formatted
      })
    });

    alert("Scheduled successfully");
    setUrl("");
    setTime("");
  }

  // ✅ Delete proof
  async function deleteProof(id) {
    await fetch(`${BASE_URL}/proof/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": adminSecret }
    });
    loadProofs();
  }

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>

      {/* 🔥 CARD */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        marginBottom: "20px"
      }}>

        <h3>📸 Screenshot Proof</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Enter a video URL and set a time. The system will automatically capture a screenshot.
        </p>

        {/* URL INPUT */}
        <div style={{ marginBottom: "10px" }}>
          <label>YouTube Video URL</label>
          <input
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        {/* TIME INPUT */}
        <div style={{ marginBottom: "10px" }}>
          <label>Screenshot Time</label>
          <input
            type="time"
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={addSchedule}
          style={{
            width: "100%",
            padding: "12px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Schedule Screenshot
        </button>
      </div>

      {/* 🔥 SAVED SCREENSHOTS */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>

        <h3>Saved Screenshots</h3>

        {proofs.length === 0 && <p>No proofs yet</p>}

        {proofs.map(p => (
          <div key={p.id} style={{
            padding: "12px",
            border: "1px solid #eee",
            borderRadius: "8px",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>

            <div>
              <div><strong>{p.time}</strong></div>
              <div style={{ fontSize: "13px", color: "#666" }}>
                Views: {p.views.toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              
              <a href={`${BASE_URL}/${p.imagePath}`} target="_blank">
                <button>👁 View</button>
              </a>

              <a href={`${BASE_URL}/proof/download/${p.id}`}>
                <button>⬇ Download</button>
              </a>

              {isAdmin && (
                <button onClick={() => deleteProof(p.id)}>
                  🗑
                </button>
              )}

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}