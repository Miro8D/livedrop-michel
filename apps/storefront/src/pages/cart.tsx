import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../lib/store';
import { formatCurrency } from '../lib/format';
import LazyImage from '../components/atoms/LazyImage';

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, remove, clear, updateQty } = useCartStore();

  const itemsSafe: CartItem[] = items ?? [];

  const total = itemsSafe.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (itemsSafe.length === 0) {
    return (
      <main className="w-full px-4 py-12 text-center bg-transparent">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <p className="mb-8 text-gray-600">Your cart is empty.</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded transition"
        >
          Back to Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-12 bg-transparent">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <ul className="divide-y divide-slate-200">
        {itemsSafe.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4 px-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
            {item.image ? (
              <LazyImage
                src={item.image}
                alt={item.title}
                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                width={64}
                height={64}
                fetchPriority="low"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg shadow-sm flex items-center justify-center">No image</div>
            )}
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{item.title}</div>
              <div className="text-slate-600 flex items-center mt-1 space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-sm transition-all duration-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-sm transition-all duration-200"
                  >
                    +
                  </button>
                </div>
                <div className="flex-1 font-medium">× {formatCurrency(item.price)}</div>
                <div className="font-bold text-blue-600">{formatCurrency(item.price * item.qty)}</div>
              </div>
            </div>
            <button 
              className="ml-4 text-sm text-red-500 hover:text-red-600 hover:underline transition-colors font-medium" 
              onClick={() => remove(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="text-lg font-bold mt-8 flex justify-between items-center border-t border-slate-200 pt-4 px-4">
        <span className="text-slate-700">Total:</span>
        <span className="text-blue-600">{formatCurrency(total)}</span>
      </div>
      <div className="flex gap-4 mt-8">
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition font-semibold shadow-lg" onClick={clear}>
          Clear Cart
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition flex-1 shadow-lg"
          onClick={() => navigate('/checkout')}
        >
          Checkout
        </button>
      </div>
    </main>
  );
};

export default Cart;

