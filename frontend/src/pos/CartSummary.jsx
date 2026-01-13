import { CreditCard } from "lucide-react";

export default function CartSummary({ cart }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="space-y-0">
      {/* Summary */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3 md:space-y-4 shadow-lg">
        <div className="flex justify-between items-center py-0.5 sm:py-1">
          <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-600">Subtotal</span>
          <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center py-0.5 sm:py-1">
          <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-600">Tax (10%)</span>
          <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{formatCurrency(tax)}</span>
        </div>
        <div className="border-t-2 border-gray-200 pt-1 sm:pt-2 md:pt-3 flex justify-between items-center">
          <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Total</span>
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 sm:pt-3 md:pt-4">
        <button className="w-full flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm md:text-base font-bold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          <CreditCard size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
          <span>Checkout</span>
        </button>
      </div>
    </div>
  );
}
