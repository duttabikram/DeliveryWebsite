import { useState } from "react";
import { getAuthUser } from "../utils/auth";


export default function Signup({ onLogin }) {
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const signup = async () => {
    setPlacing(true);
    const res = await fetch("https://deliverywebsite.onrender.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);
    onLogin(getAuthUser());
    setPlacing(false);
  };

  return (
    <div>
      <h2>Signup</h2>

      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })} />

      <select onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="CUSTOMER">Customer</option>
        <option value="RESTAURANT">Restaurant</option>
        <option value="DELIVERY">Delivery</option>
      </select>

      <button disabled={placing} className="submit-btn" onClick={signup}>{placing ? "Creating Account..." : "Create Account"}</button>
    </div>
  );
}


 