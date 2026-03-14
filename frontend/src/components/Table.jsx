import React from 'react';

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    if (!utcTime) return "Pending...";
    
    try {
      // Step 1: Normalize the string to ISO format (adds Z if missing)
      const isoString = utcTime.includes('T') ? utcTime : utcTime.replace(' ', 'T');
      const normalizedTime = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
      
      const date = new Date(normalizedTime);

      // Step 2: Final check if the date is valid
      if (isNaN(date.getTime())) return "Processing...";

      return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return "Format Error";
    }
  };

  return (
    <div style={{ overflowX: 'auto', height: '100%', overflowY: 'auto', borderRadius: '8px', border: 'none' }}>
      <table className="custom-table">
        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', backdropFilter: 'blur(10px)', zIndex: 1 }}>
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