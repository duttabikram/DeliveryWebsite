import { useEffect, useState } from "react";
import "./Menu.css";
const token = localStorage.getItem("token");


export default function PlaceOrder({ restaurant, userId, onBack }) {
  const [location, setLocation] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const DELIVERY_FEE = 40;
  const GST_PERCENT = 5;
  const restaurantId = restaurant._id;

const [menu, setMenu] = useState([]);
const [cart, setCart] = useState([]);

const subtotal =
  cart.length > 0
    ? cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    : null;

const gst = subtotal !== null
  ? Math.round((subtotal * GST_PERCENT) / 100)
  : null;

const totalPay =
  subtotal !== null
    ? subtotal + gst + DELIVERY_FEE
    : null;

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


useEffect(() => {
  fetch(`https://deliverywebsite.onrender.com/restaurant/${restaurantId}/food`)
    .then(res => res.json())
    .then(data => setMenu(data));
}, []);

  
const payNow = async () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  if (location === null) {
    alert("Please allow Location");
    return;
  }
  setPlacing(true);

  const res = await fetch("https://deliverywebsite.onrender.com/payment/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: totalPay }),
  });

  const razorpayOrder = await res.json();

  const options = {
    key: "rzp_test_S5fsqMAdLj2MjJ",
    amount: razorpayOrder.amount,
    currency: "INR",
    order_id: razorpayOrder.id,

    handler: async function (response) {
      await verifyPayment(response);
    },
  };

  const razor = new window.Razorpay(options);
  razor.open();

  setPlacing(false);
};

const verifyPayment = async (response) => {
  const res = await fetch("https://deliverywebsite.onrender.com/payment/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(response),
  });

  const data = await res.json();

  if (data.success) {
    placeOrder(data.paymentId); // ✅ only now create order
  } else {
    alert("Payment failed");
  }
};

  // 🟢 PLACE ORDER (Customer action)
const placeOrder = async (paymentId) => {
  setPlacing(true);
  
  
  const res = await fetch("https://deliverywebsite.onrender.com/order/create", {
    method: "POST",
     headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
    body: JSON.stringify({
      restaurantId,
      items: cart.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
      deliveryLocation: location,
      paymentMode: "ONLINE",
      paymentId,
    }),
  });

  const data = await res.json();
  if(!res.ok){
    alert("Error Placing Order");
    setPlacing(false);
    return;
  }
  else{
    alert("Order Placed Successfully");
    setPlacing(false);
  }
};
   
  const addToCart = (food) => {
  setCart(prev => {
    const existing = prev.find(i => i._id === food._id);
    if (existing) {
      return prev.map(i =>
        i._id === food._id ? { ...i, qty: i.qty + 1 } : i
      );
    }
    return [...prev, { ...food, qty: 1 }];
  });
};
           
  return (
    <div className="menu-page">
      <div className="menu-head">
       <h2 className="menu-title" >🍽️ Restaurant Menu</h2>
       <button style={{ background: "black", color: "white" }} className="back-btn"  onClick={onBack}> ⬅ Back </button>
       </div>
      {menu.length === 0 && <p className="empty-cart">No items yet</p>}

      <div className="food-grid">
        {menu.map(food => (
          <div key={food._id} className="food-card">
            {/* FOOD IMAGE */}
            <div className="food-image">
              <img
                src={food.imageUrl || "https://via.placeholder.com/300x180"}
                alt={food.name}
                
              />
              {!food.available && (
                <div className="overlay">Unavailable</div>
              )}
            </div>

            {/* FOOD INFO */}
            <div className="food-body">
              <h4>{food.name}</h4>
              <p className="price">₹{food.price}</p>

              <button
                className="add-btn"
                disabled={!food.available}
                onClick={() => addToCart(food)}
              >
                ➕ Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <h3 className="cart-title">🛒 Cart</h3>

      {cart.length === 0 && <p className="empty-cart">No items yet</p>}

      <div className="cart-list">
        {cart.map(item => (
          <p key={item._id}>
            {item.name} × {item.qty}
          </p>
        ))}
      </div>
      {!location && !locationError && <p>📍 Detecting your location…</p>}
      {locationError && <p style={{ color: "red" }}>{locationError}</p>}
      <button
        className="place-order-btn"
         onClick={payNow}
         disabled={placing}
       >
         {placing ? "Redirecting to payment..." : "💳 Pay & Place Order"}
         </button>

    </div>
  );
}

