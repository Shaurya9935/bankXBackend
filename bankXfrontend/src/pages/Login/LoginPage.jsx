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

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Column: Visual Intro & Highlights */}
      <section className="auth-intro">
        <div className="brand-lockup">
          <div className="brand-mark">
            B<span>X</span>
          </div>
          <strong>BankX</strong>
        </div>

        <p className="eyebrow inverse-eyebrow">MODERN BANKING PLATFORM</p>
        <h1>Welcome back to BankX.</h1>
        <p>
          Sign in to manage your balances, transfer funds securely, and track all your accounts in
          real time.
        </p>

        <div className="intro-points">
          <span>
            <CheckCircle2 size={16} /> Instant account verification & activation
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

      {/* Right Column: Sign In Card */}
      <section className="auth-card">
        <div className="brand-lockup">
          <div className="brand-mark small">
            B<span>X</span>
          </div>
          <strong>BankX</strong>
        </div>

        <h2 style={{ marginTop: "24px" }}>Sign in to your account</h2>
        <p className="muted">Enter your registered email and password to continue.</p>

        {error && (
          <div className="alert error" role="alert" style={{ marginTop: "18px" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate style={{ marginTop: "24px" }}>
          <label className="field-label" htmlFor="login-email">
            Email address
            <input
              id="login-email"
              type="email"
              placeholder="e.g. sarah@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              autoComplete="email"
              required
            />
          </label>

          <label className="field-label" htmlFor="login-password">
            Password
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="button primary wide"
            disabled={submitting}
            style={{ marginTop: "8px" }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="text-link">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}

