type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  tags: string[];
  stockQty: number;
  description?: string;
  imageURL?: string;
};

let catalog: Product[] = [];

async function loadCatalog() {
  if (catalog.length === 0) {
    const response = await fetch('/mock-catalog.json');
    catalog = await response.json();
  }
  return catalog;
}

export async function listProducts() {
  return await loadCatalog();
}

export async function getProduct(id: string) {
  const products = await loadCatalog();
  return products.find(p => p.id === id);
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export function placeOrder(cart: any[], customerInfo?: CustomerInfo) {
  // Simple simulation: compute total and return an order id
  const total = (cart || []).reduce((sum: number, it: any) => sum + (it.price || 0) * (it.qty || it.quantity || 0), 0);
  return { 
    orderId: Math.random().toString(36).substring(2, 12).toUpperCase(), 
    total,
    customerInfo // Store customer info with the order
  };
}

export function getOrderStatus(id: string) {
  const statuses = ["Placed", "Packed", "Shipped", "Delivered"];
  const random = statuses[Math.floor(Math.random() * statuses.length)];
  return { id, status: random, carrier: random !== "Placed" ? "DHL" : null, eta: random === "Delivered" ? null : "3 days" };
}
