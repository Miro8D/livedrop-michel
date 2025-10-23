import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchOrderStatus } from "../lib/api";
import { connectOrderStatus } from "../lib/sse-client";

type OrderStatus = {
  id: string;
  status: "Placed" | "Packed" | "Shipped" | "Delivered";
  carrier: string | null;
  eta: string | null;
};

const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    let conn: any | null = null;

    // Fetch initial status
    (async () => {
      setLoading(true);
      const initial = await fetchOrderStatus(id);
      setOrder(initial as OrderStatus);
      setLoading(false);

      // Connect SSE for live updates
      conn = connectOrderStatus(id, {
        onOpen: () => {
          // nothing for now
        },
        onMessage: (data) => {
          if (data && data.status) {
            setOrder((prev) => ({ ...(prev as any), status: data.status, carrier: data.carrier ?? prev?.carrier ?? null, eta: data.eta ?? prev?.eta ?? null } as OrderStatus));
          }
        },
        onClose: () => {
          // closed by server
        },
        onError: (e) => console.error('SSE error', e)
      });
    })();

    return () => {
      if (conn && conn.close) conn.close();
    };
  }, [id, navigate]);

  const steps = ["Placed", "Packed", "Shipped", "Delivered"];
  // Normalize backend status values to the UI steps
  const normalizeStatus = (s: string | undefined | null) => {
    if (!s) return 'Placed';
    const up = s.toString().toUpperCase();
    if (up === 'PENDING') return 'Placed';
    if (up === 'PROCESSING') return 'Packed';
    if (up === 'SHIPPED') return 'Shipped';
    if (up === 'DELIVERED') return 'Delivered';
    // fallback: try to match
    if (steps.includes(s)) return s as any;
    return 'Placed';
  };

  const currentStep = order ? steps.indexOf(normalizeStatus(order.status as any)) : -1;

  if (loading) {
    return (
      <main className="w-full px-4 py-12 text-center">
        <div className="text-lg text-slate-600">Loading order status...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="w-full px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Order Not Found</h1>
        <Link to="/" className="text-blue-500 hover:text-blue-600 underline transition-colors">
          Back to Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 border border-slate-200"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Order Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Order Status</h1>
        <p className="text-slate-500">Order ID: {order.id}</p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-1 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isComplete = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      isComplete
                        ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                  >
                    {isComplete ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className={`mt-3 text-sm font-medium ${
                    isComplete ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Shipping Details</h2>
        <div className="space-y-4">
          {order && (
            <>
              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 mt-0.5">
                  <svg className="text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-700">What’s happening</div>
                  <div className="text-slate-600">
                    {(() => {
                      const s = (order.status || '').toString().toUpperCase();
                      if (s === 'PENDING' || s === 'PLACED') return 'Your order has been placed and will be processed soon.';
                      if (s === 'PROCESSING' || s === 'PACKED') return `Your order is being prepared${order.carrier ? ` and will be handed to ${order.carrier}` : ''}.`;
                      if (s === 'SHIPPED') return `Your order has been shipped${order.carrier ? ` via ${order.carrier}` : ''}${order.eta ? ` and is expected in ${order.eta}` : ''}.`;
                      if (s === 'DELIVERED') return 'Your order has been delivered.';
                      return `Current status: ${order.status}`;
                    })()}
                  </div>
                </div>
              </div>

              {order.carrier && (
                <div className="flex items-start space-x-4">
                  <div className="w-5 h-5 mt-0.5">
                    <svg className="text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Carrier</div>
                    <div className="text-slate-600">{order.carrier}</div>
                  </div>
                </div>
              )}

              {order.eta && (
                <div className="flex items-start space-x-4">
                  <div className="w-5 h-5 mt-0.5">
                    <svg className="text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Estimated Delivery</div>
                    <div className="text-slate-600">
                      {order.eta}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default OrderStatusPage;
