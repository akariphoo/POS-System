import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Dashboard from "./Dashboard";
import UserList from "../users/UserList"; // adjust path
import RoleAndPermission from "../role_and_permissions/RoleAndPermission";
import ExchangeRateHistory from "../exchange_rate/ExchangeRateHistory";
import BranchList from "../branches/BranchList";
import CustomerList from "../customers/CustomerList";
import { Currency } from "lucide-react";
import CurrencyList from "../currency/CurrencyList";
import CapitalList from "../capitals/CapitalList";

export default function Layout() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="flex-1 ml-64 flex flex-col">
        <Topbar user={user} />

        <main className="p-6 flex-1">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="branches" element={<BranchList />} />
            <Route path="users" element={<UserList />} />
            <Route path="roleandpermission" element={<RoleAndPermission />} />
            <Route path="currency" element={<CurrencyList />} />
            <Route path="capital" element={<CapitalList />} />
            <Route path="exchange-rate-history" element={<ExchangeRateHistory />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="sales" element={<div>Sales Page</div>} />
            <Route path="products" element={<div>Products Page</div>} />
            <Route path="reports" element={<div>Reports Page</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
