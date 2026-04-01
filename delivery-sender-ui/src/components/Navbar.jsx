import LogoutButton from "./LogoutButton";
import "./navbar.css";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ auth, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 🔥 Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const getInitial = (email) => email?.charAt(0).toUpperCase();

  return (
    <div className="navbar">
      {/* LEFT */}
      <div className="logo">Foodie</div>

      {/* RIGHT */}
      <div className="nav-right" ref={ref}>
        {/* AVATAR */}
        <div
          className="avatar"
          onClick={() => setOpen(!open)}
        >
          {getInitial(auth.email)}
        </div>

        {/* DROPDOWN */}
        <div className={`dropdown ${open ? "show" : ""}`}>
          <div className="dropdown-header">
            <div className="avatar large">
              {getInitial(auth.email)}
            </div>

            <div>
              <div className="email">{auth.email}</div>
              <div className="role">{auth.role}</div>
            </div>
          </div>

          <div className="divider" />

          <LogoutButton onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}