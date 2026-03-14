import React from 'react';

export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    if (!utcTime) return "---";
    try {
      // Manual Extraction: Works even if the browser is 'broken'
      const p = utcTime.match(/\d+/g);
      if (!p || p.length < 3) return utcTime;

      // Force create date and manually add 5 hours 30 mins for India
      const d = new Date(Date.UTC(p[0], p[1]-1, p[2], p[3]||0, p[4]||0, p[5]||0));
      d.setMinutes(d.getMinutes() + 330); 

      let hh = d.getHours();
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ampm = hh >= 12 ? 'PM' : 'AM';
      hh = hh % 12 || 12;

      // This forces the "10:00:00 PM" format you want
      return `${hh}:${mm}:00 ${ampm}`;
    } catch (e) {
      return "---";
    }
  };

  // Filter to remove duplicates within the same minute
  const seen = new Set();
  const cleanData = [...data].reverse().filter(r => {
    const time = formatToIST(r.time);
    if (seen.has(time)) return false;
    seen.add(time);
    return true;
  });

  return (
    <div style={{ overflowX: 'auto', height: '100%', overflowY: 'auto' }}>
      <table className="custom-table">
        <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
          <tr>
            <th>Time (IST)</th>
            <th>Views</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {cleanData.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 'bold' }}>{formatToIST(r.time)}</td>
              <td>{Number(r.views).toLocaleString()}</td>
              <td style={{ color: r.count > 0 ? '#10b981' : '#64748b' }}>
                {r.count > 0 ? `+${r.count.toLocaleString()}` : '0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}