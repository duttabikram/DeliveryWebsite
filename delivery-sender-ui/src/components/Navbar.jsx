import LogoutButton from "./LogoutButton";

export default function Navbar({ auth, onLogout }) {
  return (
    <div
      style={{
        padding: "12px 20px",
        background: "#f5f5f5",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
      }}
    >
      <div>
        <b>🍔 Food Delivery App</b>
        <span style={{ marginLeft: 10, color: "#b83a3ac6" }}>
          {auth.role}
        </span>
        <span style={{ marginLeft: 10, color: "#1d08bc94" }}>
          {auth.email}
        </span>
      </div>

      <LogoutButton onLogout={onLogout} />
    </div>
  );
}
