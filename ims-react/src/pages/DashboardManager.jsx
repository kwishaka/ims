import { useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../utils/products";
import { getAllMovements, updateMovementStatus, isLowStock, MOVEMENT_STATUSES, getMovementPrice, getEffectiveQuantity } from "../utils/movements";
import { getOrders } from "../utils/orders";

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value ?? 0));

export default function DashboardManager() {
  const [movements, setMovements] = useState(() => getAllMovements());
  const [orders, setOrders] = useState(() => getOrders());
  const products = getProducts();

  const lowStock = products.filter((p) => isLowStock(p, movements)).length;
  const pending = movements.filter((m) => m.status === "Pending").length;
  const totalStockValue = products.reduce((sum, product) => sum + getEffectiveQuantity(product, movements) * Number(product.price ?? 0), 0);

  function handleStatusChange(id, newStatus) {
    updateMovementStatus(id, newStatus);
    setMovements(getAllMovements());
    setOrders(getOrders());
  }

  return (
    <main>
      <section aria-labelledby="dash-heading">
        <div className="dashboard-header">
          <h2 id="dash-heading">Manager Dashboard</h2>
          <Link to="/products" className="form-note">Manage products &rarr;</Link>
        </div>

        <div className="stat-row">
          <div className="stat-card"><span className="stat-number">{products.length}</span><span className="stat-label">Products</span></div>
          <div className="stat-card"><span className="stat-number">{lowStock}</span><span className="stat-label">Low stock</span></div>
          <div className="stat-card"><span className="stat-number">{formatCurrency(totalStockValue)}</span><span className="stat-label">Inventory value</span></div>
          <div className="stat-card"><span className="stat-number">{pending}</span><span className="stat-label">Pending approvals</span></div>
          <div className="stat-card"><span className="stat-number">{orders.filter((order) => order.status === "Placed").length}</span><span className="stat-label">Orders to deliver</span></div>
        </div>

        <h2>Customer Orders</h2>
        <p className="form-note">Employees record deliveries as Stock Out movements. Orders are marked delivered after the movement is approved.</p>
        {orders.length === 0 ? (
          <p>No customer orders yet.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Delivery address</th><th>Product</th><th>Qty</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.customerName}</td>
                    <td>{order.customerEmail}</td>
                    <td><a href={`tel:${order.customerPhone || ""}`}>{order.customerPhone || "—"}</a></td>
                    <td>{order.deliveryAddress}</td>
                    <td>{order.productName}</td>
                    <td>{order.quantity}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{order.date}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2>Stock Movements</h2>
        <p className="form-note">Approve or reject each request from the dropdown — stock levels update instantly.</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Employee</th><th>Product</th><th>Type</th><th>Qty</th><th>Price</th><th>Date</th><th>Decision</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.employeeName}</td>
                  <td>{m.productName}</td>
                  <td>{m.type}</td>
                  <td>{m.quantity}</td>
                  <td>{formatCurrency(getMovementPrice(m))}</td>
                  <td>{m.date}</td>
                  <td>
                    {m.orderId && m.status !== "Pending" ? (
                      <span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span>
                    ) : (
                      <select className="status-select" value={m.status} onChange={(e) => handleStatusChange(m.id, e.target.value)}>
                        {MOVEMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
