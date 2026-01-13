import { useState } from "react";
import { MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import ItemGrid from "../pos/ItemGrid";
import CustomerPanel from "../pos/CustomerPanel";
import CustomerModal from "../pos/CustomerModal";
import CartPanel from "../pos/CartPanel";

export default function PointOfSale() {
  const [cart, setCart] = useState([
    {
      id: 1,
      name: "Dinner Set Chair",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100",
      price: 240.0,
      quantity: 1,
      stock: 15,
    },
    {
      id: 4,
      name: "Plastic Chair Set",
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=100",
      price: 120.0,
      quantity: 1,
      stock: 25,
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState({
    name: "Walk-in Customer",
    initials: "WC",
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const handleAddToCart = (item) => {
    // Check if out of stock
    if (item.stock !== undefined && item.stock <= 0) {
      toast.error(`"${item.name}" is out of stock`);
      return;
    }

    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (item.stock !== undefined && newQuantity > item.stock) {
        toast.error(`Only ${item.stock} items available in stock for "${item.name}"`);
        return;
      }
      // Move existing item to top with updated quantity
      setCart([
        { ...existingItem, quantity: newQuantity },
        ...cart.filter((cartItem) => cartItem.id !== item.id)
      ]);
    } else {
      // Add new item to the top of the cart
      setCart([{ ...item, quantity: 1 }, ...cart]);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== itemId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Point of Sale
          </h1>
        </div>
        <button className="p-1.5 sm:p-2 md:p-2.5 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all hover:shadow-sm">
          <MoreVertical size={18} className="text-gray-600 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Item Browser */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-white">
          <ItemGrid onAddToCart={handleAddToCart} />
        </div>

        {/* Right Panel - Customer & Cart */}
        <div className="w-full md:w-[400px] lg:w-[530px] xl:w-[630px] border-t md:border-t-0 md:border-l border-gray-200 bg-white flex flex-col shadow-lg">
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
            <CustomerPanel
              customer={selectedCustomer}
              onOpenModal={() => setIsCustomerModalOpen(true)}
              onRemoveCustomer={() => setSelectedCustomer({
                name: "Walk-in Customer",
                initials: "WC",
              })}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 bg-white min-h-0">
            <CartPanel
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
            />
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={setSelectedCustomer}
      />
    </div>
  );
}
