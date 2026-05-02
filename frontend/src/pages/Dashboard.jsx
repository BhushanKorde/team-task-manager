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
        { label: "Total Tasks", value: total, grad: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/15" },
        { label: "Completed", value: completed, grad: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/15" },
        { label: "Pending", value: pending, grad: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/15" },
        { label: "Overdue", value: overdue, grad: "from-rose-600 to-pink-600", shadow: "shadow-rose-500/15" },
      ]
    : [
        { label: "Total Tasks", value: total, grad: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/15" },
        { label: "Completed", value: completed, grad: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/15" },
        { label: "Pending", value: pending, grad: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/15" },
        { label: "In Progress", value: inProgress, grad: "from-sky-500 to-cyan-500", shadow: "shadow-sky-500/15" },
      ];

  const statusColor = (s) =>
    s === "Completed" ? "bg-emerald-500/10 text-emerald-400"
    : s === "In Progress" ? "bg-amber-500/10 text-amber-400"
    : "bg-slate-500/10 text-slate-400";
  const dotColor = (s) =>
    s === "Completed" ? "bg-emerald-400" : s === "In Progress" ? "bg-amber-400" : "bg-slate-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-violet-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner + refresh */}
      <div className="flex items-center justify-between">
        {!isAdmin ? (
          <div className="flex-1 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-slate-100">
              Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
            </h2>
            <p className="text-sm text-slate-400 mt-1">Here's an overview of your assigned tasks.</p>
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={() => fetchTasks(true)}
          disabled={refreshing}
          className="ml-4 p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-slate-400 hover:text-violet-400 hover:border-violet-500/40 transition-all cursor-pointer disabled:opacity-40"
          title="Refresh data"
        >
          <svg className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className={`relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 p-6 shadow-xl ${c.shadow} transition-transform duration-200 hover:-translate-y-1`}>
            <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${c.grad} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className="relative">
              <p className="text-sm font-medium text-slate-400">{c.label}</p>
              <p className="text-3xl font-bold text-slate-100 mt-2">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Overall Progress</h3>
            <span className="text-sm font-bold text-violet-400">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{completed} of {total} tasks completed</p>
        </div>
      )}

      {/* Task list */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">{isAdmin ? "All Tasks" : "My Tasks"}</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            {isAdmin ? "No tasks created yet." : "No tasks assigned to you yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 8).map((task) => (
              <div key={task._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-700/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor(task.status)}`} />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-slate-200 block truncate">{task.title}</span>
                    <span className="text-xs text-slate-500">
                      {task.projectId?.name || "—"}
                      {isAdmin && task.assignedTo && ` · ${task.assignedTo.name}`}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${statusColor(task.status)}`}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
