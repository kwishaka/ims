// Simulated auth: no backend at this stage. Seed accounts, employee
// sign-ups kept in localStorage, current session in sessionStorage.

const SEED_USERS = [
  { role: "manager", email: "manager@imsportal.rw", password: "manager123", fullName: "Inventory Manager" },
  { role: "employee", email: "jean.claude@example.com", password: "stock123", fullName: "Jean Claude", department: "Warehouse" },
  { role: "customer-service", email: "support@imsportal.rw", password: "support123", fullName: "Customer Service" }
];

export const DEPARTMENTS = ["Warehouse", "Procurement", "Sales", "IT"];

export function getRegisteredEmployees() {
  return JSON.parse(localStorage.getItem("registeredEmployees") || "[]");
}

export function saveRegisteredEmployee(employee) {
  const list = getRegisteredEmployees();
  list.push(employee);
  localStorage.setItem("registeredEmployees", JSON.stringify(list));
}

export function emailExists(email) {
  return SEED_USERS.concat(getRegisteredEmployees()).some(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export function findUser(email, password) {
  return SEED_USERS.concat(getRegisteredEmployees()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function setCurrentUser(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = sessionStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  sessionStorage.removeItem("currentUser");
}
