import { useEffect, useState } from "react";

const BASE_URL = "https://youtube-view-pq0x.onrender.com";

export default function Proof({ video, isAdmin }) {

  const [time, setTime] = useState("");
  const [proofs, setProofs] = useState([]);

  // 🔥 ADDED: pending state
  const [pending, setPending] = useState([]);

  const adminSecret = localStorage.getItem("admin_secret");

  // ✅ Load completed proofs
  async function loadProofs() {
    const res = await fetch(`${BASE_URL}/proofs/${video.videoId}`);
    const data = await res.json();
    setProofs(data);
  }

  // 🔥 ADDED: load pending schedules
  async function loadPending() {
    const res = await fetch(`${BASE_URL}/proof-schedule/${video.videoId}`);
    const data = await res.json();
    setPending(data);
  }

  useEffect(() => {
    loadProofs();
    loadPending();
  }, [video.videoId]);

  // ✅ UPDATED: Add schedule using EXISTING video
  async function addSchedule() {
    if (!time) return alert("Enter time");

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
        videoId: video.videoId, // 🔥 FIXED (no mismatch now)
        time: formatted
      })
    });

    alert("Scheduled successfully");

    setTime("");

    // 🔥 Refresh instantly
    loadPending();
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

      {/* 🔥 VIDEO CARD HEADER (ADDED FOR BETTER UX) */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "15px"
      }}>
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt="thumb"
            style={{ width: "80px", borderRadius: "8px" }}
          />
        )}
        <div>
          <h3 style={{ margin: 0 }}>{video.title}</h3>
        </div>
      </div>

      {/* 🔥 SCHEDULER CARD */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        marginBottom: "20px"
      }}>

        <h3>📸 Screenshot Proof</h3>
        {isAdmin && (
         <>
           <p style={{ color: "#666", fontSize: "14px" }}>
             Select a time to capture screenshot for this video.
           </p>
       
           <div style={{ marginBottom: "10px" }}>
             <label>Screenshot Time</label>
             <input
               type="time"
               style={{
                 width: "100%",
                 padding: "10px",
                 marginTop: "5px"
               }}
               value={time}
               onChange={(e) => setTime(e.target.value)}
             />
           </div>
       
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
         </>
       )}
       </div> 

      {/* 🔥 RESULTS */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>

        <h3>Saved Screenshots</h3>

        {/* 🔥 PENDING */}
        {pending.map(p => (
          <div key={p.id} style={{
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "10px",
            background: "#f1f5f9"
          }}>
            <div><strong>Scheduled Screenshot</strong></div>
            <div style={{ fontSize: "13px" }}>
              {p.time} • <span style={{ color: "orange" }}>pending</span>
            </div>
          </div>
        ))}

        {/* EMPTY */}
        {proofs.length === 0 && pending.length === 0 && <p>No proofs yet</p>}

        {/* COMPLETED */}
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
