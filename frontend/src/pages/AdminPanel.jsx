import { useState } from "react";
import { createAdmin } from "../api";

function AdminPanel() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      const data = await createAdmin(form);
      setSuccess(`Admin "${data.user.name}" created successfully!`);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">Admin Panel</h2>
        <p className="text-sm text-text-muted mt-1">Create new admin accounts</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{success}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Admin Name" className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="admin@example.com" className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••" className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-secondary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer">
          {loading ? "Creating…" : "Create Admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
