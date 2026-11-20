import { useState } from "react";
import { getProducts } from "../utils/products";
import { getAllMovements, getEffectiveQuantity } from "../utils/movements";
import { getPlacedOrderQuantity, saveOrder } from "../utils/orders";

const initialForm = { customerName: "", customerEmail: "", customerPhone: "", deliveryAddress: "", quantity: "1" };

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value ?? 0));

function getProductIcon(product) {
  if (product.category === "Electronics") return "💻";
  if (product.category === "Furniture") return product.name.toLowerCase().includes("lamp") ? "💡" : "🪑";
  if (product.category === "Stationery") return "📄";
  return "📦";
}

export default function CustomerOrders() {
  const products = getProducts();
  const movements = getAllMovements();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const visibleProducts = selectedCategory === "All"
    ? products
    : products.filter((product) => product.category === selectedCategory);
  const categoryProducts = categories.slice(1).map((category) => ({
    category,
    product: products.find((item) => item.category === category)
  }));
  const heroProducts = products.slice(0, 3);

  const availableQuantity = selectedProduct
    ? Math.max(0, getEffectiveQuantity(selectedProduct, movements) - getPlacedOrderQuantity(selectedProduct.name))
    : 0;
  const total = selectedProduct ? selectedProduct.price * Number(form.quantity || 0) : 0;
  function openOrder(product) {
    setSelectedProduct(product);
    setForm(initialForm);
    setErrors({});
    setStatus(null);
  }

  function closeOrder() {
    setSelectedProduct(null);
    setErrors({});
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setStatus(null);
  }

  function validate() {
    const next = {};
    const quantity = Number(form.quantity);
    if (form.customerName.trim().length < 2) next.customerName = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) next.customerEmail = "Please enter a valid email address.";
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.customerPhone.trim())) next.customerPhone = "Please enter a valid phone number.";
    if (form.deliveryAddress.trim().length < 5) next.deliveryAddress = "Please enter a delivery address.";
    if (form.quantity === "" || !Number.isInteger(quantity) || quantity < 1) {
      next.quantity = "Quantity must be a whole number of at least 1.";
    } else if (quantity > availableQuantity) {
      next.quantity = `Only ${availableQuantity} available to order.`;
    }
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus({ type: "error", text: "Please fix the errors above." });
      return;
    }

    const order = {
      id: Date.now(),
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      deliveryAddress: form.deliveryAddress.trim(),
      productName: selectedProduct.name,
      quantity: Number(form.quantity),
      unitPrice: selectedProduct.price,
      total,
      date: new Date().toISOString().slice(0, 10),
      status: "Placed"
    };
    saveOrder(order);
    closeOrder();
    setStatus({ type: "success", text: `Order #${order.id} has been placed. Stock will be deducted when it is delivered.` });
  }

  return (
    <>
      <main className="customer-store">
        {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}

        <section className="store-hero" aria-labelledby="store-heading">
          <div className="store-hero-copy">
            <p className="store-eyebrow">A BETTER WORKDAY STARTS HERE</p>
            <h2 id="store-heading">Everything your workspace needs.</h2>
            <p>Explore everyday essentials, see what is in stock, and order what you need with ease.</p>
            <a className="store-hero-cta" href="#store-catalog">SHOP NOW <span aria-hidden="true">→</span></a>
            <div className="store-hero-promises">
              <span>Live stock</span>
              <span>Clear pricing</span>
              <span>Easy ordering</span>
            </div>
          </div>
          <div className="store-hero-showcase" aria-hidden="true">
            {heroProducts.map((product, index) => (
              <div className={`store-hero-product store-hero-product-${index}`} key={product.id}>
                {product.image
                  ? <img src={product.image} alt="" />
                  : <span>{getProductIcon(product)}</span>}
                <small>{product.name}</small>
              </div>
            ))}
          </div>
        </section>

        {products.length > 0 && (
          <section className="store-categories-section" id="store-categories" aria-labelledby="categories-heading">
            <div className="store-section-heading">
              <p className="store-eyebrow">SHOP BY CATEGORY</p>
              <h2 id="categories-heading">Find your everyday essentials</h2>
            </div>
            <div className="store-category-grid">
              {categoryProducts.map(({ category, product }, index) => (
                <button
                  className={`store-category-card${selectedCategory === category ? " is-selected" : ""}`}
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className={`store-category-art art-${index % 6}`}>
                    {product.image
                      ? <img src={product.image} alt="" />
                      : <span aria-hidden="true">{getProductIcon(product)}</span>}
                  </span>
                  <span className="store-category-title">{category}</span>
                  <span className="store-category-link">Shop now →</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="store-catalog" id="store-catalog" aria-label="Products available to order">
          {products.length === 0 ? (
            <p>No products are available to order right now.</p>
          ) : (
            <>
              <div className="store-catalog-heading">
                <div>
                  <p className="store-eyebrow">READY WHEN YOU ARE</p>
                  <h2>{selectedCategory === "All" ? "Essentials in stock" : selectedCategory}</h2>
                </div>
                <div className="store-catalog-actions">
                  <span>{visibleProducts.length} items</span>
                  {selectedCategory !== "All" && (
                    <button type="button" onClick={() => setSelectedCategory("All")}>View all</button>
                  )}
                </div>
              </div>
              <div className="store-product-grid">
                {visibleProducts.map((product, index) => {
                  const available = Math.max(
                    0,
                    getEffectiveQuantity(product, movements) - getPlacedOrderQuantity(product.name)
                  );
                  return (
                    <button
                      className="store-product-card"
                      key={product.id}
                      type="button"
                      onClick={() => openOrder(product)}
                      disabled={available < 1}
                      aria-label={`Order ${product.name}, ${formatCurrency(product.price)}, ${available} available`}
                    >
                      <span className={`store-product-art art-${index % 6}`}>
                        {product.image
                          ? <img src={product.image} alt={product.name} />
                          : <span aria-hidden="true">{getProductIcon(product)}</span>}
                      </span>
                      <span className="store-product-info">
                        <span className="store-product-category">{product.category}</span>
                        <span className="store-product-name">{product.name}</span>
                        <span className="store-product-bottom">
                          <strong>{formatCurrency(product.price)}</strong>
                          <span>{available > 0 ? `${available} available` : "Out of stock"}</span>
                        </span>
                        <span className="store-product-cta">{available > 0 ? "ADD TO ORDER +" : "UNAVAILABLE"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="store-promo" aria-labelledby="store-promo-heading">
          <div>
            <p className="store-eyebrow">SHOP WITH CONFIDENCE</p>
            <h2 id="store-promo-heading">Know what is available before you order.</h2>
            <p>Product quantities update with inventory, so you can choose the right items for your workspace.</p>
            <a href="#store-catalog">BROWSE THE CATALOG <span aria-hidden="true">→</span></a>
          </div>
          <div className="store-promo-art" aria-hidden="true"><span>📦</span><span>🪴</span><span>💡</span></div>
        </section>

        <section className="store-benefits" aria-label="Ordering benefits">
          <div><span aria-hidden="true">◉</span><strong>Live availability</strong><small>See current stock before ordering.</small></div>
          <div><span aria-hidden="true">✓</span><strong>Simple ordering</strong><small>Submit your details in a few steps.</small></div>
          <div><span aria-hidden="true">?</span><strong>Customer support</strong><small>We are here when you need help.</small></div>
        </section>

        {selectedProduct && (
          <div className="order-dialog-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeOrder();
          }}>
            <section className="order-dialog" role="dialog" aria-modal="true" aria-labelledby="order-dialog-heading">
              <button className="order-dialog-close" type="button" onClick={closeOrder} aria-label="Close order form">×</button>
              <p className="store-eyebrow">QUICK ORDER</p>
              <h2 id="order-dialog-heading">{selectedProduct.name}</h2>
              {selectedProduct.image && <img className="order-product-image" src={selectedProduct.image} alt={selectedProduct.name} />}
              <p className="order-dialog-summary">
                {formatCurrency(selectedProduct.price)} each · {availableQuantity} currently available
              </p>
              <form onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="customerName">Your name</label>
                  <input id="customerName" name="customerName" value={form.customerName} onChange={handleChange} required autoFocus />
                  <small className="field-error">{errors.customerName}</small>
                </div>
                <div>
                  <label htmlFor="customerEmail">Email address</label>
                  <input id="customerEmail" name="customerEmail" type="email" value={form.customerEmail} onChange={handleChange} required />
                  <small className="field-error">{errors.customerEmail}</small>
                </div>
                <div>
                  <label htmlFor="customerPhone">Phone number</label>
                  <input id="customerPhone" name="customerPhone" type="tel" value={form.customerPhone} onChange={handleChange} placeholder="+250 788 123 456" required />
                  <small className="field-error">{errors.customerPhone}</small>
                </div>
                <div>
                  <label htmlFor="deliveryAddress">Delivery address</label>
                  <textarea id="deliveryAddress" name="deliveryAddress" rows="3" value={form.deliveryAddress} onChange={handleChange} required />
                  <small className="field-error">{errors.deliveryAddress}</small>
                </div>
                <div>
                  <label htmlFor="quantity">Quantity</label>
                  <input id="quantity" name="quantity" type="number" min="1" max={availableQuantity} step="1" value={form.quantity} onChange={handleChange} required />
                  <small className="field-error">{errors.quantity}</small>
                </div>
                <p className="order-total">Order total <strong>{formatCurrency(total)}</strong></p>
                <button className="store-submit" type="submit">Place order</button>
                {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
              </form>
            </section>
          </div>
        )}
      </main>

      <footer className="store-footer">
        <span>IMS MARKET</span>
        <p>Workplace essentials, managed with care.</p>
        <a href="/customer-support">Customer support</a>
        <small>© 2026 IMS Portal</small>
      </footer>
    </>
  );
}
