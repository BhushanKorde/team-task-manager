import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../api";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("admin"); // "admin" | "member"
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setIsSignup(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSignup && !name) {
      setError("Please enter your name.");
      return;
    }
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (isSignup && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const data = await signup(name, email, password);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setLoading(false);
        navigate("/dashboard");
      } else {
        const data = await login(email, password);
        // Verify role matches selected mode
        if (mode === "admin" && data.user.role !== "admin") {
          setLoading(false);
          setError("This account is not an admin. Please use 'Login as Member'.");
          return;
        }
        if (mode === "member" && data.user.role !== "member") {
          setLoading(false);
          setError("This account is not a member. Please use 'Login as Admin'.");
          return;
        }
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setLoading(false);
        navigate("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-2xl shadow-violet-500/25 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            {isSignup ? "Create your member account" : "Sign in to your account"}
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex gap-2 mb-6 bg-card backdrop-blur-xl border border-border rounded-xl p-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("admin")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              mode === "admin"
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                : "text-text-muted hover:text-text"
            }`}
          >
            Login as Admin
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("member")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              mode === "member"
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                : "text-text-muted hover:text-text"
            }`}
          >
            Login as Member
          </button>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 space-y-5"
        >
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          {/* Name (signup only) */}
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-primary/40 transition-all duration-200"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === "admin" ? "admin@test.com" : "you@example.com"}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-primary/40 transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-primary/40 transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-secondary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {isSignup ? "Creating Account…" : "Signing in…"}
              </span>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>

          {/* Toggle signup (member only) */}
          {mode === "member" && (
            <p className="text-center text-sm text-text-muted">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                  setSuccess("");
                }}
                className="text-primary hover:text-primary font-medium transition-colors cursor-pointer"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </p>
          )}

          {/* Admin hint */}
          {mode === "admin" && (
            <p className="text-center text-xs text-text-muted">
              Default: admin@test.com / admin123
            </p>
          )}
        </form>

        <p className="text-center text-text-muted text-xs mt-6">
          Team Task Manager &middot; Secure Login
        </p>
      </div>
    </div>
  );
}

export default Login;
