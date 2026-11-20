import dummyMovements from "../data/movements.json";
import { getProducts } from "./products";
import { getDeliveredOrderQuantity, syncOrderDeliveryStatus } from "./orders";

export const MOVEMENT_STATUSES = ["Pending", "Approved", "Rejected"];

export function getSubmittedMovements() {
  return JSON.parse(localStorage.getItem("submittedMovements") || "[]");
}

export function saveSubmittedMovement(movement) {
  const list = getSubmittedMovements();
  list.push(movement);
  localStorage.setItem("submittedMovements", JSON.stringify(list));
}

// Manager decisions on the read-only dummy history are stored as overrides
// keyed by id; employee-submitted movements are edited in place.
function getStatusOverrides() {
  return JSON.parse(localStorage.getItem("movementStatusOverrides") || "{}");
}

export function updateMovementStatus(id, newStatus) {
  const submitted = getSubmittedMovements();
  const idx = submitted.findIndex((m) => m.id === id);
  if (idx !== -1) {
    submitted[idx].status = newStatus;
    localStorage.setItem("submittedMovements", JSON.stringify(submitted));
    if (submitted[idx].orderId) {
      syncOrderDeliveryStatus(submitted[idx].orderId, submitted[idx].id, newStatus);
    }
  } else {
    const overrides = getStatusOverrides();
    overrides[id] = newStatus;
    localStorage.setItem("movementStatusOverrides", JSON.stringify(overrides));
  }
}

export function getAllMovements() {
  const overrides = getStatusOverrides();
  return dummyMovements
    .map((m) => (overrides[m.id] ? { ...m, status: overrides[m.id] } : m))
    .concat(getSubmittedMovements());
}

// Effective stock = recorded quantity + approved Stock In - approved Stock Out.
// Computed, not stored, so changing a decision never double-counts.
export function getEffectiveQuantity(product, movements) {
  const movementQuantity = movements
    .filter((m) => m.productName === product.name && m.status === "Approved")
    .reduce((qty, m) => qty + (m.type === "Stock In" ? m.quantity : -m.quantity), product.quantity);
  return movementQuantity - getDeliveredOrderQuantity(product.name);
}

export function isLowStock(product, movements) {
  return getEffectiveQuantity(product, movements) <= product.reorderLevel;
}

export function getMovementPrice(movement) {
  const product = getProducts().find((p) => p.name === movement.productName);
  return Number(movement.price ?? product?.price ?? 0);
}

export const badgeClass = (status) => `badge badge-${status.toLowerCase().replace(/\s+/g, "-")}`;
