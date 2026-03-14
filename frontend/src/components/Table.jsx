import React from 'react';

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    try {
      const date = new Date(utcTime);
      return date.toLocaleTimeString('en-IN', {
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
    <div style={{ 
      overflowX: 'auto', 
      height: '100%', 
      overflowY: 'auto', 
      borderRadius: '8px', 
      border: 'none' 
    }}>
      <table className="custom-table">
        <thead style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'var(--card-bg)', 
          backdropFilter: 'blur(10px)', 
          zIndex: 1 
        }}>
          <tr>
            <th>Time (IST)</th>
            <th>Views</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((r, i) => (
            <tr key={i}>
              {/* This is the fix: Converting server UTC to your local IST */}
              <td>{formatToIST(r.time)}</td>
              <td>{r.views.toLocaleString()}</td>
              <td style={{ 
                color: r.count > 0 ? 'var(--success)' : 'inherit',
                fontWeight: r.count > 0 ? '600' : '400'
              }}>
                {r.count > 0 ? `+${r.count.toLocaleString()}` : '0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}