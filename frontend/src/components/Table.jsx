import React from "react";

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const startTime = new Date();

  const getTime = (index) => {
    const d = new Date(startTime.getTime() - (data.length - 1 - index) * 60000);

    return d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
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
              <td>{getTime(data.length - 1 - i)}</td>

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