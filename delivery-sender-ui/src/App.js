
import { useEffect, useState } from "react";
import CustomerApp from "./customer/CustomerApp";
import RestaurantApp from "./restaurant/RestaurantApp";
import DeliveryApp from "./delivery/DeliveryApp";
import AuthPage from "./auth/AuthPage";
import { getAuthUser } from "./utils/auth";
import Navbar from "./components/Navbar";
export default function App() {
const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuthUser());
  }, []);

  if (!auth) {
    return <AuthPage onAuth={setAuth} />;
  }

return (
    <>
      {/* 🔝 GLOBAL NAVBAR */}
      <Navbar auth={auth} onLogout={setAuth} />

      {/* 🔁 ROLE BASED APPS */}
      {auth.role === "CUSTOMER" && <CustomerApp auth={auth} />}
      {auth.role === "RESTAURANT" && <RestaurantApp auth={auth} />}
      {auth.role === "DELIVERY" && <DeliveryApp auth={auth} />}
    </>
  );
}
