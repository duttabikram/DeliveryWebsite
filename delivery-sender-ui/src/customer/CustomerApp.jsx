import { useState } from "react";
import Restaurants from "./Restaurants";
import Livetracking from "./Livetracking";

export default function CustomerApp({ auth }) {
  const [restaurant, setRestaurant] = useState(null);

  // Step 2 → menu + order + tracking
  if (restaurant) {
    return (
      <Livetracking
        restaurant={restaurant}
        userId={auth.userId}
        onBack={() => setRestaurant(null)}
      />
    );
  }

  // Step 1 → choose restaurant
  return <Restaurants onSelect={setRestaurant} />;
}
