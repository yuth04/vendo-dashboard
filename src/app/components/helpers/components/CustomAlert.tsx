"use client";

interface CustomAlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

const alertColors = {
  success: { bg: "#166534", border: "#22c55e", icon: "✓" },
  error:   { bg: "#7f1d1d", border: "#ef4444", icon: "✕" },
  warning: { bg: "#713f12", border: "#f59e0b", icon: "⚠" },
  info:    { bg: "#1e3a5f", border: "#3b82f6", icon: "i" },
};

export default function CustomAlert({ type, message }: CustomAlertProps) {
  const config = alertColors[type];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 16px",
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: "10px",
      color: "#fff",
      fontSize: "14px",
      minWidth: "280px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      animation: "slideIn 0.3s ease",
    }}>
      <span style={{
        width: "20px", height: "20px",
        background: config.border,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 700, flexShrink: 0,
      }}>
        {config.icon}
      </span>
      {message}
    </div>
  );
}
