import React from 'react';

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    if (!utcTime) return "---";
    try {
      const parts = utcTime.match(/\d+/g);
      if (!parts || parts.length < 3) return utcTime;

      // Create date from UTC parts
      let d = new Date(Date.UTC(
        parts[0], parts[1] - 1, parts[2],
        parts[3] || 0, parts[4] || 0, parts[5] || 0
      ));

      // STRICT ALIGNMENT: Force 00 seconds
      d.setSeconds(0);
      d.setMilliseconds(0);

      return d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return "---";
    }
  };

  // Filter out duplicate minutes so the list is clean
  const cleanHistory = [...data]
    .reverse()
    .filter((row, index, self) => 
      index === 0 || formatToIST(row.time) !== formatToIST(self[index - 1].time)
    );

  return (
    <div style={{ overflowX: 'auto', height: '100%', overflowY: 'auto', borderRadius: '8px' }}>
      <table className="custom-table">
        <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <tr>
            <th>Time (IST)</th>
            <th>Views</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {cleanHistory.map((r, i) => (
            <tr key={i}>
              <td>{formatToIST(r.time || r.timestamp)}</td>
              <td>{Number(r.views).toLocaleString()}</td>
              <td style={{ color: r.count > 0 ? '#10b981' : 'inherit', fontWeight: 'bold' }}>
                {r.count > 0 ? `+${r.count.toLocaleString()}` : '0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}