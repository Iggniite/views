import React from "react";

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    if (!utcTime) return "---";

    try {
      const d = new Date(utcTime);

      const ist = new Date(
        d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      const hh = String(ist.getHours()).padStart(2, "0");
      const mm = String(ist.getMinutes()).padStart(2, "0");

      return `${hh}:${mm}:00`;

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