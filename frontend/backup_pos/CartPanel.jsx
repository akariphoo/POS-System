import { Plus, Minus, Trash2, AlertCircle, X, Save, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CartSummary from "./CartSummary";
import api from "../config/api";

export default function CartPanel({ cart, onUpdateQuantity, onRemoveItem }) {
  const [quantityInputs, setQuantityInputs] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [availableStock, setAvailableStock] = useState({});
  const [exchangeRates, setExchangeRates] = useState([]);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateFormData, setRateFormData] = useState({
    base_currency: "MMK",
    quote_currency: "CNY",
    rate: "",
    status: "active",
    effective_from: new Date().toISOString().slice(0, 16),
    effective_to: "",
  });
  const [rateErrors, setRateErrors] = useState({});

  // Fetch active exchange rates
  const fetchExchangeRates = async () => {
    try {
      const res = await api.post("/exchange-rate/list");
      if (res.data.status) {
        // Filter for active rates only
        const activeRates = res.data.data.filter(rate => rate.status === 'active');
        setExchangeRates(activeRates);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Get display rate (e.g., "1 MMK = 3.32 CNY")
  const getDisplayRate = () => {
    if (exchangeRates.length === 0) return null;
    
    // Find MMK to CNY or CNY to MMK rate
    const mmkToCny = exchangeRates.find(
      rate => rate.base_currency === "MMK" && rate.quote_currency === "CNY"
    );
    const cnyToMmk = exchangeRates.find(
      rate => rate.base_currency === "CNY" && rate.quote_currency === "MMK"
    );

    if (mmkToCny) {
      return { base: "MMK", quote: "CNY", rate: parseFloat(mmkToCny.rate).toFixed(2) };
    } else if (cnyToMmk) {
      // If we have CNY to MMK, calculate inverse
      const inverseRate = (1 / parseFloat(cnyToMmk.rate)).toFixed(2);
      return { base: "MMK", quote: "CNY", rate: inverseRate };
    }

    // Fallback: show first available rate
    if (exchangeRates[0]) {
      return {
        base: exchangeRates[0].base_currency,
        quote: exchangeRates[0].quote_currency,
        rate: parseFloat(exchangeRates[0].rate).toFixed(2)
      };
    }

    return null;
  };

  // Handle exchange rate update
  const handleRateUpdate = async (e) => {
    e.preventDefault();
    setRateErrors({});
    try {
      const res = await api.post("/exchange-rate/store", rateFormData);
      if (res.data.status) {
        toast.success("Exchange rate updated successfully");
        setIsRateModalOpen(false);
        fetchExchangeRates();
        setRateFormData({
          base_currency: "MMK",
          quote_currency: "CNY",
          rate: "",
          status: "active",
          effective_from: new Date().toISOString().slice(0, 16),
          effective_to: "",
        });
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setRateErrors(err.response.data.errors || {});
        toast.error("Please check the highlighted fields");
      } else {
        toast.error(err.response?.data?.message || "Failed to update exchange rate");
      }
    }
  };

  const formatCurrency = (amount, currency = "MMK") => {
    // Format number with 2 decimal places
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    // Map currency codes to symbols
    const currencySymbols = {
      MMK: "K",
      USD: "$",
      CNY: "¥",
    };

    const symbol = currencySymbols[currency.toUpperCase()] || currency;
    
    // Return formatted amount with symbol
    return `${symbol} ${formattedAmount}`;
  };


  const handleQuantityChange = (itemId, value) => {
    setQuantityInputs(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    const numValue = parseInt(value, 10);
    
    // Update available stock as user types
    if (item.stock !== undefined) {
      const remainingStock = item.stock - (isNaN(numValue) ? 0 : numValue);
      setAvailableStock(prev => ({
        ...prev,
        [itemId]: remainingStock
      }));
    }

    // Update quantity immediately if valid number for dynamic price update
    if (!isNaN(numValue) && numValue > 0) {
      // Check stock limit
      if (item.stock !== undefined && numValue > item.stock) {
        // Don't update if exceeds stock, but still show the input value
        return;
      }
      // Update quantity immediately for price calculation
      onUpdateQuantity(itemId, numValue);
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
        // Update quantity immediately for price calculation
        onUpdateQuantity(itemId, newValue);
        setQuantityErrors(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }
      return;
    }

    // Handle ArrowDown key
    if (e.key === 'ArrowDown') {
      const currentValue = parseInt(e.target.value || item.quantity, 10);
      const newValue = Math.max(1, currentValue - 1);
      
      // Update available stock: total stock - entered value
      if (totalStock !== undefined) {
        const remainingStock = totalStock - newValue;
        setAvailableStock(prev => ({
          ...prev,
          [itemId]: remainingStock
        }));
      }
      
      handleQuantityChange(itemId, newValue.toString());
      // Update quantity immediately for price calculation
      onUpdateQuantity(itemId, newValue);
      setQuantityErrors(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
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

  const displayRate = getDisplayRate();

  return (
    <div className="flex flex-col h-full">
      {/* Section Title */}
      <div className="mb-1 sm:mb-2 md:mb-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Item Cart</h2>
          <button
            onClick={() => {
              // Pre-fill form with current rate if available
              if (displayRate) {
                const currentRate = exchangeRates.find(
                  r => r.base_currency === displayRate.base && r.quote_currency === displayRate.quote
                ) || exchangeRates.find(
                  r => r.base_currency === displayRate.quote && r.quote_currency === displayRate.base
                );
                
                if (currentRate) {
                  setRateFormData({
                    base_currency: currentRate.base_currency,
                    quote_currency: currentRate.quote_currency,
                    rate: currentRate.rate,
                    status: currentRate.status,
                    effective_from: new Date().toISOString().slice(0, 16),
                    effective_to: "",
                  });
                }
              } else {
                // Reset to default if no rate exists
                setRateFormData({
                  base_currency: "MMK",
                  quote_currency: "CNY",
                  rate: "",
                  status: "active",
                  effective_from: new Date().toISOString().slice(0, 16),
                  effective_to: "",
                });
              }
              setIsRateModalOpen(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 group"
          >
            <RefreshCw size={12} className="text-blue-600 sm:w-3.5 sm:h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-blue-700">
              {displayRate ? (
                <>1 {displayRate.base} = {displayRate.rate} {displayRate.quote}</>
              ) : (
                <>Set Exchange Rate</>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="overflow-y-auto flex-1 min-h-[300px] -mx-1 sm:-mx-2 px-1 sm:px-2">
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
                    <td className="px-1.5 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3">
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
                        {formatCurrency((() => {
                          // Use input value if available and valid, otherwise use item quantity
                          const inputValue = quantityInputs[item.id];
                          const displayQuantity = inputValue !== undefined 
                            ? (parseInt(inputValue, 10) || item.quantity)
                            : item.quantity;
                          return item.price * displayQuantity;
                        })(), item.currency)}
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
      <div className="mt-1 sm:mt-2 md:mt-3 pt-1 sm:pt-2 md:pt-3 border-t-2 border-gray-200 flex-shrink-0">
        <CartSummary cart={cart} />
      </div>

      {/* Exchange Rate Update Modal */}
      {isRateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Update Exchange Rate</h3>
              <button
                onClick={() => {
                  setIsRateModalOpen(false);
                  setRateErrors({});
                }}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleRateUpdate} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Base Currency */}
                <div>
                  <label className="text-[10px] xs:text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Base Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none transition-all ${
                      rateErrors.base_currency
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    value={rateFormData.base_currency}
                    onChange={(e) =>
                      setRateFormData({
                        ...rateFormData,
                        base_currency: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="MMK"
                  />
                  {rateErrors.base_currency && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">
                      {rateErrors.base_currency[0]}
                    </p>
                  )}
                </div>

                {/* Quote Currency */}
                <div>
                  <label className="text-[10px] xs:text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Quote Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none transition-all ${
                      rateErrors.quote_currency
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    value={rateFormData.quote_currency}
                    onChange={(e) =>
                      setRateFormData({
                        ...rateFormData,
                        quote_currency: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="CNY"
                  />
                  {rateErrors.quote_currency && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">
                      {rateErrors.quote_currency[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Rate */}
                <div>
                  <label className="text-[10px] xs:text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none transition-all ${
                      rateErrors.rate
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    value={rateFormData.rate}
                    onChange={(e) =>
                      setRateFormData({ ...rateFormData, rate: e.target.value })
                    }
                    placeholder="3.32"
                  />
                  {rateErrors.rate && (
                    <p className="text-[10px] text-red-600 mt-1 font-medium">
                      {rateErrors.rate[0]}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-[10px] xs:text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm outline-none appearance-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={rateFormData.status}
                    onChange={(e) =>
                      setRateFormData({ ...rateFormData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] xs:text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none transition-all ${
                    rateErrors.effective_from
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                  value={rateFormData.effective_from}
                  onChange={(e) =>
                    setRateFormData({ ...rateFormData, effective_from: e.target.value })
                  }
                />
                {rateErrors.effective_from && (
                  <p className="text-[10px] text-red-600 mt-1 font-medium">
                    {rateErrors.effective_from[0]}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRateModalOpen(false);
                    setRateErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
