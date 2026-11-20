import { Link } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import { getProducts } from "../utils/products";
import { getAllMovements, getEffectiveQuantity, badgeClass, getMovementPrice } from "../utils/movements";
import { getOrders } from "../utils/orders";

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value ?? 0));

export default function DashboardEmployee() {
  const user = getCurrentUser();
  const movements = getAllMovements();
  const products = getProducts();
  const orders = getOrders();
  const ordersToDeliver = orders.filter((order) => order.status === "Placed");
  const mine = movements.filter((m) => m.employeeEmail.toLowerCase() === user.email.toLowerCase());

  return (
    <main>
      <section aria-labelledby="dash-heading">
        <div className="dashboard-header">
          <h2 id="dash-heading">Welcome, {user.fullName}</h2>
          <Link to="/record-movement" className="form-note">Record a stock movement &rarr;</Link>
        </div>

        <h2>Current Stock Levels</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Quantity</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {products.map((p) => {
                const qty = getEffectiveQuantity(p, movements);
                const low = qty <= p.reorderLevel;
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{qty}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td><span className={`badge badge-${low ? "low-stock" : "in-stock"}`}>{low ? "Low stock" : "In stock"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2>Customer Orders to Deliver</h2>
        <p className="form-note">Record each delivery as a Stock Out movement. It will be completed after manager approval.</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Customer</th><th>Product</th><th>Qty</th><th>Delivery address</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {ordersToDeliver.length === 0 ? (
                <tr><td colSpan="6">No customer orders are waiting for delivery.</td></tr>
              ) : (
                ordersToDeliver.map((order) => (
                  <tr key={order.id}>
                    <td>{order.customerName}</td>
                    <td>{order.productName}</td>
                    <td>{order.quantity}</td>
                    <td>{order.deliveryAddress}</td>
                    <td>{order.status}</td>
                    <td><Link to={`/record-movement?orderId=${order.id}`}>Record delivery movement</Link></td>
                  </tr>
                ))
              )}
              {orders.filter((order) => order.status === "Delivery pending").map((order) => (
                <tr key={order.id}>
                  <td>{order.customerName}</td>
                  <td>{order.productName}</td>
                  <td>{order.quantity}</td>
                  <td>{order.deliveryAddress}</td>
                  <td>Delivery pending approval</td>
                  <td>Awaiting manager approval</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>My Movements</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Price</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {mine.length === 0 ? (
                <tr><td colSpan="6">No movements yet. <Link to="/record-movement">Record one</Link>.</td></tr>
              ) : (
                mine.map((m) => (
                  <tr key={m.id}>
                    <td>{m.productName}</td>
                    <td>{m.type}</td>
                    <td>{m.quantity}</td>
                    <td>{formatCurrency(getMovementPrice(m))}</td>
                    <td>{m.date}</td>
                    <td><span className={badgeClass(m.status)}>{m.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
