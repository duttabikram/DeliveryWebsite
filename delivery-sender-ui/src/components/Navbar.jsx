import { useState, useEffect } from "react";
import LogoutButton from "./LogoutButton";

export default function Navbar({ auth, onLogout }) {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getEmoji = (role) => {
    if (role === "CUSTOMER") return "🧑‍🍳";
    if (role === "RESTAURANT") return "🏪";
    if (role === "DELIVERY") return "🛵";
    return "👤";
  };

  return (
    <div
      style={{
        padding: "10px 14px",
        background: "#0a0a0a",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "600",
            letterSpacing: "1px",
            color: "#22c55e",
          }}
        >
          🍔 FOODIE
        </div>

        <div
          style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "#22c55e" }}>
            {getEmoji(auth.role)} {auth.role}
          </span>

          <span style={{ color: "#666" }}>•</span>

          <span style={{ color: "#aaa" }}>
            {auth.email}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          padding: "5px 12px",
          borderRadius: "999px",
          border: "1px solid #22c55e",
          color: "#22c55e",
          fontSize: "12px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <LogoutButton onLogout={onLogout}>
          {isMobile ? "🚪" : "Logout 🚪"}
        </LogoutButton>
      </div>
    </div>
  );
}
