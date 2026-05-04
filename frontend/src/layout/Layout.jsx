import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ease-in-out w-full max-w-full">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
