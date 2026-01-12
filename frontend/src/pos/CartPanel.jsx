import { Plus, Minus, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import CartSummary from "./CartSummary";

export default function CartPanel({ cart, onUpdateQuantity, onRemoveItem }) {
  const [quantityInputs, setQuantityInputs] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [availableStock, setAvailableStock] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };


  const handleQuantityChange = (itemId, value) => {
    setQuantityInputs(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    // Update available stock as user types
    const item = cart.find(i => i.id === itemId);
    if (item?.stock !== undefined) {
      const numValue = parseInt(value, 10);
      const remainingStock = item.stock - (isNaN(numValue) ? 0 : numValue);
      setAvailableStock(prev => ({
        ...prev,
        [itemId]: remainingStock
      }));
    }
  };

  const handleQuantityBlur = (itemId) => {
    const inputValue = quantityInputs[itemId];
    if (inputValue !== undefined) {
      const numValue = parseInt(inputValue, 10);
      const item = cart.find(i => i.id === itemId);
      
      // Clear error and available stock on blur
      setQuantityErrors(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      setAvailableStock(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      
      if (!isNaN(numValue) && numValue > 0) {
        // Check stock limit - available stock = original stock
        if (item?.stock !== undefined && numValue > item.stock) {
          const totalStock = item.stock;
          toast.error(`Only ${totalStock} items available in stock for "${item.name}"`);
          // Set to max stock
          onUpdateQuantity(itemId, totalStock);
          setQuantityInputs(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });
        } else {
          onUpdateQuantity(itemId, numValue);
          setQuantityInputs(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });
        }
      } else {
        // Reset to current quantity if invalid
        setQuantityInputs(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }
    }
  };

  const handleQuantityKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleQuantityKeyUp = (e, itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    // Calculate available stock: original stock
    const totalStock = item.stock !== undefined ? item.stock : undefined;

    // Handle ArrowUp key
    if (e.key === 'ArrowUp') {
      const currentValue = parseInt(e.target.value || item.quantity, 10);
      const newValue = currentValue + 1;
      
      // Update available stock: total stock - entered value
      if (totalStock !== undefined) {
        const remainingStock = totalStock - newValue;
        setAvailableStock(prev => ({
          ...prev,
          [itemId]: remainingStock
        }));
      }
      
      if (totalStock !== undefined && newValue > totalStock) {
        setQuantityErrors(prev => ({
          ...prev,
          [itemId]: `Only ${totalStock} items available in stock`
        }));
        toast.error(`Only ${totalStock} items available in stock for "${item.name}"`);
      } else {
        handleQuantityChange(itemId, newValue.toString());
        setQuantityErrors(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }
      return;
    }

    const inputValue = e.target.value;
    
    if (inputValue === '' || inputValue === undefined) {
      // Reset available stock to total stock when input is empty
      if (totalStock !== undefined) {
        setAvailableStock(prev => ({
          ...prev,
          [itemId]: totalStock
        }));
      }
      setQuantityErrors(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      return;
    }

    const numValue = parseInt(inputValue, 10);
    
    // Update available stock dynamically: total stock - entered value
    if (totalStock !== undefined) {
      const remainingStock = totalStock - (isNaN(numValue) ? 0 : numValue);
      setAvailableStock(prev => ({
        ...prev,
        [itemId]: remainingStock
      }));
    }
    
    if (!isNaN(numValue) && numValue > 0) {
      if (totalStock !== undefined && numValue > totalStock) {
        setQuantityErrors(prev => ({
          ...prev,
          [itemId]: `Only ${totalStock} items available in stock`
        }));
        toast.error(`Only ${totalStock} items available in stock for "${item.name}"`);
      } else {
        setQuantityErrors(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }
    } else {
      setQuantityErrors(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section Title */}
      <div className="mb-2 sm:mb-3 md:mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Item Cart</h2>
      </div>

      {/* Cart Items */}
      <div className="overflow-y-auto flex-1 min-h-0 -mx-1 sm:-mx-2 px-1 sm:px-2">
        {cart.length === 0 ? (
          <div className="text-center py-8 sm:py-10 md:py-12 px-3 sm:px-4">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 p-6 sm:p-8">
              <p className="text-sm sm:text-base font-medium text-gray-500">Cart is empty</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Add items from the product grid</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                <tr>
                  <th className="px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-3 text-left text-[9px] xs:text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-3 text-center text-[9px] xs:text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-3 text-right text-[9px] xs:text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-1.5 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/48x48?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            {item.stock !== undefined && item.stock === 0 && (
                              <AlertCircle size={12} className="text-red-500 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1">
                            <button
                              onClick={() => {
                                const newQuantity = item.quantity - 1;
                                onUpdateQuantity(item.id, newQuantity);
                                // Update available stock
                                if (item.stock !== undefined) {
                                  const remainingStock = item.stock - newQuantity;
                                  setAvailableStock(prev => ({
                                    ...prev,
                                    [item.id]: remainingStock
                                  }));
                                }
                              }}
                              className="p-1 sm:p-1.5 hover:bg-red-100 rounded-lg transition-all hover:shadow-sm active:scale-95"
                            >
                              <Minus size={10} className="text-red-600 sm:w-3 sm:h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock !== undefined ? item.stock : undefined}
                              value={quantityInputs[item.id] !== undefined ? quantityInputs[item.id] : item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              onBlur={() => handleQuantityBlur(item.id)}
                              onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                  e.target.blur();
                                } else {
                                  handleQuantityKeyUp(e, item.id);
                                }
                              }}
                              onKeyDown={(e) => handleQuantityKeyDown(e, item.id)}
                              className={`w-12 sm:w-14 text-xs sm:text-sm text-center font-semibold border-2 rounded-lg px-1 sm:px-2 py-1 sm:py-1.5 focus:outline-none focus:ring-2 transition-all ${
                                quantityErrors[item.id] || (item.stock !== undefined && item.quantity >= item.stock)
                                  ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                              }`}
                            />
                            <button
                              onClick={() => {
                                const newQuantity = item.quantity + 1;
                                if (item.stock !== undefined && newQuantity > item.stock) {
                                  toast.error(`Only ${item.stock} items available in stock for "${item.name}"`);
                                } else {
                                  onUpdateQuantity(item.id, newQuantity);
                                  // Update available stock
                                  if (item.stock !== undefined) {
                                    const remainingStock = item.stock - newQuantity;
                                    setAvailableStock(prev => ({
                                      ...prev,
                                      [item.id]: remainingStock
                                    }));
                                  }
                                }
                              }}
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                              className={`p-1 sm:p-1.5 rounded-lg transition-all ${
                                item.stock !== undefined && item.quantity >= item.stock
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-green-100 hover:shadow-sm active:scale-95"
                              }`}
                            >
                              <Plus size={10} className="text-green-600 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="ml-1 sm:ml-2 p-1 sm:p-1.5 hover:bg-red-50 rounded-lg transition-all hover:shadow-sm active:scale-95"
                            >
                              <Trash2 size={10} className="text-red-500 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-1.5 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 text-center">
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <input
                          type="number"
                          min="1"
                          max={item.stock !== undefined ? item.stock : undefined}
                          value={quantityInputs[item.id] !== undefined ? quantityInputs[item.id] : item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          onFocus={() => {
                            // Initialize available stock on focus
                            if (item.stock !== undefined) {
                              const currentValue = quantityInputs[item.id] !== undefined 
                                ? parseInt(quantityInputs[item.id], 10) 
                                : item.quantity;
                              const remainingStock = item.stock - (isNaN(currentValue) ? 0 : currentValue);
                              setAvailableStock(prev => ({
                                ...prev,
                                [item.id]: remainingStock
                              }));
                            }
                          }}
                          onBlur={() => handleQuantityBlur(item.id)}
                          onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            } else {
                              handleQuantityKeyUp(e, item.id);
                            }
                          }}
                          onKeyDown={(e) => handleQuantityKeyDown(e, item.id)}
                          className={`w-12 sm:w-14 md:w-16 text-[10px] xs:text-xs sm:text-sm font-semibold text-center border-2 rounded-md sm:rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 md:py-1.5 focus:outline-none focus:ring-2 transition-all ${
                            quantityErrors[item.id] || (item.stock !== undefined && item.quantity >= item.stock)
                              ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          }`}
                        />
                        {item.stock !== undefined && availableStock[item.id] !== undefined && (
                          <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                            Available: {availableStock[item.id]}
                          </span>
                        )}
                        {quantityErrors[item.id] && (
                          <span className="text-[9px] xs:text-[10px] sm:text-xs text-red-600 font-medium">
                            {quantityErrors[item.id]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-1.5 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 text-right">
                      <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      <div className="mt-3 sm:mt-4 md:mt-5 pt-3 sm:pt-4 md:pt-5 border-t-2 border-gray-200 flex-shrink-0">
        <CartSummary cart={cart} />
      </div>
    </div>
  );
}
