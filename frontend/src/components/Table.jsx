import React from "react";

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (time) => {
    if (!time) return "---";

    try {
      let d;

      // if timestamp number
      if (!isNaN(time)) {
        d = new Date(Number(time) < 1e12 ? Number(time) * 1000 : Number(time));
      } else {
        d = new Date(time);
      }

      if (isNaN(d.getTime())) return "---";

      return d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return "---";
    }
  };

  return (
    <div style={{ overflowX: "auto", height: "100%", overflowY: "auto", borderRadius: "8px" }}>
      <table className="custom-table">
        <thead style={{ position: "sticky", top: 0, background: "var(--card-bg)", zIndex: 1 }}>
          <tr>
            <th>Time (IST)</th>
            <th>Views</th>
            <th>Count</th>
          </tr>
        </thead>

        <tbody>
          {[...data].reverse().map((r, i) => (
            <tr key={i}>
              <td>{formatToIST(r.time)}</td>

              <td>{r.views.toLocaleString()}</td>

              <td style={{ color: r.count > 0 ? "var(--success)" : "inherit" }}>
                {r.count > 0 ? `+${r.count.toLocaleString()}` : "0"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}