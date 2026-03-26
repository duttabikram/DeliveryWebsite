import LogoutButton from "./LogoutButton";

export default function Navbar({ auth, onLogout }) {

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
      {/* LEFT SIDE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {/* LOGO */}
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

        {/* ROLE + EMAIL */}
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

      {/* RIGHT SIDE */}
      <div>
        <LogoutButton onLogout={onLogout} />
      </div>
    </div>
  );
}
