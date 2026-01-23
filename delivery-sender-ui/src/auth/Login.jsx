import { useState } from "react";
import { getAuthUser } from "../utils/auth";


export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [placing, setPlacing] = useState(false);


  const login = async () => {
    setPlacing(true);
    const res = await fetch("https://deliverywebsite.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);

    onLogin(getAuthUser());
    setPlacing(false);
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password"
        onChange={e => setPassword(e.target.value)} />
      <button disabled={placing} className="submit-btn" onClick={login}>{placing ? "Loging..." : "Login"}</button>
    </div>
  );
}
