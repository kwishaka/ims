export const CATEGORIES = ["Electronics", "Furniture", "Stationery", "Other"];

const SEED_PRODUCTS = [
  { id: 1, name: "Office Chairs", category: "Furniture", supplier: "Kigali Office Supplies", quantity: 50, reorderLevel: 15, price: 120, image: "/images/office-chair.jpg" },
  { id: 2, name: "Laptops", category: "Electronics", supplier: "TechHub Rwanda", quantity: 25, reorderLevel: 10, price: 950, image: "/images/laptop-desk.jpg" },
  { id: 3, name: "Printer Paper (Reams)", category: "Stationery", supplier: "PaperWorld Ltd", quantity: 200, reorderLevel: 50, price: 18, image: "/images/printer-paper.jpg" },
  { id: 4, name: "Desk Lamps", category: "Furniture", supplier: "Kigali Office Supplies", quantity: 8, reorderLevel: 10, price: 60, image: "/images/desk-lamp.jpg" }
];

export function getProducts() {
  const stored = localStorage.getItem("inventoryProducts");
  const products = stored ? JSON.parse(stored) : SEED_PRODUCTS;
  const normalized = products.map((product) => {
    const seedImage = SEED_PRODUCTS.find((seedProduct) => seedProduct.id === product.id)?.image;
    return {
      ...product,
      ...(!product.image && seedImage ? { image: seedImage } : {}),
      price: Number(product.price ?? 0)
    };
  });

  if (!stored) {
    localStorage.setItem("inventoryProducts", JSON.stringify(normalized));
    return normalized;
  }

  localStorage.setItem("inventoryProducts", JSON.stringify(normalized));
  return normalized;
}

export function saveProduct(product) {
  const list = getProducts();
  list.push(product);
  localStorage.setItem("inventoryProducts", JSON.stringify(list));
}

export function updateProductPrice(id, price) {
  const value = Number(price);
  if (price === "" || !Number.isFinite(value) || value < 0) {
    throw new Error("Product price must be a valid number (0 or more).");
  }

  const list = getProducts();
  const product = list.find((item) => item.id === id);
  if (!product) {
    throw new Error(`Product not found: ${id}`);
  }

  product.price = value;
  localStorage.setItem("inventoryProducts", JSON.stringify(list));
}

export function updateProductImage(id, image) {
  const list = getProducts();
  const product = list.find((item) => item.id === id);
  if (!product) {
    throw new Error(`Product not found: ${id}`);
  }

  product.image = image;
  localStorage.setItem("inventoryProducts", JSON.stringify(list));
}

export function deleteProduct(id) {
  localStorage.setItem("inventoryProducts", JSON.stringify(getProducts().filter((p) => p.id !== id)));
}
