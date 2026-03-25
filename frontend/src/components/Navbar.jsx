import { useRef, useEffect, useState } from "react";

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "live", label: "LIVE", icon: "🔥" },
    { key: "paused", label: "PAUSED", icon: "⏸" },
    { key: "prediction", label: "PREDICTION", icon: "📊" },
    { key: "proof", label: "PROOF", icon: "📸" }
  ];

  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const activeBtn = containerRef.current.querySelector(
      `[data-tab="${activeTab}"]`
    );

    if (activeBtn) {
      setIndicatorStyle({
        width: activeBtn.offsetWidth,
        left: activeBtn.offsetLeft
      });
    }
  }, [activeTab]);

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      justifyContent: "center",
      marginTop: "10px",
      marginBottom: "20px"
    }}>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "flex",
          gap: "8px",
          padding: "6px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}
      >

        {/* 🔵 Sliding Indicator */}
        <div
          style={{
            position: "absolute",
            height: "100%",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            transition: "all 0.3s ease",
            top: 0,
            ...indicatorStyle
          }}
        />

        {tabs.map(tab => (
          <button
            key={tab.key}
            data-tab={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              position: "relative",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              background: "transparent",
              color: activeTab === tab.key ? "#fff" : "#374151",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "0.2s"
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}