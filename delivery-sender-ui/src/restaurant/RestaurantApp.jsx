import { useEffect, useState } from "react";
import RestaurantAdmin from "./RestaurantAdmin";
import CreateRestaurant from "./CreateRestaurant";
import OrdersPanel from "./OrdersPanel";
import "./restaurant.css";

export default function RestaurantApp({ auth }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("menu"); // menu | orders

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch("http://localhost:5000/restaurant/my-restaurant", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        } else {
          setRestaurant(null);
        }
      } catch {
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [auth.token]);

  if (loading) return <p>Loading…</p>;

  // ❌ No restaurant yet
  if (!restaurant) {
    return (
      <div className="restaurant-page">
        <div className="restaurant-container">
          <CreateRestaurant onCreated={setRestaurant} />
        </div>
      </div>
    );
  }

  // ✅ Restaurant exists
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
          <RestaurantAdmin restaurantId={restaurant._id} />
        )}

        {tab === "orders" && (
          <OrdersPanel restaurantId={restaurant._id} />
        )}

      </div>
    </div>
  );
}
