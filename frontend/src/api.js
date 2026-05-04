// ✅ Dynamic Base URL for local dev and Railway production
const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

// ──────────────────────────────────────────────
// Auth Headers
// ──────────────────────────────────────────────
function authHeaders() {
  const token = sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ──────────────────────────────────────────────
// Generic Request Handler
// ──────────────────────────────────────────────
async function request(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...authHeaders(), ...options.headers },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
}

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
export const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const signup = (name, email, password) =>
  request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

// ──────────────────────────────────────────────
// TASKS
// ──────────────────────────────────────────────
export const getTasks = () => request("/tasks");

export const createTask = (data) =>
  request("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTask = (id, data) =>
  request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const updateTaskStatus = (id, status) =>
  request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, {
    method: "DELETE",
  });

// ──────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────
export const getProjects = () => request("/projects");

export const createProject = (data) =>
  request("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProject = (id, data) =>
  request(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const addProjectMembers = (projectId, members) =>
  request(`/projects/${projectId}/members`, {
    method: "PUT",
    body: JSON.stringify({ members }),
  });

export const deleteProject = (id) =>
  request(`/projects/${id}`, {
    method: "DELETE",
  });

// ──────────────────────────────────────────────
// ADMIN
// ──────────────────────────────────────────────
export const createAdmin = (data) =>
  request("/admin/create-admin", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMembers = () => request("/admin/members");