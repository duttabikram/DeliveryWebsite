import { useRef, useState } from "react";
const token = localStorage.getItem("token");

const ROUTES = {
  mumbai: [
    { lat: 19.1136, lng: 72.8697 },
    { lat: 19.1098, lng: 72.8672 },
    { lat: 19.1059, lng: 72.8645 },
    { lat: 19.1018, lng: 72.8619 },
    { lat: 19.0981, lng: 72.8589 },
    { lat: 19.0938, lng: 72.8538 },
    { lat: 19.0894, lng: 72.8496 },
    { lat: 19.0851, lng: 72.8451 },
    { lat: 19.0808, lng: 72.8412 },
    { lat: 19.0765, lng: 72.8371 },
    { lat: 19.0721, lng: 72.8328 },
    { lat: 19.0679, lng: 72.8283 },
    { lat: 19.0636, lng: 72.8240 },
    { lat: 19.0594, lng: 72.8198 },
    { lat: 19.0551, lng: 72.8156 },
    { lat: 19.0509, lng: 72.8114 },
    { lat: 19.0467, lng: 72.8071 },
  ],
};


export default function DeliveryDashboard() {
  const [orderId, setOrderId] = useState("ORD101");
  const [route, setRoute] = useState("mumbai");
  const [running, setRunning] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // 🔴 Rider picks up order
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

const getLocation = async () => {
  const res = await fetch(
    `https://deliverywebsite.onrender.com/order/${orderId}`,
    {
      headers: {
         Authorization: `Bearer ${token}`,
      }
    }
  );
  if (!res.ok) {
    const err = await res.json();
    alert("❌ Failed: " + err.error);
    return;
  }
  const ans = await res.json();
  const slat = Number(ans.restaurantId.location.lat);
    const slng = Number(ans.restaurantId.location.lng);
  const elat = Number(ans.deliveryLocation.lat);
  const elng = Number(ans.deliveryLocation.lng);
  alert("start:"+ slat + " " + slng + "end:" + elat + " " + elng);
  
};

  // 📡 Send GPS updates
  const startSending = () => {
    if (running) return;
    setRunning(true);
    indexRef.current = 0;

    timerRef.current = setInterval(async () => {
      const point = ROUTES[route][indexRef.current];

      if (!point) {
        stopSending();
        return;
      }
      
      await fetch("https://deliverywebsite.onrender.com/location", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          orderId,
          lat: point.lat,
          lng: point.lng,
          timestamp: Date.now(),
        }),
      });

      console.log("📍 Sent location:", point);
      indexRef.current += 1;
    }, 2000);
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
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>🚴 Delivery Partner App</h2>

      <div>
        <label>Order ID: </label>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Route: </label>
        <select value={route} onChange={(e) => setRoute(e.target.value)}>
          <option value="mumbai">Mumbai</option>
        </select>
      </div>

      <br />

      <button onClick={markPicked}>📦 Pick Order</button>
       <button onClick={getLocation}>📦 getLocation</button>
      <br /><br />

      <button onClick={startSending} disabled={running}>
        ▶ Start Delivery
      </button>

      <button onClick={stopSending} style={{ marginLeft: 10 }}>
        ⏸ Pause
      </button>
      

      <br /><br />

      <button onClick={markDelivered} style={{ color: "green" }}>
        ✅ Mark Delivered
      </button>

      <p>Status: {running ? "Delivering…" : "Idle"}</p>
    </div>
  );
}
