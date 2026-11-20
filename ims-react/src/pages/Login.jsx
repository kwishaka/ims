import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { findUser, setCurrentUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "", email: "", password: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    const user = findUser(form.email.trim(), form.password);

    if (!user) {
      setStatus({ type: "error", text: "Invalid email or password." });
      return;
    }

    if (!form.role) {
      setStatus({ type: "error", text: "Please select your role: Employee, Admin, or Customer Service." });
      return;
    }

    if (user.role !== form.role) {
      setStatus({ type: "error", text: "Invalid credentials for the selected role." });
      return;
    }

    setCurrentUser(user);
    const dashboardRoutes = {
      manager: "/dashboard-manager",
      employee: "/dashboard-employee",
      "customer-service": "/dashboard-customer-service"
    };
    navigate(dashboardRoutes[user.role]);
  }

  return (
    <main className="commerce-login">
      <header className="commerce-login__header">
        <Link className="commerce-login__brand" to="/" aria-label="IMS Portal home">IMS PORTAL</Link>
        <span>Inventory Management System</span>
      </header>

      <section className="commerce-login__content" aria-labelledby="login-heading">
        <div className="commerce-login__intro">
          <p className="commerce-login__eyebrow">YOUR WORKSPACE, ALL IN ONE PLACE</p>
          <h1 id="login-heading">Welcome back</h1>
          <p>Sign in to manage products, track stock, and support your customers.</p>
          <div className="commerce-login__highlights" aria-label="Portal features">
            <span>Inventory at a glance</span>
            <span>Orders in one place</span>
            <span>Support made simple</span>
          </div>
        </div>

        <div className="commerce-login__card">
          <h2>Sign in</h2>
          <p className="commerce-login__card-copy">Enter your account details to continue.</p>

          <form onSubmit={handleSubmit} noValidate className="commerce-login__form">
            <div className="commerce-login__field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="commerce-login__field">
              <label htmlFor="role">Account type</label>
              <select id="role" name="role" value={form.role} onChange={handleChange} required>
                <option value="">Select your role</option>
                <option value="employee">Employee</option>
                <option value="manager">Admin</option>
                <option value="customer-service">Customer Service</option>
              </select>
            </div>

            <div className="commerce-login__field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="commerce-login__submit">Sign in</button>
            {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
          </form>

          <p className="commerce-login__register">
            New employee? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>

      <footer className="commerce-login__footer">
        <p>Shopping as a customer? <Link to="/customer-orders">Browse products and order</Link></p>
        <p>Need help? <Link to="/customer-support">Contact customer service</Link></p>
        <details className="commerce-login__demo">
          <summary>Demo account details</summary>
          <p>Employee: jean.claude@example.com / stock123</p>
          <p>Admin: manager@imsportal.rw / manager123</p>
          <p>Customer service: support@imsportal.rw / support123</p>
        </details>
      </footer>
    </main>
  );
}
