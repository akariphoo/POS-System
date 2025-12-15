import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow flex flex-col">
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-bold">POS System</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["dashboard", "sales", "products", "reports"].map((menu) => (
            <button
              key={menu}
              className={`w-full text-left p-2 rounded hover:bg-blue-100 ${
                activeMenu === menu ? "bg-blue-200 font-bold" : ""
              }`}
              onClick={() => setActiveMenu(menu)}
            >
              {menu.charAt(0).toUpperCase() + menu.slice(1)}
            </button>
          ))}
          <button
            className="w-full text-left p-2 rounded hover:bg-red-100 text-red-600 mt-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">{activeMenu}</h2>
          <div className="text-gray-700">
            {user.name || "User"}
          </div>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow min-h-[400px]">
          {activeMenu === "dashboard" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Welcome, {user.name || "User"}!</h3>
              <p>This is your POS dashboard. Select a menu from the sidebar.</p>
            </div>
          )}

          {activeMenu === "sales" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales Module</h3>
              <p>Here you can handle POS sales, cart, checkout, etc.</p>
            </div>
          )}

          {activeMenu === "products" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Products Module</h3>
              <p>Here you can manage products, stock, and inventory.</p>
            </div>
          )}

          {activeMenu === "reports" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Reports Module</h3>
              <p>View sales reports, inventory reports, and analytics here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
