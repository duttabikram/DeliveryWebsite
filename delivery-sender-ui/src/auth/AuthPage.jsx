import { useState } from "react";
import Signup from "./Signup";
import Login from "./Login";
import "./auth.css";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Signup
          </button>
        </div>

        {/* Forms */}
        {mode === "login" && <Login onLogin={onAuth} />}
        {mode === "signup" && <Signup onLogin={onAuth} />}

      </div>
    </div>
  );
}
