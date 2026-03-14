import React from 'react';

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    if (!utcTime) return "---";
    try {
      const t = utcTime.split(/[- :T.Z]/);
      const d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
      
      return d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return utcTime; 
    }
  };

  return (
    <div style={{ overflowX: 'auto', height: '100%', overflowY: 'auto', borderRadius: '8px' }}>
      <table className="custom-table">
        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
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
              <td style={{ color: r.count > 0 ? 'var(--success)' : 'inherit' }}>
                {r.count > 0 ? `+${r.count.toLocaleString()}` : '0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}