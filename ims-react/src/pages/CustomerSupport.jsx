import { useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../utils/orders";
import { createSupportTicket, findCustomerTicket } from "../utils/support";

const initialForm = { customerName: "", customerEmail: "", customerPhone: "", orderId: "", subject: "", message: "" };

export default function CustomerSupport() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [ticketId, setTicketId] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [ticket, setTicket] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const customerOrders = getOrders().filter(
    (order) => order.customerEmail.toLowerCase() === form.customerEmail.trim().toLowerCase()
  );

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setStatus(null);
  }

  function submitIssue(event) {
    event.preventDefault();
    const next = {};
    if (form.customerName.trim().length < 2) next.customerName = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) next.customerEmail = "Please enter a valid email address.";
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.customerPhone.trim())) next.customerPhone = "Please enter a valid phone number.";
    if (form.subject.trim().length < 3) next.subject = "Please enter a subject.";
    if (form.message.trim().length < 10) next.message = "Please describe the issue (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus({ type: "error", text: "Please fix the errors above." });
      return;
    }

    const newTicket = {
      id: Date.now(),
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      orderId: form.orderId || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
      status: "Open",
      createdAt: new Date().toISOString(),
      replies: []
    };
    createSupportTicket(newTicket);
    setForm(initialForm);
    setErrors({});
    setStatus({ type: "success", text: `Issue submitted. Save ticket ID ${newTicket.id} to check for a response.` });
  }

  function checkTicket(event) {
    event.preventDefault();
    const found = findCustomerTicket(ticketId, lookupEmail);
    setTicket(found);
    setLookupError(found ? "" : "We couldn't find a ticket with that ID and email.");
  }

  return (
    <main>
      <section aria-labelledby="support-heading">
        <h2 id="support-heading">Customer Service</h2>
        <p>Tell us about your issue and our customer-service team will respond. Save your ticket ID to check for replies here.</p>
        <form onSubmit={submitIssue} noValidate>
          <div>
            <label htmlFor="customerName">Your name</label>
            <input id="customerName" name="customerName" value={form.customerName} onChange={handleChange} required />
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
            <label htmlFor="orderId">Related order (optional)</label>
            <select id="orderId" name="orderId" value={form.orderId} onChange={handleChange}>
              <option value="">{form.customerEmail ? "Not related to an order" : "Enter your email to find your orders"}</option>
              {customerOrders.map((order) => (
                <option key={order.id} value={order.id}>Order #{order.id} — {order.productName}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" value={form.subject} onChange={handleChange} required />
            <small className="field-error">{errors.subject}</small>
          </div>
          <div>
            <label htmlFor="message">Describe your issue</label>
            <textarea id="message" name="message" rows="5" value={form.message} onChange={handleChange} required />
            <small className="field-error">{errors.message}</small>
          </div>
          <button type="submit">Submit issue</button>
          {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
        </form>
      </section>

      <section aria-labelledby="check-ticket-heading">
        <h2 id="check-ticket-heading">Check a Ticket</h2>
        <form onSubmit={checkTicket}>
          <div>
            <label htmlFor="ticketId">Ticket ID</label>
            <input id="ticketId" value={ticketId} onChange={(event) => setTicketId(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="lookupEmail">Email used for the issue</label>
            <input id="lookupEmail" type="email" value={lookupEmail} onChange={(event) => setLookupEmail(event.target.value)} required />
          </div>
          <button type="submit">Check status</button>
        </form>
        {lookupError && <p className="form-status error" role="alert">{lookupError}</p>}
        {ticket && (
          <div className="support-ticket-result">
            <h3>{ticket.subject}</h3>
            <p>Ticket #{ticket.id} · {ticket.status}</p>
            <p>{ticket.message}</p>
            <h4>Customer-service replies</h4>
            {(ticket.replies || []).length === 0
              ? <p>No reply yet. Please check again later.</p>
              : ticket.replies.map((reply, index) => (
                <article className="support-reply" key={`${ticket.id}-${index}`}>
                  <p>{reply.message}</p>
                  <small>{reply.author} · {new Date(reply.createdAt).toLocaleString()}</small>
                </article>
              ))}
          </div>
        )}
      </section>
      <p className="form-note">This demo stores tickets in this browser only; it does not send email notifications. <Link to="/customer-orders">Back to the store</Link>.</p>
    </main>
  );
}
