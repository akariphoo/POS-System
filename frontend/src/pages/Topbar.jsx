import { Search, Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Topbar({ user }) {
  const location = useLocation();
  
  // Get user initials
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return "BS";
  };

  // Determine breadcrumb based on route
  const getBreadcrumb = () => {
    if (location.pathname.includes("point-of-sale") || location.pathname.includes("pos")) {
      return ["Accounting", "Point of Sale"];
    }
    return ["Dashboard"];
  };

  const breadcrumbs = getBreadcrumb();

  // Handle keyboard shortcut for search
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "g") {
      e.preventDefault();
      e.target.focus();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-gray-400">/</span>
              )}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 hover:border-gray-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search or type a command (Ctrl + G)"
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <span>Help</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-sm cursor-pointer hover:bg-pink-200 transition-colors">
            {getUserInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}
