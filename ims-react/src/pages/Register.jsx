import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveRegisteredEmployee, emailExists, DEPARTMENTS } from "../utils/auth";

const initial = { fullName: "", email: "", phone: "", department: "", password: "", confirmPassword: "" };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    const next = {};
    const email = form.email.trim();
    if (form.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    else if (emailExists(email)) next.email = "An account with this email already exists.";
    if (!/^0\d{9}$/.test(form.phone.trim())) next.phone = "Phone should be 10 digits starting with 0, e.g. 0788123456.";
    if (!form.department) next.department = "Please select a department.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
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
    saveRegisteredEmployee({
      role: "employee",
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department,
      password: form.password
    });
    setStatus({ type: "success", text: "Account created! Redirecting to login..." });
    setTimeout(() => navigate("/login"), 1200);
  }

  const field = (name, label, type = "text", extra = {}) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input type={type} id={name} name={name} value={form[name]} onChange={handleChange} required {...extra} />
      <small className="field-error">{errors[name]}</small>
    </div>
  );

  return (
    <main>
      <section aria-labelledby="register-heading">
        <h2 id="register-heading">Employee Registration</h2>
        <p className="form-note">Manager accounts are provisioned by the organization
          and aren't self-registered here — this form is for employees only.</p>
        <form onSubmit={handleSubmit} noValidate>
          {field("fullName", "Full name")}
          {field("email", "Email address", "email")}
          {field("phone", "Phone number", "tel", { placeholder: "0788123456" })}
          <div>
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={form.department} onChange={handleChange} required>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <small className="field-error">{errors.department}</small>
          </div>
          {field("password", "Password", "password")}
          {field("confirmPassword", "Confirm password", "password")}
          <button type="submit">Create Account</button>
          {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
        </form>
        <p className="form-note">Already have an account? <Link to="/login">Log in</Link>.</p>
      </section>
    </main>
  );
}
