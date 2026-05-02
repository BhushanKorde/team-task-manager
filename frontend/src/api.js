const API_BASE = "http://localhost:5001/api";

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// ── Auth ──
export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const signup = (name, email, password) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });

// ── Tasks ──
export const getTasks = () => request("/tasks");

export const createTask = (data) =>
  request("/tasks", { method: "POST", body: JSON.stringify(data) });

export const updateTask = (id, data) =>
  request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const updateTaskStatus = (id, status) =>
  request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify({ status }) });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: "DELETE" });

// ── Projects ──
export const getProjects = () => request("/projects");

export const createProject = (data) =>
  request("/projects", { method: "POST", body: JSON.stringify(data) });

export const updateProject = (id, data) =>
  request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const addProjectMembers = (projectId, members) =>
  request(`/projects/${projectId}/members`, { method: "PUT", body: JSON.stringify({ members }) });

export const deleteProject = (id) =>
  request(`/projects/${id}`, { method: "DELETE" });

// ── Admin ──
export const createAdmin = (data) =>
  request("/admin/create-admin", { method: "POST", body: JSON.stringify(data) });

export const getMembers = () => request("/admin/members");
