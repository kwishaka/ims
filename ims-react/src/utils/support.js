const STORAGE_KEY = "customerSupportTickets";

export function getSupportTickets() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function createSupportTicket(ticket) {
  const tickets = getSupportTickets();
  tickets.push(ticket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function addSupportReply(ticketId, reply) {
  const tickets = getSupportTickets();
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket) {
    throw new Error(`Support ticket not found: ${ticketId}`);
  }

  ticket.replies = [...(ticket.replies || []), reply];
  ticket.status = "Responded";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function findCustomerTicket(ticketId, email) {
  return getSupportTickets().find(
    (ticket) => String(ticket.id) === String(ticketId) &&
      ticket.customerEmail.toLowerCase() === email.trim().toLowerCase()
  ) || null;
}
