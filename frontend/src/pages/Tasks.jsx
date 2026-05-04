import { useEffect, useState, useCallback } from "react";
import { getTasks, updateTaskStatus, deleteTask, getProjects } from "../api";

const statusOptions = ["Pending", "In Progress", "Completed"];

const badgeStyle = (s) =>
  s === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  : s === "In Progress" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
  : "bg-text-muted/10 text-text-muted border-slate-500/20";

const dotStyle = (s) =>
  s === "Completed" ? "bg-emerald-400" : s === "In Progress" ? "bg-amber-400" : "bg-slate-400";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
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

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    setError("");
    try {
      const data = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    setError("");
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const isOverdue = (t) =>
    t.status !== "Completed" && t.deadline && new Date(t.deadline) < new Date();

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
    <div className="space-y-6">
      {/* Header + Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">
            {isAdmin ? "All Tasks" : "My Tasks"}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} &middot;{" "}
            {tasks.filter((t) => t.status === "Completed").length} completed
          </p>
        </div>
        <button
          onClick={() => fetchTasks(true)}
          disabled={refreshing}
          className="p-2.5 bg-card border border-border rounded-xl text-text-muted hover:text-primary hover:border-primary/40 transition-all cursor-pointer disabled:opacity-40"
          title="Refresh tasks"
        >
          <svg className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Responsive Tasks List */}
      <div className="bg-card backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden">
        
        {/* Mobile Card View (visible < 768px) */}
        <div className="md:hidden divide-y divide-border">
          {tasks.map((task) => (
            <div key={task._id} className="p-4 space-y-3 hover:bg-bg/50 transition-colors duration-150">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-text truncate">{task.title}</h3>
                  <p className="text-sm text-text-muted mt-0.5">{task.projectId?.name || "—"}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${badgeStyle(task.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyle(task.status)}`} />
                  {task.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-col">
                  {isAdmin && (
                    <span className="text-text-muted text-xs">
                      Assigned: <span className="text-text">{task.assignedTo?.name || "—"}</span>
                    </span>
                  )}
                  <span className={`text-xs mt-1 ${isOverdue(task) ? "text-rose-400 font-medium" : "text-text-muted"}`}>
                    Due: {formatDate(task.deadline)}
                    {isOverdue(task) && <span className="ml-1 text-rose-500">(Overdue)</span>}
                  </span>
                </div>

                <div className="shrink-0 mt-2 sm:mt-0">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        disabled={updating === task._id}
                        className="bg-bg border border-border text-text text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer disabled:opacity-40"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button onClick={() => handleDelete(task._id)} title="Delete task"
                        className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    task.status === "Completed" ? (
                      <span className="text-xs text-emerald-400/60 font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Done
                      </span>
                    ) : (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        disabled={updating === task._id}
                        className="bg-bg border border-border text-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer disabled:opacity-40"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (visible >= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/30">
                <th className="text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Title</th>
                <th className="text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Project</th>
                {isAdmin && (
                  <th className="text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Assigned To</th>
                )}
                <th className="text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">Deadline</th>
                <th className="text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                  {isAdmin ? "Actions" : "Update"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-bg/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text">{task.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-muted">{task.projectId?.name || "—"}</span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <span className="text-sm text-text">
                        {task.assignedTo?.name || "—"}
                      </span>
                      {task.assignedTo?.email && (
                        <span className="block text-xs text-text-muted">{task.assignedTo.email}</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border ${badgeStyle(task.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dotStyle(task.status)}`} />
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${isOverdue(task) ? "text-rose-400 font-medium" : "text-text-muted"}`}>
                      {formatDate(task.deadline)}
                      {isOverdue(task) && <span className="ml-1 text-xs text-rose-500">Overdue</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          disabled={updating === task._id}
                          className="bg-bg border border-border text-text text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer disabled:opacity-40"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button onClick={() => handleDelete(task._id)} title="Delete task"
                          className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      task.status === "Completed" ? (
                        <span className="text-xs text-emerald-400/60 font-medium flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Done
                        </span>
                      ) : (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          disabled={updating === task._id}
                          className="bg-bg border border-border text-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer disabled:opacity-40"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-text-muted border-t border-border">
            {isAdmin ? "No tasks created yet." : "No tasks assigned to you yet."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
