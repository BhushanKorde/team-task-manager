import { useLocation } from "react-router-dom";

function Topbar() {
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/tasks": isAdmin ? "All Tasks" : "My Tasks",
    "/projects": "Projects",
    "/admin": "Admin Panel",
  };

  const title = pageTitles[location.pathname] || "Team Task Manager";



  return (
    <header className="h-16 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between px-6">
      {/* Page title */}
      <h1 className="text-xl font-semibold text-slate-100">{title}</h1>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-200">
            {user.email || "User"}
          </p>
          <p className="text-xs text-slate-500 capitalize">{user.role || "member"}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/20">
          {(user.email || "U")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
