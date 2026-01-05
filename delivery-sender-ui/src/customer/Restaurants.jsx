import { useEffect, useState } from "react";

export default function Restaurants({ onSelect }) {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/restaurants")
      .then(res => res.json())
      .then(setRestaurants);
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h2>🍽️ Restaurants</h2>

      {restaurants.map(r => (
        <div
          key={r._id}
          onClick={() => onSelect(r)}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <h3>{r.name}</h3>
          <p>{r.address}</p>
        </div>
      ))}
    </div>
  );
}
