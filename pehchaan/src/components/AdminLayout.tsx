import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r px-4 py-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-primary text-white" : "hover:bg-muted"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/matches"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-primary text-white" : "hover:bg-muted"
              }`
            }
          >
            Matches
          </NavLink>

          <NavLink
            to="/admin/cases"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-primary text-white" : "hover:bg-muted"
              }`
            }
          >
            Cases
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
