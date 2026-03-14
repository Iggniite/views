export default function Table({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto', height: '100%', overflowY: 'auto', borderRadius: '8px', border: 'none' }}>
      <table className="custom-table">
        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', backdropFilter: 'blur(10px)', zIndex: 1 }}>
          <tr>
            <th>Time</th>
            <th>Views</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((r, i) => (
            <tr key={i}>
              <td>{r.time}</td>
              <td>{r.views.toLocaleString()}</td>
              <td style={{ color: r.count > 0 ? 'var(--success)' : 'inherit' }}>
                {r.count > 0 ? `+${r.count.toLocaleString()}` : '0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}