export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = ["live", "paused", "prediction", "proof"];

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      marginBottom: "20px"
    }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            background: activeTab === tab ? "#6366f1" : "#e5e7eb",
            color: activeTab === tab ? "white" : "#1f2937"
          }}
        >
          {tab.toUpperCase()}
        </button>
      ))}
    </div>
  );
}