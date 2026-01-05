import DeliveryDashboard from "./DeliveryDashboard";

export default function DeliveryApp({ auth }) {
  return <DeliveryDashboard deliveryUserId={auth.userId} />;
}
