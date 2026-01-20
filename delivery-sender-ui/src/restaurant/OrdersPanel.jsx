import { useEffect, useState } from "react";

export default function OrdersPanel({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // 📦 Fetch orders
  const fetchOrders = async () => {
    const res = await fetch(
      `https://deliverywebsite.onrender.com/restaurant/${restaurantId}/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  // ✅ Hooks always run
  useEffect(() => {
    if (!token || !restaurantId) return;
    fetchOrders();
  }, [token, restaurantId]);

  // 🔄 Update order status
  const updateStatus = async (orderId, status) => {
    await fetch(`https://deliverywebsite.onrender.com/order/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchOrders(); // refresh
  };

  // ⛔ Guards AFTER hooks
  if (!token || !restaurantId) {
    return <p>❌ Unauthorized. Please login again.</p>;
  }

  if (loading) {
    return <p>Loading orders…</p>;
  }

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>🍽️ Restaurant Orders</h2>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((order) => (
        <div
          key={order.orderId}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 15,
            borderRadius: 8,
          }}
        >
          <h4>Order ID: {order.orderId}</h4>
          <p>Status: <b>{order.status}</b></p>

          <ul>
            {(order.items || []).map((item, i) => (
              <li key={i}>
                {item.name} × {item.qty}
              </li>
            ))}
          </ul>

          {/* 🔘 ACTION BUTTONS */}
          {/* ACTION BUTTONS */}
           <div style={{ marginTop: 10 }}>
             {order.status === "PLACED" && (
               <>
                 <button
                   style={{ background: "green", color: "white" }}
                   className="back-btn"
                   onClick={() => updateStatus(order.orderId, "ACCEPTED")}
                 >
                   ✅ Accept Order
                 </button>
           
                 <button
                   style={{ background: "red", color: "white", marginLeft: "10px" }}
                   className="back-btn"
                   onClick={() => updateStatus(order.orderId, "CANCELLED")}
                 >
                   ❌ Cancel Order
                 </button>
               </>
             )}        

            {order.status === "CANCELLED" && (
            <div
              style={{
                background: "#ffe6e6",
                color: "#b30000",
                padding: "10px",
                borderRadius: "6px",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              ❌ Order Cancelled
            </div>
                       )}

            {order.status === "ACCEPTED" && (
              <button  style={{ background: "green", color: "white" }} className="back-btn"
                onClick={() =>
                  updateStatus(order.orderId, "PREPARING")
                }
              >
                🍳 Start Preparing
              </button>
            )}
            {order.status === "PREPARING" && (
  <span style={{ color: "orange" }}>
    Waiting for delivery pickup 🚴
  </span>
)}

          </div>
        </div>
      ))}
    </div>
  );
}
