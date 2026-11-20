import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

const roleHome = {
  manager: "/dashboard-manager",
  employee: "/dashboard-employee",
  "customer-service": "/dashboard-customer-service"
};

export default function Home() {
  const user = getCurrentUser();
  const destination = user ? roleHome[user.role] : "/customer-orders";

  return <Navigate to={destination || "/login"} replace />;
}
