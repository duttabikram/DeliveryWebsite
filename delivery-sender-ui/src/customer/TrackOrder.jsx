import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { io } from "socket.io-client";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./Menu.css";
import jsPDF from "jspdf";

const token = localStorage.getItem("token");
const socket = io("https://deliverywebsite.onrender.com");

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function TrackOrder({ restaurant, userId, onBack }) {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [eta, setEta] = useState("");
  const [route, setRoute] = useState([]);

  const DELIVERY_FEE = 40;
  const GST_PERCENT = 5;

  const subtotal =
    order?.items?.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty),
      0
    ) || 0;

  const gst = Math.round((subtotal * GST_PERCENT) / 100);
  const totalPay = subtotal + gst + DELIVERY_FEE;

  // 📦 Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("https://deliverywebsite.onrender.com/order/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    };
    fetchOrders();
  }, []);

  // 🔁 Poll order status
  useEffect(() => {
    if (!order) return;

    const fetchOrder = async () => {
      const res = await fetch(
        `https://deliverywebsite.onrender.com/order/${order.orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setOrder(data);
    };

    fetchOrder();
    const timer = setInterval(fetchOrder, 5000);
    return () => clearInterval(timer);
  }, [order?.orderId]);

  // 🚀 SOCKET TRACKING
  useEffect(() => {
    if (order?.status === "PICKED") {
      socket.emit("subscribeOrder", order.orderId);

      socket.on("locationUpdate", (data) => {
        console.log("📡 Live:", data);

        setLocation([data.lat, data.lng]);
        setEta(data.eta);

        if (data.polyline) {
          const decoded = polyline.decode(data.polyline);
          setRoute(decoded);
        }
      });
    }

    return () => socket.off("locationUpdate");
  }, [order?.status, order?.orderId]);


const downloadReceipt = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Order Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Order ID: ${order.orderId}`, 20, 35);
  doc.text(`Status: ${order.status}`, 20, 45);

  doc.text("Items:", 20, 60);

  let y = 70;

  order.items.forEach((item, i) => {
    doc.text(
      `${i + 1}. ${item.name} x ${item.qty} - Rs. ${item.price * item.qty}`,
      20,
      y
    );
    y += 10;
  });

  y += 10;

  doc.text(`Subtotal: Rs. ${subtotal}`, 20, y);
  y += 10;
  doc.text(`GST (5%): Rs. ${gst}`, 20, y);
  y += 10;
  doc.text(`Delivery Fee: Rs. ${DELIVERY_FEE}`, 20, y);
  y += 10;

  doc.setFontSize(14);
  doc.text(`Total: Rs. ${totalPay}`, 20, y);

  doc.save(`receipt_${order.orderId}.pdf`);
};

  // ❌ Cancel order
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
      alert("Too late to cancel");
      return;
    }

    setOrder(data.order);
  };

  // 📦 Order list
if (!order) {
  return (
    <div>

      {/* HEADER */}
      <h2>📦 My Orders</h2>

      {/* EMPTY STATE */}
      {orders.length === 0 && (
        <p>No orders yet</p>
      )}

      {/* ORDER LIST */}
      {orders.map((order) => (
        <div key={order._id} className="order-card">

          <p>
            <b>Order ID:</b> {order.orderId}
          </p>

          <p>
            Status: {order.status}
          </p>

          {/* TRACK BUTTON */}
          {order.status !== "DELIVERED" && (
            <button
              className="back-btn"
              style={{ background: "green", color: "white" }}
              onClick={() => setOrder(order)}
            >
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
    
    {/* EMPTY STATE */}
    {!order && <p>No orders yet</p>}

    {/* HEADER */}
    <div className="menu-head">
      <h2 className="menu-title">🍔 Your Order</h2>

      <button
        className="back-btn"
        style={{ background: "black", color: "white" }}
        onClick={onBack}
      >
        ⬅ Back
      </button>
      
    </div>

    {/* ORDER SUMMARY */}
    <div style={{ marginBottom: 20 }}>
      <h4>Order ID: {order.orderId}</h4>

      <p>
        Status: <b>{order.status}</b>
      </p>

      <div style={{ marginTop: 10, display: "flex", gap: "10px" }}>
  {order.status === "PLACED" && (
    <button
      className="cancel-btn"
      style={{ background: "red", color: "white" }}
      onClick={cancelOrder}
    >
      Cancel Order
    </button>
  )}

  <button
    className="back-btn"
    style={{ background: "green", color: "white" }}
    onClick={downloadReceipt}
  >
    📄 Download Receipt
  </button>
</div>

      {/* CANCELLED MESSAGE */}
      {order.status === "CANCELLED" && (
        <p style={{ color: "red" }}>
          Order cancelled successfully
        </p>
      )}

      {/* ITEMS LIST */}
      <ul>
        {order?.items?.map((item, i) => (
          <li key={i}>
            {item.name} × {item.qty} — ₹{subtotal}
          </li>
        ))}
      </ul>

      {/* BILLING */}
      <p>Subtotal: ₹{subtotal} + GST (5%): ₹{gst} + Delivery: ₹{DELIVERY_FEE} = Total: ₹{totalPay}</p>
    </div>

    {/* STATUS TIMELINE */}
    <div style={{ marginBottom: 20 }}>
      <h4>Order Progress</h4>

      <p>
        {["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED"].map((s) => {
          const steps = ["PLACED", "ACCEPTED", "PREPARING", "PICKED", "DELIVERED"];

          const isCompleted =
            s === order.status ||
            steps.indexOf(s) < steps.indexOf(order.status);

          return (
            <span
              key={s}
              style={{
                marginRight: 10,
                color: isCompleted ? "green" : "gray",
              }}
            >
              {s}
            </span>
          );
        })}
      </p>
    </div>

    {/* ETA */}
    {order.status === "PICKED" && (
      <>
        <p>🚴 Rider arriving in ~ {eta}</p>

        {!location && (
          <p>📍 Rider picked your order, starting delivery soon</p>
        )}
      </>
    )}

    {/* LIVE MAP */}
    {location && (
        <MapContainer
          center={location}
          zoom={14}
          style={{ height: 300 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={location} />

          {route.length > 0 && (
            <Polyline positions={route} />
          )}
        </MapContainer>
      )}

  </div>
);

}
