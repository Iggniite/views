import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

export default function Chart({ data, paused }) {
  if (!data || data.length === 0) return <div style={{textAlign:'center', padding:'20px'}}>Waiting...</div>;

  const formatToIST = (utcTime) => {
    if (!utcTime) return "";
    try {
      const parts = utcTime.match(/\d+/g);
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0));
      d.setSeconds(0);
      return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    } catch (e) { return ""; }
  };

  // Clean data for chart to prevent "back-and-forth" lines
  const cleanChartData = data.filter((row, index, self) => 
    index === 0 || formatToIST(row.time) !== formatToIST(self[index - 1].time)
  );

  const chartData = {
    labels: cleanChartData.map(d => formatToIST(d.time || d.timestamp)),
    datasets: [{
      label: "Views",
      data: cleanChartData.map(d => d.views),
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
      tooltip: { callbacks: { title: (ctx) => ctx[0].label } }
    },
    scales: {
      x: { ticks: { display: false } },
      y: { ticks: { callback: (v) => v.toLocaleString() } }
    }
  };

  return <Line data={chartData} options={options} />;
}