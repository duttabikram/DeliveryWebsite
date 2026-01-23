import { useRef, useEffect, useState } from "react";
import "./RestaurantAdmin.css";

export default function RestaurantAdmin({ restaurantId }) {
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [restaurant, setRestaurant] = useState(null); 
  const fileRef = useRef(null);

  const token = localStorage.getItem("token");


const uploadToCloudinary = async () => {
  if (!imageFile) return null;

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", "food_upload");
  formData.append("folder", "food-images");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dwufho5go/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    alert("Image upload failed. Check Cloudinary config.");
    return null;
  }
};


  const loadFoods = async () => {
    try {
      const res = await fetch(
        `https://deliverywebsite.onrender.com/restaurant/${restaurantId}/food`,
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
      alert("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurant = async () => {
      try {
        const res = await fetch("https://deliverywebsite.onrender.com/restaurant/my-restaurant", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setRestaurant(data);
      } catch (err) {
      alert("Session expired. Please login again.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!token || !restaurantId) return;
    loadFoods();
    fetchRestaurant();
  }, [token, restaurantId]);

  if (!token || !restaurantId) {
    return <p>❌ Unauthorized. Please login again.</p>;
  }

  if (loading) return <p>Loading menu…</p>;
  
  if (!restaurant) {
    return <p>Loading Restaurant...</p>;
  }

  const addFood = async () => {
    if (!name || !price || !imageFile) {
      alert("Fill all fields");
      return;
    }
    setPlacing(true);

    const imageUrl = await uploadToCloudinary();
    if (!imageUrl) return;
    
    
  await fetch(
      `https://deliverywebsite.onrender.com/restaurant/${restaurantId}/food`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price, imageUrl }),
      }
    );

    setName("");
    setPrice("");
    setImageFile(null);
    loadFoods();
    setPlacing(false);
    fileRef.current.value = "";

  };

  const removeFood = async (foodId) => {

  await fetch(
    `https://deliverywebsite.onrender.com/restaurant/food/${foodId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 🔄 Update UI
  setFoods((prev) => prev.filter((f) => f._id !== foodId));
};

  const toggleFood = async (foodId, available) => {
    await fetch(`https://deliverywebsite.onrender.com/food/${foodId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ available: !available }),
    });

    loadFoods();
  };

    const toggleRes = async (restaurantId, isActive) => {
    await fetch(`https://deliverywebsite.onrender.com/restaurant/${restaurantId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !isActive }),
    });

    fetchRestaurant();
  };

  return (
    <div className="admin-page">
  <div className="menu-head">
  <h2>🍽️ Restaurant Menu Admin</h2>
  <button style={{ background: "black", color: "white" }} className="back-btn" onClick={() => toggleRes(restaurantId, restaurant.isActive)}>
    {restaurant.isActive ? "Disable" : "Enable"}
  </button>
  </div>
  {/* CENTERED ADD FOOD CARD */}
  <div className="add-food-wrapper">
    <div className="add-food-card">
      <input
        placeholder="Food name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
/>

      <button onClick={addFood} disabled={placing}>{placing ? "Adding Food..." : "➕ Add Food"}</button>
    </div>
  </div>

  {/* FOOD LIST */}
  <div className="food-grid">
    {foods.map((food) => (
      <div className="food-card" key={food._id}>
        <img src={food.imageUrl} alt={food.name} style={{height: 120}} />
        <h4>{food.name}</h4>
        <p>₹{food.price}</p>
        <button style={{ background: "black", color: "white" }} className="back-btn" onClick={() => toggleFood(food._id, food.available)}>
          {food.available ? "Disable" : "Enable"}
        </button>
        <button style={{ background: "red", color: "white" }} className="back-btn" onClick={() => removeFood(food._id)}> Remove </button>
      </div>
    ))}
  </div>
</div>
  );
}
