import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";
const token = localStorage.getItem("token");


function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position);
  }, [position]);

  return null;
}


delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});



const socket = io("http://localhost:5000");

export default function Livetracking({ restaurant, userId, onBack }) {
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [placing, setPlacing] = useState(false);

  const restaurantId = restaurant._id;

const [menu, setMenu] = useState([]);
const [cart, setCart] = useState([]);

useEffect(() => {
  fetch(`http://localhost:5000/restaurant/${restaurantId}/food`)
    .then(res => res.json())
    .then(data => setMenu(data));
}, []);

  

  // 🟢 PLACE ORDER (Customer action)
const placeOrder = async () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  setPlacing(true);



  
  const res = await fetch("http://localhost:5000/order", {
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
    }),
  });

  const data = await res.json();
  setOrder(data);
  setPlacing(false);
};


  // 🔁 Poll order status once order exists
  useEffect(() => {
    if (!order) return;

    const fetchOrder = async () => {
      const res = await fetch(
        `http://localhost:5000/order/${order.orderId}`,{
          headers: {
          Authorization: `Bearer ${token}`,
        },
        }
      );
      const data = await res.json();
      setOrder(data);
    };

    fetchOrder();
    const timer = setInterval(fetchOrder, 5000);
    return () => clearInterval(timer);
  }, [order?.orderId]);

  // 🔴 WebSocket live tracking (only when PICKED)
  useEffect(() => {
    if (order?.status === "PICKED") {
      socket.emit("subscribeOrder", order.orderId);

      socket.on("locationUpdate", (data) => {
        if (data.orderId === order.orderId) {
          setLocation([data.lat, data.lng]);
          setEta("15 mins");
        }
      });
    }

    return () => socket.off("locationUpdate");
  }, [order?.status]);
   
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

  // 🟡 NO ORDER YET UI
  if (!order) {
  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>🍽️ Restaurant Menu</h2>

     {menu.map(food => (
  <div key={food._id} style={{ marginBottom: 10 }}>
    <b>{food.name}</b> — ₹{food.price}

    {!food.available && (
      <span style={{ color: "red", marginLeft: 10 }}>
        (Unavailable)
      </span>
    )}

    <button
      style={{ marginLeft: 10 }}
      disabled={!food.available}
      onClick={() => addToCart(food)}
    >
      ➕ Add
    </button>
  </div>
))}


      <hr />

      <h3>🛒 Cart</h3>
      {cart.length === 0 && <p>No items yet</p>}

      {cart.map(item => (
        <p key={item._id}>
          {item.name} × {item.qty}
        </p>
      ))}

      <button onClick={placeOrder} disabled={placing}>
        {placing ? "Placing Order..." : "🛒 Place Order"}
      </button>
    </div>
  );
}

  // 🟢 ORDER EXISTS UI
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🍔 Your Order</h2>

      {/* ORDER SUMMARY */}
      <div style={{ marginBottom: 20 }}>
        <h4>Order ID: {order.orderId}</h4>
        <p>
          Status: <b>{order.status}</b>
        </p>

       <ul> {order.items.map((item, i) => ( <li key={i}> {item.name} × {item.qty} — ₹{item.price} </li> ))} </ul>

      </div>

      {/* STATUS TIMELINE */}
      <div style={{ marginBottom: 20 }}>
        <h4>Order Progress</h4>
        <p>
          {["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED"].map(
            (s) => (
              <span
                key={s}
                style={{
                  marginRight: 10,
                  color:
                    s === order.status ||
                    ["PLACED", "ACCEPTED", "PREPARING", "PICKED"].indexOf(
                      s
                    ) <
                      ["PLACED", "ACCEPTED", "PREPARING", "PICKED"].indexOf(
                        order.status
                      )
                      ? "green"
                      : "gray",
                }}
              >
                {s}
              </span>
            )
          )}
        </p>
      </div>

      {/* ETA */}
      {order.status === "PICKED" && (
        <p>🚴 Rider arriving in ~ {eta}</p>
      )}
      {order.status === "PICKED" && !location && ( 
  <p>📍 Rider picked your order, starting delivery soon</p>
)}

      {/* LIVE MAP */}
     {location && (
  <div
    style={{
      width: "240px",       
      height: "240px",
      marginTop: "10px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #ddd",
    }}
  >
    <MapContainer
      center={location}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      whenReady={(map) => {
        setTimeout(() => map.target.invalidateSize(), 100);
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={location} />
      <RecenterMap position={location} />
    </MapContainer>
  </div>
)}

    </div>
  );
}
