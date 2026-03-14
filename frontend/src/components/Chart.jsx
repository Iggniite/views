import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

export default function Chart({ data, paused }) {
  if (!data || data.length === 0) return null;

  const formatToIST = (utcTime) => {
    try {
      const p = utcTime.match(/\d+/g);
      const d = new Date(Date.UTC(p[0], p[1]-1, p[2], p[3]||0, p[4]||0));
      d.setMinutes(d.getMinutes() + 330);
      let hh = d.getHours() % 12 || 12;
      return `${hh}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
    } catch (e) { return ""; }
  };

  const chartData = {
    labels: data.map(d => formatToIST(d.time)),
    datasets: [{
      data: data.map(d => d.views),
      borderColor: paused ? '#f59e0b' : '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div style={{ height: '250px' }}>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { callback: v => v.toLocaleString() } } } }} />
    </div>
  );
}