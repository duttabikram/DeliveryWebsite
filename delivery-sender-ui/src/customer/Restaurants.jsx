import { useEffect, useState } from "react";
import "./Menu.css";


export default function Restaurants({ onSelect }) {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch("https://deliverywebsite.onrender.com/restaurants")
      .then(res => res.json())
      .then(setRestaurants);
  }, []);

  return (
    <div className="menu-page">
      <h2 className="menu-title" >🍽️ Restaurants</h2>
      {restaurants.length === 0 && <p className="empty-cart">No Retaurants Yet</p>}
      <div className="food-grid">
        {restaurants.map(r => (
          <div key={r._id}
            onClick={() => onSelect(r)} 
            className="food-card">
            {/* RESTAURANT IMAGE */}
            <div className="food-image">
              <img src={r.imageUrl} alt={r.name} style={{height: 120}}/>
            </div>
            {/* RESTAURANT INFO */}
            <div className="food-body">
              <h4>{r.name}</h4>
              <p className="price">{r.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

