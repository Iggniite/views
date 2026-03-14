import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

export default function Chart({ data, paused }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '40px' }}>Waiting for data...</div>;

  const chartData = {
    labels: data.map(d => d.time),
    datasets: [{
      label: "Total Views",
      data: data.map(d => d.views),
      borderColor: paused ? '#f59e0b' : '#6366f1',
      backgroundColor: paused ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: paused ? '#f59e0b' : '#6366f1',
      fill: true,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { display: false }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b' }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}
