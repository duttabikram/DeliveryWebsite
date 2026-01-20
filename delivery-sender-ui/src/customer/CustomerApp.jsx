import { useState } from "react";
import Restaurants from "./Restaurants";
import PlaceOrder from "./PlaceOrder";
import TrackOrder from "./TrackOrder";


export default function CustomerApp({ auth }) {
  const [restaurant, setRestaurant] = useState(null);
  const [tab, setTab] = useState("menu"); // menu | orders


  // Step 2 → menu + order + tracking
  if (!restaurant) {
    return <Restaurants onSelect={setRestaurant} />
  }

  // Step 1 → choose restaurant
  return (
      <div className="restaurant-page">
        <div className="restaurant-container">
  
          {/* Tabs */}
          <div className="restaurant-tabs">
            <button
              className={tab === "menu" ? "active" : ""}
              onClick={() => setTab("menu")}
            >
              🍽️ Menu
            </button>
  
            <button
              className={tab === "orders" ? "active" : ""}
              onClick={() => setTab("orders")}
            >
              📦 Orders
            </button>
          </div>
  
          {/* Content */}
          {tab === "menu" && (
            <PlaceOrder  restaurant={restaurant}
        userId={auth.userId}
        onBack={() => setRestaurant(null)} />
          )}
  
          {tab === "orders" && (
            <TrackOrder  restaurant={restaurant}
        userId={auth.userId}
        onBack={() => setRestaurant(null)} />
          )}
  
        </div>
      </div>
    );
}
