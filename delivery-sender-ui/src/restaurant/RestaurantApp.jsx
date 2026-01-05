
import { useEffect, useState } from "react";
import RestaurantAdmin from "./RestaurantAdmin";
import CreateRestaurant from "./CreateRestaurant";
import OrdersPanel from "./OrdersPanel";


export default function RestaurantApp({ auth }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch("http://localhost:5000/my-restaurant", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRestaurant(data); // ✅ restaurant exists
        } else {
          setRestaurant(null); // ❌ no restaurant
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

  // 🔴 Only show CreateRestaurant if backend says none exists
  if (!restaurant) {
    return <CreateRestaurant onCreated={setRestaurant} />;
  }

  // ✅ Restaurant already exists
  return(
    <>
  <RestaurantAdmin restaurantId={restaurant._id} />
  <OrdersPanel restaurantId={restaurant._id}/>
  </>
  )
}
