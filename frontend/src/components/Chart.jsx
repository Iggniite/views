import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

export default function Chart({ data, paused }) {

  if (!data || data.length === 0)
    return <div className="loading">Waiting for data...</div>;

  const formatToIST = (utcTime) => {
    try {
      const d = new Date(utcTime);

      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

    } catch (e) {
      return "";
    }
  };

  const chartData = {
    labels: data.map(d => formatToIST(d.time)),

    datasets: [{
      label: "Views",
      data: data.map(d => d.views),
      borderColor: paused ? '#f59e0b' : '#6366f1',
      backgroundColor: paused ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
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
        callbacks: {
          title: (ctx) => ctx[0].label
        }
      }
    },

    scales: {
      x: { ticks: { display: false } },

      y: {
        ticks: {
          callback: (v) => v.toLocaleString()
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}