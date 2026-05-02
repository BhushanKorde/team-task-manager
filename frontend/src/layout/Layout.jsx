import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 ml-64 flex flex-col overflow-visible">
        <Topbar />
        <main className="flex-1 p-6 overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
