import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const hideLoginLink = !user && ["/customer-orders", "/customer-support"].includes(location.pathname);
  const dashboardPath = user?.role === "manager"
    ? "/dashboard-manager"
    : user?.role === "customer-service" ? "/dashboard-customer-service" : "/dashboard-employee";

  function handleLogout(e) {
    e.preventDefault();
    logout();
    navigate("/login");
  }

  if (location.pathname === "/customer-orders") {
    return (
      <>
        <div className="store-announcement">Work essentials, just a few clicks away — check live stock as you shop.</div>
        <header className="site-header site-header--storefront">
          <div className="header-inner">
            <NavLink className="store-brand" to="/customer-orders">IMS<span>MARKET</span></NavLink>
            <nav className="main-nav" aria-label="Store navigation">
              <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><a href="#store-categories">Categories</a></li>
                <li><a href="#store-catalog">Shop</a></li>
                <li><NavLink to="/customer-support">Support</NavLink></li>
                {user
                  ? <>
                      <li><NavLink to={dashboardPath}>Dashboard</NavLink></li>
                      <li><a href="#" onClick={handleLogout}>Logout</a></li>
                    </>
                  : <li><NavLink to="/login">Portal login</NavLink></li>}
              </ul>
            </nav>
          </div>
        </header>
      </>
    );
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <h1>IMS Portal </h1>
        <nav className="main-nav" aria-label="Main navigation">
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
            {!user && <li><NavLink to="/customer-orders">Customer Orders</NavLink></li>}
            {!user && <li><NavLink to="/customer-support">Customer Support</NavLink></li>}
            <li><a href="/time.php">Server Time</a></li>
            {user?.role === "employee" && <li><NavLink to="/record-movement">Record Movement</NavLink></li>}
            {user?.role === "manager" && <li><NavLink to="/products">Products</NavLink></li>}
            {user?.role === "customer-service" && <li><NavLink to="/dashboard-customer-service">Support Inbox</NavLink></li>}
            {!hideLoginLink && !user && <li><NavLink to="/login">Login</NavLink></li>}
            {user && (
              <li>
                <NavLink to={user.role === "manager" ? "/dashboard-manager" : user.role === "customer-service" ? "/dashboard-customer-service" : "/dashboard-employee"}>Dashboard</NavLink>
              </li>
            )}
            {user && <li><a href="#" onClick={handleLogout}>Logout</a></li>}
          </ul>
        </nav>
      </div>
    </header>
  );
}
