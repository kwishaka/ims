import { useState } from "react";
import { getProducts, saveProduct, deleteProduct, updateProductPrice, updateProductImage, CATEGORIES } from "../utils/products";
import { getAllMovements, getEffectiveQuantity } from "../utils/movements";

const initial = { name: "", category: "", supplier: "", quantity: "", reorderLevel: "", price: "", image: "" };
const MAX_IMAGE_SIZE = 500 * 1024;

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Number(value ?? 0));

export default function ManageProducts() {
  const [products, setProducts] = useState(() => getProducts());
  const movements = getAllMovements();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const isWhole = (v) => v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0;
  const isValidPrice = (v) => v !== "" && Number(v) >= 0 && Number.isFinite(Number(v));

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter a product name.";
    if (!form.category) next.category = "Please select a category.";
    if (form.supplier.trim().length < 2) next.supplier = "Please enter a supplier.";
    if (!isWhole(form.quantity)) next.quantity = "Quantity must be a whole number (0 or more).";
    if (!isValidPrice(form.price)) next.price = "Price must be a valid number (0 or more).";
    if (!isWhole(form.reorderLevel)) next.reorderLevel = "Reorder level must be a whole number (0 or more).";
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
    try {
      saveProduct({
        id: Date.now(),
        name: form.name.trim(),
        category: form.category,
        supplier: form.supplier.trim(),
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
        price: Number(form.price),
        ...(form.image ? { image: form.image } : {})
      });
      setProducts(getProducts());
      setForm(initial);
      setStatus({ type: "success", text: "Product added." });
    } catch (error) {
      setStatus({ type: "error", text: `Product could not be saved. ${error.message}` });
    }
  }

  function handleDelete(id) {
    deleteProduct(id);
    setProducts(getProducts());
  }

  function startEditingPrice(product) {
    setEditingPriceId(product.id);
    setEditingPrice(String(product.price));
    setPriceError("");
  }

  function handlePriceSave(id) {
    if (editingPrice === "" || !Number.isFinite(Number(editingPrice)) || Number(editingPrice) < 0) {
      setPriceError("Price must be a valid number (0 or more).");
      return;
    }

    try {
      updateProductPrice(id, editingPrice);
      setProducts(getProducts());
      setEditingPriceId(null);
      setEditingPrice("");
      setPriceError("");
      setStatus({ type: "success", text: "Product price updated." });
    } catch (error) {
      setPriceError(error.message);
    }
  }

  function cancelEditingPrice() {
    setEditingPriceId(null);
    setEditingPrice("");
    setPriceError("");
  }

  function handleImageChange(file, onLoad) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus({ type: "error", text: "Choose a JPEG, PNG, or WebP image." });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setStatus({ type: "error", text: "Product photos must be 500 KB or smaller." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus({ type: "error", text: "The selected image could not be read." });
        return;
      }
      onLoad(reader.result);
    };
    reader.onerror = () => {
      setStatus({ type: "error", text: "The selected image could not be read." });
    };
    reader.readAsDataURL(file);
  }

  function saveProductImage(id, image) {
    try {
      updateProductImage(id, image);
      setProducts(getProducts());
      setStatus({ type: "success", text: "Product photo updated." });
    } catch (error) {
      setStatus({ type: "error", text: `Product photo could not be saved. ${error.message}` });
    }
  }

  return (
    <main>
      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Product Catalog</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Supplier</th><th>Qty</th><th>Price</th><th>Reorder at</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const qty = getEffectiveQuantity(p, movements);
                const low = qty <= p.reorderLevel;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="product-name-cell">
                        {p.image && <img className="product-table-image" src={p.image} alt="" />}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{p.supplier}</td>
                    <td>{qty}</td>
                    <td>
                      {editingPriceId === p.id ? (
                        <div className="price-editor">
                          <label className="sr-only" htmlFor={`price-${p.id}`}>Price for {p.name}</label>
                          <input
                            id={`price-${p.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={editingPrice}
                            onChange={(event) => {
                              setEditingPrice(event.target.value);
                              setPriceError("");
                            }}
                            aria-invalid={Boolean(priceError)}
                          />
                          <button type="button" onClick={() => handlePriceSave(p.id)}>Save</button>
                          <button type="button" className="button-danger" onClick={cancelEditingPrice}>Cancel</button>
                          {priceError && <small className="field-error">{priceError}</small>}
                        </div>
                      ) : formatCurrency(p.price)}
                    </td>
                    <td>{p.reorderLevel}</td>
                    <td><span className={`badge badge-${low ? "low-stock" : "in-stock"}`}>{low ? "Low stock" : "In stock"}</span></td>
                    <td>
                      {editingPriceId !== p.id && (
                        <button type="button" onClick={() => startEditingPrice(p)}>Edit price</button>
                      )}{" "}
                      <label className="product-photo-upload">
                        {p.image ? "Change photo" : "Add photo"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          aria-label={`${p.image ? "Change" : "Add"} photo for ${p.name}`}
                          onChange={(event) => {
                            handleImageChange(event.target.files?.[0], (image) => saveProductImage(p.id, image));
                            event.target.value = "";
                          }}
                        />
                      </label>{" "}
                      {p.image && <button type="button" className="button-danger" onClick={() => saveProductImage(p.id, "")}>Remove photo</button>}{" "}
                      <button type="button" className="button-danger" onClick={() => handleDelete(p.id)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
      </section>

      <section aria-labelledby="add-heading">
        <h2 id="add-heading">Add a Product</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name">Product name</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
            <small className="field-error">{errors.name}</small>
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <small className="field-error">{errors.category}</small>
          </div>
          <div>
            <label htmlFor="supplier">Supplier</label>
            <input type="text" id="supplier" name="supplier" value={form.supplier} onChange={handleChange} required />
            <small className="field-error">{errors.supplier}</small>
          </div>
          <div>
            <label htmlFor="price">Price</label>
            <input type="number" id="price" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} required />
            <small className="field-error">{errors.price}</small>
          </div>
          <div>
            <label htmlFor="product-image">Product photo (optional)</label>
            <input
              type="file"
              id="product-image"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                handleImageChange(event.target.files?.[0], (image) => setForm((current) => ({ ...current, image })));
                event.target.value = "";
              }}
            />
            <small className="form-note">JPEG, PNG, or WebP; maximum file size 500 KB.</small>
            {form.image && <img className="product-image-preview" src={form.image} alt="Selected product preview" />}
          </div>
          <div>
            <label htmlFor="quantity">Starting quantity</label>
            <input type="number" id="quantity" name="quantity" min="0" step="1" value={form.quantity} onChange={handleChange} required />
            <small className="field-error">{errors.quantity}</small>
          </div>
          <div>
            <label htmlFor="reorderLevel">Reorder level</label>
            <input type="number" id="reorderLevel" name="reorderLevel" min="0" step="1" value={form.reorderLevel} onChange={handleChange} required />
            <small className="field-error">{errors.reorderLevel}</small>
          </div>
          <button type="submit">Add Product</button>
          {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
        </form>
      </section>
    </main>
  );
}
