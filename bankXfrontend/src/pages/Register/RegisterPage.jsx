import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeftRight,
  WalletCards,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../auth";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    const { fullName, email, phone, dateOfBirth, password } = formData;

    const nameRegex = /^[a-zA-Z][a-zA-Z\s.'-]{1,98}[a-zA-Z]$/;
    if (!fullName || !nameRegex.test(fullName.trim())) {
      return "Please enter a valid full name (letters, spaces, 2-100 characters).";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim().toLowerCase())) {
      return "Please provide a valid email address.";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
      return "Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
    }

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateOfBirth || !dobRegex.test(dateOfBirth)) {
      return "Please select your date of birth in YYYY-MM-DD format.";
    }

    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        address: formData.address.trim(),
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Failed to create account. Please check your information.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Column: Visual Intro & Platform Highlights */}
      <section className="auth-intro">
        <div className="brand-lockup">
          <div className="brand-mark">
            B<span>X</span>
          </div>
          <strong>BankX</strong>
        </div>

        <p className="eyebrow inverse-eyebrow">MODERN BANKING PLATFORM</p>
        <h1>Open an account with BankX.</h1>
        <p>
          Experience next-generation personal banking. Instant provisioning, verified transactions,
          and complete control of your financial assets in one place.
        </p>

        <div className="intro-points">
          <span>
            <CheckCircle2 size={16} /> Instant account setup & automated provisioning
          </span>
          <span>
            <ShieldCheck size={16} /> JWT-secured banking with 256-bit password hashing
          </span>
          <span>
            <ArrowLeftRight size={16} /> Real-time peer transfers, deposits & withdrawals
          </span>
          <span>
            <WalletCards size={16} /> ACID-compliant ledger with immutable transaction history
          </span>
        </div>
      </section>

      {/* Right Column: Register Form Card */}
      <section className="auth-card">
        <div className="brand-lockup">
          <div className="brand-mark small">
            B<span>X</span>
          </div>
          <strong>BankX</strong>
        </div>

        <h2 style={{ marginTop: "24px" }}>Create your account</h2>
        <p className="muted">
          Fill in your personal details below to register for online banking.
        </p>

        {error && (
          <div className="alert error" role="alert" style={{ marginTop: "18px" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate style={{ marginTop: "20px" }}>
          {/* Full Name */}
          <label className="field-label" htmlFor="register-fullName">
            Full name
            <input
              id="register-fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>

          {/* Email Address */}
          <label className="field-label" htmlFor="register-email">
            Email address
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="e.g. sarah@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          {/* Phone and Date of Birth row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            <label className="field-label" htmlFor="register-phone">
              Phone number
              <input
                id="register-phone"
                name="phone"
                type="tel"
                placeholder="10-digit (e.g. 9876543210)"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </label>

            <label className="field-label" htmlFor="register-dateOfBirth">
              Date of birth
              <input
                id="register-dateOfBirth"
                name="dateOfBirth"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {/* Residential Address */}
          <label className="field-label" htmlFor="register-address">
            <span>
              Residential address{" "}
              <small style={{ fontWeight: 400, color: "#8992a2" }}>(Optional)</small>
            </span>
            <input
              id="register-address"
              name="address"
              type="text"
              placeholder="e.g. 42 Wallaby Way, Suite 100"
              value={formData.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </label>

          {/* Password */}
          <label className="field-label" htmlFor="register-password">
            Password
            <div className="password-field">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="button primary wide"
            disabled={submitting}
            style={{ marginTop: "8px" }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                <span>Creating account...</span>
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Link to Login */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="text-link">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}

