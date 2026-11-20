import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import { getProducts } from "../utils/products";
import { saveSubmittedMovement } from "../utils/movements";
import { getOrders, setOrderDeliveryMovement } from "../utils/orders";

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value ?? 0));

export default function RecordMovement() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get("orderId"));
  const deliveryOrder = orderId ? getOrders().find((order) => order.id === orderId) : null;
  const products = getProducts();
  const deliveryProduct = deliveryOrder && products.find((product) => product.name === deliveryOrder.productName);
  const [form, setForm] = useState(() => deliveryOrder
    ? { product: deliveryOrder.productName, type: "Stock Out", quantity: String(deliveryOrder.quantity) }
    : { product: "", type: "", quantity: "" });
  const selectedProduct = products.find((p) => p.name === form.product) || null;
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    const next = {};
    const qty = Number(form.quantity);
    if (!form.product) next.product = "Please select a product.";
    if (!form.type) next.type = "Please choose Stock In or Stock Out.";
    if (form.quantity === "" || !Number.isInteger(qty) || qty < 1) next.quantity = "Quantity must be a whole number of at least 1.";
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus({ type: "error", text: "Please fix the errors above." });
      return;
    }
    const movementId = Date.now();
    saveSubmittedMovement({
      id: movementId,
      productName: form.product,
      type: form.type,
      quantity: Number(form.quantity),
      price: Number(selectedProduct?.price ?? 0),
      ...(deliveryOrder ? { orderId: deliveryOrder.id } : {}),
      employeeName: user.fullName,
      employeeEmail: user.email,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending"
    });
    if (deliveryOrder) {
      setOrderDeliveryMovement(deliveryOrder.id, movementId);
    }
    setStatus({ type: "success", text: "Movement submitted for manager approval! Redirecting to your dashboard..." });
    setTimeout(() => navigate("/dashboard-employee"), 1200);
  }

  if (searchParams.has("orderId") && (!deliveryOrder || deliveryOrder.status !== "Placed" || !deliveryProduct)) {
    return (
      <main>
        <section>
          <h2>Delivery cannot be recorded</h2>
          <p>This order is not available for delivery recording. It may already be in progress or no longer exist.</p>
          <Link to="/dashboard-employee">Return to employee dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section aria-labelledby="movement-heading">
        <h2 id="movement-heading">Record a Stock Movement</h2>
        <p>Logged in as <strong>{user.fullName} ({user.email})</strong>. Your request will be{" "}
          <em>Pending</em> until a manager approves it; stock levels only change once it is approved.</p>
        {deliveryOrder && (
          <p className="form-note">
            Recording delivery for order #{deliveryOrder.id}, customer {deliveryOrder.customerName}. The order is marked delivered after this Stock Out movement is approved.
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="product">Product</label>
            <select id="product" name="product" value={form.product} onChange={handleChange} required disabled={Boolean(deliveryOrder)}>
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <small className="field-error">{errors.product}</small>
          </div>
          <div>
            <label htmlFor="type">Movement type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange} required disabled={Boolean(deliveryOrder)}>
              <option value="">Select type</option>
              <option value="Stock In">Stock In (received)</option>
              <option value="Stock Out">Stock Out (issued)</option>
            </select>
            <small className="field-error">{errors.type}</small>
          </div>
          <div>
            <label htmlFor="price-preview">Product price</label>
            <input id="price-preview" type="text" value={selectedProduct ? formatCurrency(selectedProduct.price) : "Select a product"} readOnly />
          </div>
          <div>
            <label htmlFor="quantity">Quantity</label>
            <input type="number" id="quantity" name="quantity" min="1" step="1" value={form.quantity} onChange={handleChange} required readOnly={Boolean(deliveryOrder)} />
            <small className="field-error">{errors.quantity}</small>
          </div>
          <button type="submit">Submit Movement</button>
          {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
        </form>
      </section>
    </main>
  );
}
