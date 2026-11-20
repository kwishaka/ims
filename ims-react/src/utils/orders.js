export const ORDER_STATUSES = ["Placed", "Delivery pending", "Delivered", "Cancelled"];

const STORAGE_KEY = "customerOrders";

export function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  const orders = getOrders();
  const order = orders.find((item) => item.id === id);
  if (!order) {
    throw new Error(`Order not found: ${id}`);
  }
  if (order.status !== "Placed") {
    throw new Error(`Cannot update an order with status "${order.status}".`);
  }

  order.status = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function setOrderDeliveryMovement(id, movementId) {
  const orders = getOrders();
  const order = orders.find((item) => item.id === id);
  if (!order) {
    throw new Error(`Order not found: ${id}`);
  }
  if (order.status !== "Placed") {
    throw new Error(`Cannot record delivery for an order with status "${order.status}".`);
  }

  order.status = "Delivery pending";
  order.movementId = movementId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function syncOrderDeliveryStatus(orderId, movementId, movementStatus) {
  const orders = getOrders();
  const order = orders.find((item) => item.id === orderId && item.movementId === movementId);
  if (!order) return;

  if (movementStatus === "Approved") {
    order.status = "Delivered";
  } else if (movementStatus === "Rejected") {
    order.status = "Placed";
    delete order.movementId;
  } else {
    order.status = "Delivery pending";
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getDeliveredOrderQuantity(productName) {
  return getOrders()
    .filter((order) => order.productName === productName && order.status === "Delivered" && !order.movementId)
    .reduce((quantity, order) => quantity + order.quantity, 0);
}

export function getPlacedOrderQuantity(productName) {
  return getOrders()
    .filter((order) => order.productName === productName && ["Placed", "Delivery pending"].includes(order.status))
    .reduce((quantity, order) => quantity + order.quantity, 0);
}
