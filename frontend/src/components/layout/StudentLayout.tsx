import { useState } from "react";
import { Outlet } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import { Header } from "./Header";

export function StudentLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
