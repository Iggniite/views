import { useEffect, useState } from "react";

const BASE_URL = "https://youtube-view-pq0x.onrender.com";

export default function Proof({ video, isAdmin }) {
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

  // ✅ Add schedule
  async function addSchedule() {
    if (!time) return alert("Select time");

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
        videoId: video.videoId,
        time: formatted
      })
    });

    alert("Time added");
    setTime("");
  }

  // ✅ Delete proof
  async function deleteProof(id) {
    await fetch(`${BASE_URL}/proof/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-secret": adminSecret
      }
    });

    loadProofs();
  }

  return (
    <div style={{ padding: "10px" }}>

      {/* ✅ ADD TIME */}
      {isAdmin && (
        <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button onClick={addSchedule}>➕ Add Time</button>
        </div>
      )}

      {/* ✅ PROOF LIST */}
      {proofs.length === 0 && <p>No proofs yet</p>}

      {proofs.map(p => (
        <div key={p.id} style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px"
        }}>
          <div><strong>{p.time}</strong></div>
          <div>Views: {p.views.toLocaleString()}</div>

          <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
            
            {/* 👁 VIEW */}
            <a
              href={`${BASE_URL}/${p.imagePath}`}
              target="_blank"
              rel="noreferrer"
            >
              <button>👁 View</button>
            </a>

            {/* ⬇ DOWNLOAD */}
            <a href={`${BASE_URL}/proof/download/${p.id}`}>
              <button>⬇ Download</button>
            </a>

            {/* 🗑 DELETE */}
            {isAdmin && (
              <button onClick={() => deleteProof(p.id)}>
                🗑 Delete
              </button>
            )}

          </div>
        </div>
      ))}

    </div>
  );
}