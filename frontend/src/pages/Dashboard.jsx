import { useEffect, useState, useCallback } from "react";
import { getTasks } from "../api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchTasks = useCallback(async (showSpinner) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await getTasks();
      setTasks(data.tasks);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchTasks(false); }, [fetchTasks]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchTasks(false), 15000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter((t) => t.status !== "Completed" && t.deadline && new Date(t.deadline) < now).length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards = isAdmin
    ? [
        { label: "Total Tasks", value: total, grad: "from-primary to-secondary", shadow: "shadow-primary/15" },
        { label: "Completed", value: completed, grad: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/15" },
        { label: "Pending", value: pending, grad: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/15" },
        { label: "Overdue", value: overdue, grad: "from-rose-600 to-pink-600", shadow: "shadow-rose-500/15" },
      ]
    : [
        { label: "Total Tasks", value: total, grad: "from-primary to-secondary", shadow: "shadow-primary/15" },
        { label: "Completed", value: completed, grad: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/15" },
        { label: "Pending", value: pending, grad: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/15" },
        { label: "In Progress", value: inProgress, grad: "from-sky-500 to-cyan-500", shadow: "shadow-sky-500/15" },
      ];

  const statusColor = (s) =>
    s === "Completed" ? "bg-emerald-500/10 text-emerald-500"
    : s === "In Progress" ? "bg-amber-500/10 text-amber-500"
    : "bg-text-muted/10 text-text-muted";
  const dotColor = (s) =>
    s === "Completed" ? "bg-emerald-500" : s === "In Progress" ? "bg-amber-500" : "bg-text-muted";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome banner + refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {!isAdmin ? (
          <div className="w-full sm:flex-1 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6 transition-all">
            <h2 className="text-xl font-semibold text-text">
              Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
            </h2>
            <p className="text-sm text-text-muted mt-1">Here's an overview of your assigned tasks.</p>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <button
          onClick={() => fetchTasks(true)}
          disabled={refreshing}
          className="self-end sm:self-auto p-2.5 bg-card/60 border border-border/60 rounded-xl text-text-muted hover:text-primary hover:border-primary/40 transition-all cursor-pointer disabled:opacity-40"
          title="Refresh data"
        >
          <svg className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c) => (
          <div key={c.label} className={`relative overflow-hidden rounded-2xl bg-card border border-border p-5 md:p-6 shadow-md ${c.shadow} transition-transform duration-200 hover:-translate-y-1`}>
            <div className={`absolute top-0 right-0 w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br ${c.grad} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className="relative">
              <p className="text-sm font-medium text-text-muted">{c.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-text mt-2">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-md p-5 md:p-6 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Overall Progress</h3>
            <span className="text-sm font-bold text-primary">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">{completed} of {total} tasks completed</p>
        </div>
      )}

      {/* Task list */}
      <div className="bg-card border border-border rounded-2xl shadow-md p-5 md:p-6 transition-colors">
        <h2 className="text-lg font-semibold text-text mb-4">{isAdmin ? "All Tasks" : "My Tasks"}</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            {isAdmin ? "No tasks created yet." : "No tasks assigned to you yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 8).map((task) => (
              <div key={task._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-bg border border-border hover:border-border/80 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor(task.status)}`} />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-text block truncate">{task.title}</span>
                    <span className="text-xs text-text-muted">
                      {task.projectId?.name || "—"}
                      {isAdmin && task.assignedTo && ` · ${task.assignedTo.name}`}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 self-start sm:self-auto ${statusColor(task.status)}`}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
