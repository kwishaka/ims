import { useState } from "react";
import { addSupportReply, getSupportTickets } from "../utils/support";
import { getCurrentUser } from "../utils/auth";

export default function DashboardCustomerService() {
  const user = getCurrentUser();
  const [tickets, setTickets] = useState(() => getSupportTickets());
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  function handleReply(ticketId) {
    const message = (responses[ticketId] || "").trim();
    if (message.length < 2) {
      setErrors({ ...errors, [ticketId]: "Please enter a response." });
      return;
    }

    try {
      addSupportReply(ticketId, {
        message,
        author: user.fullName,
        createdAt: new Date().toISOString()
      });
      setTickets(getSupportTickets());
      setResponses({ ...responses, [ticketId]: "" });
      setErrors({ ...errors, [ticketId]: "" });
      setStatus({ type: "success", text: `Reply saved for ticket #${ticketId}. The customer can check it using their ticket ID and email.` });
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    }
  }

  return (
    <main>
      <section aria-labelledby="service-heading">
        <h2 id="service-heading">Customer Service Inbox</h2>
        <p>Review customer issues and respond. Customers can see saved replies using their ticket ID and email.</p>
        {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
        {tickets.length === 0 ? (
          <p>No customer issues have been submitted.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Ticket</th><th>Customer</th><th>Contact</th><th>Order</th><th>Issue</th><th>Status / Reply</th></tr>
              </thead>
              <tbody>
                {tickets.slice().reverse().map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}<br />{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>{ticket.customerName}</td>
                    <td>{ticket.customerEmail}<br /><a href={`tel:${ticket.customerPhone}`}>{ticket.customerPhone}</a></td>
                    <td>{ticket.orderId ? `#${ticket.orderId}` : "General"}</td>
                    <td><strong>{ticket.subject}</strong><br />{ticket.message}</td>
                    <td>
                      <span>{ticket.status}</span>
                      {(ticket.replies || []).map((reply, index) => (
                        <p className="form-note" key={`${ticket.id}-reply-${index}`}>{reply.message}</p>
                      ))}
                      <label className="sr-only" htmlFor={`reply-${ticket.id}`}>Reply to ticket {ticket.id}</label>
                      <textarea
                        id={`reply-${ticket.id}`}
                        rows="3"
                        value={responses[ticket.id] || ""}
                        onChange={(event) => setResponses({ ...responses, [ticket.id]: event.target.value })}
                      />
                      {errors[ticket.id] && <small className="field-error">{errors[ticket.id]}</small>}
                      <button type="button" onClick={() => handleReply(ticket.id)}>Send reply</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
