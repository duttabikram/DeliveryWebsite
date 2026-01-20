import { useState, useEffect } from "react";
import "./style.css";

export default function CreateRestaurant({ onCreated }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const token = localStorage.getItem("token");


useEffect(() => {
  if (!navigator.geolocation) {
    setLocationError("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    },
    () => {
      setLocationError("Location permission denied");
    }
  );
}, []);
  
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

  const createRestaurant = async () => {
    if (location === null) {
    alert("Please allow Location");
    return;
  }
   if (!name || !address || !imageFile) {
      alert("Fill all fields");
      return;
    }
    setPlacing(true);

    const imageUrl = await uploadToCloudinary();
    if (!imageUrl) return;

    const res = await fetch("https://deliverywebsite.onrender.com/restaurant/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, address ,imageUrl, location}),
    });

    const data = await res.json();
    onCreated(data);
    setPlacing(false);

  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🏪 Create Your Restaurant</h2>

        <input
          type="text"
          placeholder="Restaurant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Restaurant Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
        type="file"
        placeholder="Restaurant image"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button onClick={createRestaurant} disabled={placing}>{placing ? "Creating Reataurant..." : "Create Restaurant"}</button>

        {!location && !locationError && <p>📍 Detecting your location…</p>}
      {locationError && <p style={{ color: "red" }}>{locationError}</p>}

      </div>
    </div>
  );
}