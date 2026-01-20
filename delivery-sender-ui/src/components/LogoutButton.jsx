export default function LogoutButton({ onLogout }) {
  const logout = () => {
    localStorage.removeItem("token");
    onLogout(null);
  };

  return (
    <button
      onClick={logout}
      style={{
        padding: "8px 14px",
        background: "#ff4d4f",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}
