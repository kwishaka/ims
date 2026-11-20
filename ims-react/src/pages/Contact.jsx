import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Message should be at least 10 characters.";
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setStatus({ type: "success", text: "Thanks — your message has been recorded (demo only, no email is actually sent)." });
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus({ type: "error", text: "Please fix the errors above." });
    }
  }

  return (
    <main>
      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Get in Touch</h2>
        <div className="contact-details">
          <address>KG 11 Ave, Kicukiro District<br />Kigali, Rwanda</address>
          <p>Telephone: <a href="tel:+250793329512">+250 793 329 512</a></p>
          <p>Email: <a href="mailto:sandrineukwishaka6@gmail.com">sandrineukwishaka6@gmail.com</a></p>
        </div>
      </section>

      <section aria-labelledby="form-heading">
        <h2 id="form-heading">Send Us a Message</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name">Full name</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
            <small className="field-error">{errors.name}</small>
          </div>
          <div>
            <label htmlFor="email">Email address</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
            <small className="field-error">{errors.email}</small>
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" value={form.message} onChange={handleChange} required />
            <small className="field-error">{errors.message}</small>
          </div>
          <button type="submit">Send message</button>
          {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
        </form>
      </section>
    </main>
  );
}
