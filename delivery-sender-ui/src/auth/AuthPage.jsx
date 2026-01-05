import { useState } from "react";
import Signup from "./Signup";
import Login from "./Login";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // or signup

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("login")}>🔐 Login</button>
        <button onClick={() => setMode("signup")} style={{ marginLeft: 10 }}>
          ✍️ Signup
        </button>
      </div>

      {mode === "login" && <Login onLogin={onAuth} />}
      {mode === "signup" && <Signup onLogin={onAuth} />}
    </div>
  );
}
