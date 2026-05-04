import { useLocation } from "react-router-dom";
import { useState } from "react";

function Topbar({ onMenuClick }) {
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/tasks": isAdmin ? "All Tasks" : "My Tasks",
    "/projects": "Projects",
    "/admin": "Admin Panel",
  };

  const title = pageTitles[location.pathname] || "Team Task Manager";

  return (
    <header className="h-16 bg-card/60 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 transition-colors duration-300 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text rounded-lg hover:bg-border/30 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <h1 className="text-lg md:text-xl font-semibold text-text">{title}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-muted hover:text-text hover:bg-border/50 rounded-full transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        {/* User info */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-text">
            {user.email || "User"}
          </p>
          <p className="text-xs text-text-muted capitalize">{user.role || "member"}</p>
        </div>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
          {(user.email || "U")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
