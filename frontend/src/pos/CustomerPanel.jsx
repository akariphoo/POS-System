import { X, ChevronDown } from "lucide-react";

export default function CustomerPanel({ customer, onOpenModal, onRemoveCustomer }) {
  const isWalkIn = !customer || customer.name === "Walk-in Customer";

  return (
    <div>
      <button
        type="button"
        onClick={onOpenModal}
        className="w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left shadow-sm"
      >
        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate flex-1 text-left">
          {customer?.name || "Walk-in Customer"}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {!isWalkIn && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCustomer();
              }}
              className="p-0.5 sm:p-1 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveCustomer();
                }
              }}
            >
              <X size={12} className="text-red-500 sm:w-3.5 sm:h-3.5" />
            </div>
          )}
          <ChevronDown size={14} className="text-gray-400 sm:w-4 sm:h-4" />
        </div>
      </button>
    </div>
  );
}
