import { useState } from "react";
import Chart from "./Chart";
import Table from "./Table";
import { deleteVideo, pauseVideo, resumeVideo } from "../api";

export default function VideoCard({ video, data, refresh, isAdmin }) {
  const [showTable, setShowTable] = useState(true);

  async function handleDelete() {
    try {
      await deleteVideo(video.videoId);
      refresh();
    } catch (err) { console.error(err); }
  }

  async function handleTogglePause() {
    try {
      video.status === "active" ? await pauseVideo(video.videoId) : await resumeVideo(video.videoId);
      refresh();
    } catch (err) { console.error(err); }
  }

  const isPaused = video.status === "paused";
  const overallIncrease = data && data.length > 0 ? data[data.length - 1].views - data[0].views : 0;

  const getIncrease = (hours) => {
    if (!data || data.length === 0) return 0;
    const mins = hours * 60;
    const sliced = data.slice(-mins);
    return sliced.length > 0 ? sliced[sliced.length - 1].views - sliced[0].views : 0;
  };

  const inc1h = getIncrease(1);
  const inc2h = getIncrease(2);
  const inc3h = getIncrease(3);

  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const parseDataTime = (t) => {
    if (!t) return -1;
    const m = t.match(/(\d+):(\d+):(\d+)\s*(AM|PM)?/i);
    if (!m) return -1;
    let h = parseInt(m[1]);
    if (m[4] && m[4].toUpperCase() === "PM" && h < 12) h += 12;
    if (m[4] && m[4].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + parseInt(m[2]);
  };

  let customIncrease = null;
  if (filterStart && filterEnd && data.length > 0) {
    const startMins = parseInt(filterStart.split(":")[0]) * 60 + parseInt(filterStart.split(":")[1]);
    const endMins = parseInt(filterEnd.split(":")[0]) * 60 + parseInt(filterEnd.split(":")[1]);
    const filtered = data.filter((d) => {
      const mins = parseDataTime(d.time);
      return startMins <= endMins ? (mins >= startMins && mins <= endMins) : (mins >= startMins || mins <= endMins);
    });
    customIncrease = filtered.length > 0 ? filtered[filtered.length - 1].views - filtered[0].views : 0;
  }

  return (
    <div className="video-card video-card-row-layout">
      <div className="video-info-col">
        <div className="card-header">
          {video.thumbnail && <img src={video.thumbnail} alt="Thumbnail" className="thumbnail" />}
          <div className="card-title-group">
            <h3 className="video-title">{video.title || "Unknown Title"}</h3>
          </div>
        </div>

        {isAdmin && (
          <div className="card-actions">
            <button onClick={handleTogglePause} className={`btn-sm ${isPaused ? "btn-success" : "btn-warning"}`}>
              {isPaused ? "▶ Resume" : "II Pause"}
            </button>
            <button onClick={handleDelete} className="btn-sm btn-danger">🗑 Delete</button>
          </div>
        )}

        <div className="stats-container">
          <div className="stat-box"><div className="stat-label">Last 1 Hr</div><div className="stat-value">+{inc1h.toLocaleString()}</div></div>
          <div className="stat-box"><div className="stat-label">Last 2 Hr</div><div className="stat-value">+{inc2h.toLocaleString()}</div></div>
          <div className="stat-box"><div className="stat-label">Last 3 Hr</div><div className="stat-value">+{inc3h.toLocaleString()}</div></div>
          <div className="stat-box"><div className="stat-label">Overall</div><div className="stat-value success">+{overallIncrease.toLocaleString()}</div></div>
        </div>

        <div style={{ textAlign: "center", marginTop: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Customise count:</span>
            <input type="time" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} style={{ padding: "4px 6px", fontSize: "0.8rem", borderRadius: "6px", width: "110px" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>to</span>
            <input type="time" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} style={{ padding: "4px 6px", fontSize: "0.8rem", borderRadius: "6px", width: "110px" }} />
          </div>
          {customIncrease !== null && (
            <div style={{ fontSize: "0.9rem", color: "var(--accent)", fontWeight: 600, marginTop: "6px" }}>+{customIncrease.toLocaleString()}</div>
          )}
        </div>
      </div>

      <div className="video-chart-col">
        <div className="chart-container"><Chart data={data} paused={isPaused} /></div>
      </div>

      <div className="video-history-col">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <button onClick={() => setShowTable(!showTable)} className="btn-sm" style={{ background: "white", color: "var(--text-heading)", border: "2px solid var(--text-main)" }}>
            {showTable ? "Hide History ▲" : "Show Full History ▼"}
          </button>
        </div>
        {showTable && <div className="table-inner-container"><Table data={data} /></div>}
      </div>
    </div>
  );
}