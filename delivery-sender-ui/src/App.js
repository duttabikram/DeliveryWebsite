
import { useEffect, useState } from "react";
import CustomerApp from "./customer/CustomerApp";
import RestaurantApp from "./restaurant/RestaurantApp";
import DeliveryApp from "./delivery/DeliveryApp";
import AuthPage from "./auth/AuthPage";
import { getAuthUser } from "./utils/auth";

export default function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuthUser());
  }, []);

  if (!auth) {
    return <AuthPage onAuth={setAuth} />;
  }

  if (auth.role === "CUSTOMER") return <CustomerApp auth={auth} />;
  if (auth.role === "RESTAURANT") return <RestaurantApp auth={auth} />;
  if (auth.role === "DELIVERY") return <DeliveryApp auth={auth} />;

  return <p>Invalid role</p>;
}
