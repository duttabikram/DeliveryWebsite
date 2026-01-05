import { useEffect, useState } from "react";

export default function RestaurantAdmin({restaurantId}) {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔐 Auth data (set at login)
  const token = localStorage.getItem("token");

  // 📦 Load menu
  const loadFoods = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/restaurant/${restaurantId}/food`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error("LOAD FOOD ERROR:", err);
      alert("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hooks ALWAYS run
  useEffect(() => {
    if (!token || !restaurantId) return;
    loadFoods();
  }, [token, restaurantId]);

  // ⛔ Render guards AFTER hooks
  if (!token || !restaurantId) {
    return <p>❌ Unauthorized. Please login again.</p>;
  }

  if (loading) {
    return <p>Loading menu…</p>;
  }

  // ➕ Add food
  const addFood = async () => {
    if (!name || !price) return alert("Enter food name & price");

    await fetch(
      `http://localhost:5000/restaurant/${restaurantId}/food`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      }
    );

    setName("");
    setPrice("");
    loadFoods();
  };

  // 🔄 Enable / disable food
  const toggleFood = async (foodId, available) => {
    await fetch(`http://localhost:5000/food/${foodId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ available: !available }),
    });

    loadFoods();
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>🍽️ Restaurant Menu Admin</h2>

      {/* ADD FOOD */}
      <div>
        <input
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br/>
        
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <br/>
        <br/>
        <button onClick={addFood}>➕ Add Food</button>
      </div>

      <hr />
      <br/>
      {/* FOOD LIST */}
      {foods.length === 0 && <p>No items yet</p>}

      {foods.map((food) => (
        <div key={food._id} style={{ marginBottom: 10 }}>
          <b>{food.name}</b> — ₹{food.price}
          <button
            onClick={() => toggleFood(food._id, food.available)}
            style={{ marginLeft: 10 }}
          >
            {food.available ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}
