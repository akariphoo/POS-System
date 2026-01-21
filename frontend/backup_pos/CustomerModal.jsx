import { useState, useEffect } from "react";
import { X, Search, User } from "lucide-react";

// Sample customers - in real app, this would come from API
const sampleCustomers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", initials: "JD" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", initials: "JS" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+1234567892", initials: "BJ" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", phone: "+1234567893", initials: "AW" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", phone: "+1234567894", initials: "CB" },
];

export default function CustomerModal({ isOpen, onClose, onSelectCustomer }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(sampleCustomers);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(sampleCustomers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCustomers(
        sampleCustomers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.phone.includes(query)
        )
      );
    }
  }, [searchQuery]);

  const handleSelectCustomer = (customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  const handleSelectWalkIn = () => {
    onSelectCustomer({
      name: "Walk-in Customer",
      initials: "WC",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col z-10 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Select Customer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Walk-in Customer Option */}
          <button
            onClick={handleSelectWalkIn}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all mb-4 text-left"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900">Walk-in Customer</p>
              <p className="text-sm text-gray-500 mt-0.5">No customer information</p>
            </div>
          </button>

          {/* Customer List */}
          <div className="space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {customer.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {customer.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
