import { useState } from "react";

export default function CreateRestaurant({ onCreated }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const createRestaurant = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/restaurant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, address }),
    });

    const data = await res.json();
    onCreated(data); // 🔥 pass restaurant upward
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🏪 Create Your Restaurant</h2>

      <input
        placeholder="Restaurant Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <br /><br />

      <button onClick={createRestaurant}>
        Create Restaurant
      </button>
    </div>
  );
}
