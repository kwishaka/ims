import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecordMovement from "./pages/RecordMovement";
import DashboardEmployee from "./pages/DashboardEmployee";
import DashboardManager from "./pages/DashboardManager";
import ManageProducts from "./pages/ManageProducts";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerSupport from "./pages/CustomerSupport";
import DashboardCustomerService from "./pages/DashboardCustomerService";
import { getCurrentUser } from "./utils/auth";

export default function App() {
  const location = useLocation();
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);
  const isHomeRoute = ["/", "/home"].includes(location.pathname);
  const isCustomerStore = location.pathname === "/customer-orders";
  const user = getCurrentUser();

  return (
    <>
      {!isAuthRoute && !isHomeRoute && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/customer-support"
          element={user
            ? <Navigate to={user.role === "manager" ? "/dashboard-manager" : user.role === "customer-service" ? "/dashboard-customer-service" : "/dashboard-employee"} replace />
            : <CustomerSupport />}
        />
        <Route path="/customer-orders" element={<CustomerOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/record-movement" element={<ProtectedRoute role="employee"><RecordMovement /></ProtectedRoute>} />
        <Route path="/dashboard-employee" element={<ProtectedRoute role="employee"><DashboardEmployee /></ProtectedRoute>} />
        <Route path="/dashboard-manager" element={<ProtectedRoute role="manager"><DashboardManager /></ProtectedRoute>} />
        <Route path="/dashboard-customer-service" element={<ProtectedRoute role="customer-service"><DashboardCustomerService /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute role="manager"><ManageProducts /></ProtectedRoute>} />
      </Routes>
      {!isAuthRoute && !isHomeRoute && !isCustomerStore && <Footer />}
    </>
  );
}
