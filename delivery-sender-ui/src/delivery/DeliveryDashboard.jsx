import { useRef, useState } from "react";
import polyline from "@mapbox/polyline";

const token = localStorage.getItem("token");

// 🔄 Decode polyline from backend
const decodePolyline = (encoded) => {
  return polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
};

export default function DeliveryDashboard() {
  const [orderId, setOrderId] = useState("ORD101");
  const [running, setRunning] = useState(false);

  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const routeRef = useRef([]);

  // 🔴 Mark order picked
  const markPicked = async () => {
    const res = await fetch(
      `https://deliverywebsite.onrender.com/order/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "PICKED" }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert("❌ Failed: " + err.error);
      return;
    }

    alert("📦 Order picked. Start delivery!");
  };

  // 🧠 Get route from YOUR backend (NOT Google directly)
  const getRouteFromBackend = async () => {
    const res = await fetch(
      `https://deliverywebsite.onrender.com/order/${orderId}/route`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("❌ Failed to fetch route");
      return [];
    }

    const data = await res.json();

    console.log("ETA:", data.eta);

    return decodePolyline(data.polyline);
  };

  // 🚴 Start sending live location
  const startSending = async () => {
  if (running) return;

  setRunning(true);

  const dynamicRoute = await getRouteFromBackend();

  if (!dynamicRoute.length) {
    alert("❌ No route found");
    setRunning(false);
    return;
  }

  routeRef.current = dynamicRoute;
  indexRef.current = 0;

  let step = 0;

  timerRef.current = setInterval(async () => {
    if (indexRef.current >= routeRef.current.length - 1) {
      stopSending();
      return;
    }

    const current = routeRef.current[indexRef.current];
    const next = routeRef.current[indexRef.current + 1];

    // 🔥 Interpolate between points (smooth movement)
    const lat =
      current.lat + (next.lat - current.lat) * (step / 5);
    const lng =
      current.lng + (next.lng - current.lng) * (step / 5);

    await fetch("https://deliverywebsite.onrender.com/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId,
        lat,
        lng,
        timestamp: Date.now(),
      }),
    });

    console.log("📍 Smooth:", lat, lng);

    step++;

    if (step >= 5) {
      step = 0;
      indexRef.current++;
    }
  }, 1000); // smoother updates
};

  // 🛑 Stop sending
  const stopSending = () => {
    clearInterval(timerRef.current);
    setRunning(false);
  };

  // ✅ Mark delivered
  const markDelivered = async () => {
    stopSending();

    const res = await fetch(
      `https://deliverywebsite.onrender.com/order/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "DELIVERED" }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert("❌ Failed: " + err.error);
      return;
    }

    alert("✅ Order delivered!");
  };

  return (
     <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffe4ec, #f6f7fb)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "28px",
          borderRadius: "16px",
          background: "white",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          🚴 Delivery Partner App
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "500" }}>Order ID</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          onClick={markPicked}
          style={{
            width: "100%",
            padding: "12px",
            background: "#ff6b35",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          📦 Pick Order
        </button>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={startSending}
            disabled={running}
            style={{
              flex: 1,
              padding: "12px",
              background: running ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ▶ Start
          </button>

          <button
            onClick={stopSending}
            style={{
              flex: 1,
              padding: "12px",
              background: "#607d8b",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ⏸ Pause
          </button>
        </div>

        <button
          onClick={markDelivered}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ✅ Mark Delivered
        </button>

        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            fontWeight: "500",
            color: running ? "#4caf50" : "#999",
          }}
        >
          Status: {running ? "🚚 Delivering…" : "Idle"}
        </p>
      </div>
    </div>
  );
}