import { NavLink } from "react-router-dom";
import { routes } from "@/routes";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
      <span className="font-bold text-lg text-gray-900 mb-6">Viral Utils</span>
      <nav className="flex flex-col gap-1">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
