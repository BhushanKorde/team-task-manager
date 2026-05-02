import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getProjects, createProject, updateProject, deleteProject, getMembers, addProjectMembers, createTask } from "../api";

/* ── Searchable Multi-Select Dropdown (Portal-based) ── */
function MemberSearch({ members, selected, onToggle, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate position from trigger element
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 256; // max-h-64 = 16rem = 256px
      const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPos({
        top: openAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const close = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const frame = { id: 0 };
    const throttledUpdate = () => {
      cancelAnimationFrame(frame.id);
      frame.id = requestAnimationFrame(updatePosition);
    };
    window.addEventListener("scroll", throttledUpdate, true);
    window.addEventListener("resize", throttledUpdate);
    return () => {
      cancelAnimationFrame(frame.id);
      window.removeEventListener("scroll", throttledUpdate, true);
      window.removeEventListener("resize", throttledUpdate);
    };
  }, [open, updatePosition]);

  const handleOpen = () => {
    updatePosition();
    setOpen(true);
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className="w-full min-h-[44px] px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm cursor-pointer flex flex-wrap gap-1.5 items-center"
      >
        {selected.length > 0 ? (
          selected.map((id) => {
            const m = members.find((x) => x._id === id);
            return m ? (
              <span key={id} className="inline-flex items-center gap-1 bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-md text-xs">
                {m.name}
                <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                  className="hover:text-red-400 cursor-pointer">&times;</button>
              </span>
            ) : null;
          })
        ) : (
          <span className="text-slate-500">{placeholder || "Search members…"}</span>
        )}
      </div>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 99999,
            pointerEvents: "auto",
          }}
          className="bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 max-h-64 overflow-auto"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            autoFocus
            className="w-full px-3 py-2.5 bg-transparent text-slate-100 text-sm placeholder-slate-500 border-b border-slate-700/60 focus:outline-none sticky top-0 bg-[#1e293b]"
          />
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500">No members found.</div>
          ) : (
            filtered.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => onToggle(m._id)}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-slate-700/40 transition-colors cursor-pointer ${
                  selected.includes(m._id) ? "text-violet-300" : "text-slate-300"
                }`}
              >
                <span>{m.name} <span className="text-slate-500">({m.email})</span></span>
                {selected.includes(m._id) && (
                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}


/* ── Projects Page ── */
function Projects() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(null);
  const [addMemberProject, setAddMemberProject] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", deadline: "", members: [] });
  const [taskForm, setTaskForm] = useState({ title: "", assignedTo: "", deadline: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const fetchData = async () => {
    try {
      const pData = await getProjects();
      setProjects(pData.projects);
      if (user.role === "admin") {
        const mData = await getMembers();
        setMembers(mData.members);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const toggleFormMember = (id) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  const openCreateForm = () => {
    setEditId(null);
    setForm({ name: "", description: "", deadline: "", members: [] });
    setShowForm(true);
    clearMessages();
  };

  const openEditForm = (proj) => {
    setEditId(proj._id);
    setForm({
      name: proj.name,
      description: proj.description || "",
      deadline: proj.deadline ? proj.deadline.slice(0, 10) : "",
      members: proj.members.map((m) => m._id),
    });
    setShowForm(true);
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!form.name) { setError("Project name is required."); return; }
    try {
      if (editId) {
        await updateProject(editId, form);
        setSuccess("Project updated!");
      } else {
        await createProject(form);
        setSuccess("Project created!");
      }
      setForm({ name: "", description: "", deadline: "", members: [] });
      setShowForm(false);
      setEditId(null);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    clearMessages();
    try {
      await deleteProject(id);
      setSuccess("Project deleted.");
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleAddMembers = async () => {
    clearMessages();
    if (selectedMembers.length === 0) { setError("Select at least one member."); return; }
    try {
      await addProjectMembers(addMemberProject, selectedMembers);
      setSuccess("Members added!");
      setSelectedMembers([]);
      setAddMemberProject(null);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!taskForm.title || !taskForm.assignedTo) { setError("Title and assigned user are required."); return; }
    try {
      await createTask({ ...taskForm, projectId: showTaskForm });
      setSuccess("Task created!");
      setTaskForm({ title: "", assignedTo: "", deadline: "" });
      setShowTaskForm(null);
      fetchData();
    } catch (err) { setError(err.message); }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

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
    <div className="space-y-6 overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
          <p className="text-sm text-slate-500 mt-1">{projects.length} project(s)</p>
        </div>
        {user.role === "admin" && (
          <button onClick={showForm ? () => { setShowForm(false); setEditId(null); } : openCreateForm}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all cursor-pointer">
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        )}
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className={`text-sm px-4 py-3 rounded-xl border ${error ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
          {error || success}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && user.role === "admin" && (
        <form onSubmit={handleSubmit} className="relative bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 space-y-4 overflow-visible">
          <h3 className="text-sm font-semibold text-slate-300">{editId ? "Edit Project" : "New Project"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Project Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My Project" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the project…" rows={2}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Members</label>
            <MemberSearch members={members} selected={form.members} onToggle={toggleFormMember} placeholder="Search and select members…" />
          </div>

          <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl cursor-pointer">
            {editId ? "Save Changes" : "Create Project"}
          </button>
        </form>
      )}

      {/* Project cards */}
      <div className="grid gap-4 overflow-visible">
        {projects.map((proj) => (
          <div key={proj._id} className="relative bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 overflow-visible" style={{ isolation: "auto" }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-100">{proj.name}</h3>
                {proj.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{proj.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Created by {proj.createdBy?.name || "Admin"}</span>
                  {proj.deadline && <span>Due: {formatDate(proj.deadline)}</span>}
                </div>
              </div>
              {user.role === "admin" && (
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => openEditForm(proj)} title="Edit"
                    className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(proj._id)} title="Delete"
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Members */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs text-slate-500 font-medium">Members:</span>
              {proj.members.length === 0 ? (
                <span className="text-xs text-slate-600">None</span>
              ) : (
                proj.members.map((m) => (
                  <span key={m._id} className="text-xs bg-slate-800/50 text-slate-300 px-2.5 py-1 rounded-md">{m.name}</span>
                ))
              )}
            </div>

            {/* Admin actions */}
            {user.role === "admin" && (
              <div className="flex gap-2 pt-2 border-t border-slate-800/40">
                <button onClick={() => { setAddMemberProject(addMemberProject === proj._id ? null : proj._id); setSelectedMembers([]); clearMessages(); }}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700/60 rounded-lg hover:border-violet-500/40 transition-all cursor-pointer">
                  + Add Members
                </button>
                <button onClick={() => { setShowTaskForm(showTaskForm === proj._id ? null : proj._id); setTaskForm({ title: "", assignedTo: "", deadline: "" }); clearMessages(); }}
                  className="px-3 py-1.5 text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-600/30 transition-all cursor-pointer">
                  + Create Task
                </button>
              </div>
            )}

            {/* Add member panel */}
            {addMemberProject === proj._id && (
              <div className="relative mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 space-y-3 overflow-visible">
                <p className="text-sm font-medium text-slate-300">Select members to add:</p>
                <MemberSearch
                  members={members.filter((m) => !proj.members.some((pm) => pm._id === m._id))}
                  selected={selectedMembers}
                  onToggle={(id) => setSelectedMembers((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])}
                  placeholder="Search members to add…"
                />
                <button onClick={handleAddMembers} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm rounded-lg cursor-pointer">Add Selected</button>
              </div>
            )}

            {/* Create task panel */}
            {showTaskForm === proj._id && (
              <form onSubmit={handleCreateTask} className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 space-y-3">
                <p className="text-sm font-medium text-slate-300">Create task for {proj.name}:</p>
                <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title" className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer">
                  <option value="">Assign to member…</option>
                  {proj.members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
                <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm rounded-lg cursor-pointer">Create Task</button>
              </form>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800/60">No projects found.</div>
        )}
      </div>
    </div>
  );
}

export default Projects;
