import { TrendingUp, TrendingDown, ShoppingBag, RefreshCcw } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, Admin</h1>
          <p className="text-gray-500">You have <span className="text-orange-500 font-medium">200+</span> orders today</p>
        </div>

        <button className="border px-4 py-2 rounded-lg text-sm text-gray-600">
          12/09/2025 - 12/15/2025
        </button>
      </div>

      {/* Alert */}
      <div className="bg-orange-50 border border-orange-200 text-sm text-orange-700 px-4 py-3 rounded-lg flex justify-between">
        <span>
          Your product <b>Apple iPhone 15</b> is running low (below 5 pcs).
          <button className="ml-2 underline font-medium">Add Stock</button>
        </span>
        <button>✕</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value="$48,988,078" percent="+22%" color="bg-orange-400" icon={<ShoppingBag />} />
        <StatCard title="Sales Return" value="$16,478,145" percent="-22%" color="bg-slate-800" icon={<RefreshCcw />} />
        <StatCard title="Total Purchase" value="$24,145,789" percent="+22%" color="bg-emerald-500" icon={<ShoppingBag />} />
        <StatCard title="Purchase Return" value="$18,458,747" percent="+22%" color="bg-blue-500" icon={<RefreshCcw />} />
      </div>

      {/* Small Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MiniCard title="Profit" value="$8,458,798" percent="+35%" />
        <MiniCard title="Invoice Due" value="$48,988,78" percent="+35%" />
        <MiniCard title="Expenses" value="$8,980,097" percent="+41%" />
        <MiniCard title="Payment Returns" value="$78,458,798" percent="-20%" negative />
      </div>

      {/* Chart + Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Sales & Purchase</h3>
            <div className="space-x-2 text-sm">
              {["1D", "1W", "1M", "3M", "6M", "1Y"].map(t => (
                <button key={t} className="px-2 py-1 border rounded">{t}</button>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-64 flex items-center justify-center text-gray-400 border rounded-lg">
            Chart goes here (Recharts / Chart.js)
          </div>
        </div>

        {/* Overall Info */}
        <div className="bg-white rounded-2xl p-6 shadow space-y-4">
          <h3 className="font-semibold">Overall Information</h3>

          <InfoRow label="Suppliers" value="6,987" />
          <InfoRow label="Customers" value="4,896" />
          <InfoRow label="Orders" value="487" />
        </div>
      </div>
    </div>
  );
}

/* Components */

function StatCard({ title, value, percent, color, icon }) {
  return (
    <div className={`${color} text-white rounded-2xl p-5 flex justify-between`}>
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">{percent}</span>
      </div>
      <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
    </div>
  );
}

function MiniCard({ title, value, percent, negative }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-lg font-semibold">{value}</h2>
      <p className={`text-sm ${negative ? "text-red-500" : "text-green-500"}`}>
        {percent} vs last month
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border rounded-lg px-4 py-3">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
