import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../lib/store";
import { formatCurrency } from "../lib/format";
import { placeOrder } from "../lib/api";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, clear } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: ""
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  // Calculate total
  const total =
    items?.reduce(
      (sum: number, item: any) => sum + item.price * (item.qty ?? item.quantity ?? 0),
      0
    ) || 0;

  const validateForm = () => {
    const newErrors: Partial<CustomerInfo> = {};
    
    if (!customerInfo.name) newErrors.name = "Name is required";
    if (!customerInfo.email?.includes("@")) newErrors.email = "Valid email is required";
    if (!customerInfo.phone) newErrors.phone = "Phone is required";
    if (!customerInfo.address) newErrors.address = "Address is required";
    if (!customerInfo.city) newErrors.city = "City is required";
    if (!customerInfo.zip) newErrors.zip = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof CustomerInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Place order through API
      const { orderId } = await placeOrder(items, customerInfo);
      clear(); // Clear cart after successful order
      navigate(`/order/${orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <main className="w-full px-4 py-12 text-center bg-transparent">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <p className="mb-8 text-gray-600">Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-12 bg-transparent">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={customerInfo.name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={customerInfo.address}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={customerInfo.city}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP Code"
                  value={customerInfo.zip}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.zip ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 p-4 border rounded-lg transition ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex-1 p-4 border rounded-lg transition ${
                  paymentMethod === "cash"
                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cash on Delivery
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="divide-y">
              {items.map((item: any) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-gray-600">
                      {item.qty ?? item.quantity ?? 0} × {formatCurrency(item.price)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-lg font-bold mt-8 flex justify-between items-center border-t pt-4">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition disabled:opacity-60"
            onClick={handleCheckout}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

