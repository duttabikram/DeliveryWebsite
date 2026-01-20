import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "./Menu.css";
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



const socket = io("https://deliverywebsite.onrender.com");

export default function TrackOrder({ restaurant, userId, onBack }) {
  const [orders, setOrders] = useState([]);   
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [stepsCovered, setStepsCovered] = useState(0);
  const ROUTE_LENGTH = 17;          // same as fake route length
  const INTERVAL_SECONDS = 2;     // same as delivery interval
  const DELIVERY_FEE = 40;
  const GST_PERCENT = 5;
  const restaurantId = restaurant._id;
 
const subtotal =
  order != null
    ? order?.items?.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0)
    : 0;

const gst = subtotal !== null
  ? Math.round((subtotal * GST_PERCENT) / 100)
  : 0;

const totalPay =
  subtotal !== null
    ? subtotal + gst + DELIVERY_FEE
    : 0;

  useEffect(() => {
  const fetchOrders = async () => {
    const res = await fetch("https://deliverywebsite.onrender.com/order/my-orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setOrders(data);
  };

  fetchOrders();
}, []);

  // 🔁 Poll order status once order exists
  useEffect(() => {
    if (!order) return;

    const fetchOrder = async () => {
      const res = await fetch(
        `https://deliverywebsite.onrender.com/order/${order.orderId}`,{
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
        console.log("frontend rec:" , data);
          setLocation({ lat: data.lat, lng: data.lng });
           setStepsCovered(prev => {
      const next = prev + 1;
      const remaining = ROUTE_LENGTH - next;
      const etaSeconds = Math.max(remaining * INTERVAL_SECONDS, 0);

      setEta( `${etaSeconds} secs` );
      return next;
    });
        
      });
    }
    return () => socket.off("locationUpdate");
  }, [order?.status, order?.orderId]);

  useEffect(() => {
  if (order?.status === "DELIVERED") {
    socket.emit("unsubscribeOrder");
    socket.off("locationUpdate");
  }
}, [order?.status]);
    
const cancelOrder = async () => {
  const confirm = window.confirm("Cancel this order?");
  if (!confirm) return;

  const res = await fetch(
    `https://deliverywebsite.onrender.com/order/${order.orderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "CANCELLED" }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert("Too Late to Cancell");
    return;
  }

  setOrder(data.order); // update UI
};

  if(!order){
    return( 
   <div>
   <h2>📦 My Orders</h2>
   {orders.length === 0 && <p>No orders yet</p>}
   {orders.map(order => (
    <div key={order._id} className="order-card">
      <p><b>Order ID:</b> {order.orderId}</p>
      <p>Status: {order.status}</p>

      {order.status !== "DELIVERED" && (
        <button style={{ background: "green", color: "white" }} className="back-btn" onClick={() => setOrder(order)}>
          Track Order
        </button>
      )}
     </div>
      ))}
     </div>
     );
  }
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
    {order.length === 0 && <p>No orders yet</p>}
      <div className="menu-head">
      <h2 className="menu-title">🍔 Your Order</h2>
      <button style={{ background: "black", color: "white" }} className="back-btn"  onClick={onBack}> ⬅ Back </button>
      </div>
      {/* ORDER SUMMARY */}
      <div style={{ marginBottom: 20 }}>
        <h4>Order ID: {order.orderId}</h4>
        <p>
          Status: <b>{order.status}</b>
        </p>

  {order.status === "PLACED" && (
  <button
    onClick={cancelOrder}
    className="cancel-btn"
    style={{ background: "red", color: "white" }}
  >
    Cancel Order
  </button>
)}


{order.status === "CANCELLED" && (
  <p style={{ color: "red" }}>
    Order cancelled successfully
  </p>
)}
       <ul> {order?.items?.map((item, i) => ( <li key={i}> {item.name} × {item.qty} — ₹{subtotal} </li> ))} </ul>
       <p>GST (5%): ₹{gst}</p>
       <p>Delivery: ₹{DELIVERY_FEE}</p>
       <h3>Total: ₹{totalPay}</h3>
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
                    ["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED"].indexOf(
                      s
                    ) <
                      ["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED"].indexOf(
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
      center={[location.lat, location.lng]}
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
      <Marker position={[location.lat, location.lng]} />
      <RecenterMap position={[location.lat, location.lng]} />
    </MapContainer>
  </div>
)}

    </div>
  );
}
