import { connectDB, client } from "./db.js";

const products = [
  {
    name: "Wireless Headphones",
    price: 79.99,
    description: "Comfortable over-ear wireless headphones with deep bass, noise isolation, and up to 20 hours of battery life.",
    tags: ["audio", "wireless", "electronics"],
    stock: 42,
    imageUrl: "https://images.unsplash.com/photo-1684703147716-014da6a31aa3?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1074",
    category: "electronics"
  },
  {
    name: "Bluetooth Speaker",
    price: 59.99,
    description: "Portable Bluetooth speaker with rich 360° sound, splash resistance, and a 10-hour rechargeable battery.",
    tags: ["audio", "portable"],
    stock: 36,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1331",
    category: "audio"
  },
  {
    name: "Smartwatch Series 5",
    price: 199.99,
    description: "Feature-packed smartwatch with fitness tracking, heart-rate monitoring, and smartphone notifications.",
    tags: ["wearables", "electronics"],
    stock: 27,
    imageUrl: "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    category: "wearables"
  },
  {
    name: "Laptop Stand",
    price: 24.99,
    description: "Aluminum adjustable laptop stand designed to improve posture and airflow for your laptop.",
    tags: ["accessories", "office"],
    stock: 58,
    imageUrl: "https://plus.unsplash.com/premium_photo-1683736986821-e4662912a70d?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1029",
    category: "office"
  },
  {
    name: "USB-C Charging Cable",
    price: 9.99,
    description: "Durable USB-C to USB-A charging cable supporting fast charge and high-speed data transfer.",
    tags: ["accessories", "charging"],
    stock: 120,
    imageUrl: "https://plus.unsplash.com/premium_photo-1669261149433-febd56c05327?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=715",
    category: "charging"
  },
  {
    name: "Mechanical Keyboard",
    price: 89.99,
    description: "RGB-backlit mechanical keyboard with tactile switches and full anti-ghosting for smooth typing.",
    tags: ["office", "electronics"],
    stock: 44,
    imageUrl: "https://images.unsplash.com/photo-1602025882379-e01cf08baa51?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    category: "electronics"
  },
  {
    name: "Ergonomic Mouse",
    price: 39.99,
    description: "Ergonomic wireless mouse designed to reduce wrist strain and support all-day productivity.",
    tags: ["office", "accessories"],
    stock: 71,
    imageUrl: "https://images.unsplash.com/photo-1625750319971-ee4b61e68df8?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1229",
    category: "office"
  },
  {
    name: "4K Monitor 27-inch",
    price: 329.99,
    description: "Ultra HD 4K 27-inch display with vivid colors, slim bezels, and adaptive brightness for work or play.",
    tags: ["electronics", "display"],
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1666771410003-8437c4781d49?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1074",
    category: "electronics"
  },
  {
    name: "Desk Lamp with USB Port",
    price: 29.99,
    description: "Modern LED desk lamp with adjustable brightness levels and built-in USB charging port.",
    tags: ["office", "lighting"],
    stock: 63,
    imageUrl: "https://images.unsplash.com/photo-1571406487954-dc11b0c0767d?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=687",
    category: "lighting"
  },
  {
    name: "Noise-Cancelling Earbuds",
    price: 99.99,
    description: "Compact wireless earbuds featuring active noise cancellation and a secure, comfortable fit.",
    tags: ["audio", "wireless"],
    stock: 49,
    imageUrl: "https://images.unsplash.com/photo-1662348316397-7afeb1045fd7?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=737",
    category: "audio"
  },
  {
    name: "Portable Power Bank 10000mAh",
    price: 34.99,
    description: "Slim and powerful 10000mAh power bank with dual USB output and LED charge indicator.",
    tags: ["charging", "portable"],
    stock: 82,
    imageUrl: "https://images.unsplash.com/photo-1706275787520-541d385ae221?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=688",
    category: "charging"
  },
  {
    name: "Smart LED Bulb",
    price: 14.99,
    description: "Wi-Fi-enabled LED bulb with adjustable color temperature and smart app control compatibility.",
    tags: ["lighting", "smart-home"],
    stock: 97,
    imageUrl: "https://images.unsplash.com/photo-1590845947698-8924d7409b56?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    category: "lighting"
  },
  {
    name: "Wireless Charger Pad",
    price: 19.99,
    description: "Fast wireless charging pad compatible with Qi-enabled devices, featuring anti-slip coating.",
    tags: ["charging", "wireless"],
    stock: 65,
    imageUrl: "https://images.unsplash.com/photo-1633381638729-27f730955c23?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    category: "charging"
  },
  {
    name: "HD Webcam 1080p",
    price: 49.99,
    description: "High-definition webcam offering crisp 1080p video quality and built-in noise-reducing microphone.",
    tags: ["office", "electronics"],
    stock: 34,
    imageUrl: "https://images.unsplash.com/photo-1626581795188-8efb9a00eeec?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=735",
    category: "electronics"
  },
  {
    name: "External SSD 1TB",
    price: 119.99,
    description: "High-speed 1TB portable SSD with USB 3.2 interface and shock-resistant metal casing.",
    tags: ["storage", "electronics"],
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1577538926210-fc6cc624fde2?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    category: "storage"
  },
  {
    name: "Fitness Tracker Band",
    price: 49.99,
    description: "Lightweight fitness tracker that monitors steps, sleep, and heart rate with a week-long battery life.",
    tags: ["wearables", "fitness"],
    stock: 68,
    imageUrl: "https://plus.unsplash.com/premium_photo-1681433386259-1ea114ca923d?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1460",
    category: "fitness"
  },
  {
    name: "Gaming Mouse Pad XL",
    price: 14.99,
    description: "Extra-large smooth-surface gaming mouse pad with stitched edges and non-slip rubber base.",
    tags: ["gaming", "accessories"],
    stock: 90,
    imageUrl: "https://images.unsplash.com/photo-1589401806207-2381455bce76?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    category: "gaming"
  },
  {
    name: "Laptop Backpack",
    price: 59.99,
    description: "Water-resistant laptop backpack with multiple compartments and USB charging port for daily commuting.",
    tags: ["travel", "office"],
    stock: 54,
    imageUrl: "https://images.unsplash.com/photo-1667411424771-cadd97150827?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1170",
    category: "travel"
  },
  {
    name: "Mini Tripod for Phone",
    price: 12.99,
    description: "Compact tripod with adjustable legs and phone mount — ideal for selfies, streaming, or travel photography.",
    tags: ["photography", "accessories"],
    stock: 88,
    imageUrl: "https://images.unsplash.com/photo-1571253066662-32bf8be4135b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=728",
    category: "photography"
  }
];

const customers = [
  { name: "John Doe", email: "demo@example.com", phone: "+961 70 123 456", address: "Beirut, Lebanon", createdAt: new Date() },
  { name: "Sarah Haddad", email: "sarah.haddad@example.com", phone: "+961 3 987 654", address: "Tripoli, Lebanon", createdAt: new Date() },
  { name: "Ali Mansour", email: "ali.mansour@example.com", phone: "+961 71 445 334", address: "Saida, Lebanon", createdAt: new Date() },
  { name: "Nour Khoury", email: "nour.khoury@example.com", phone: "+961 76 112 220", address: "Byblos, Lebanon", createdAt: new Date() },
  { name: "Rami Saad", email: "rami.saad@example.com", phone: "+961 79 223 889", address: "Beirut, Lebanon", createdAt: new Date() },
  { name: "Lina Kassem", email: "lina.kassem@example.com", phone: "+961 71 445 672", address: "Tyre, Lebanon", createdAt: new Date() },
  { name: "Jad Fares", email: "jad.fares@example.com", phone: "+961 70 222 333", address: "Zahle, Lebanon", createdAt: new Date() },
  { name: "Hassan Younes", email: "hassan.younes@example.com", phone: "+961 76 556 900", address: "Beirut, Lebanon", createdAt: new Date() },
  { name: "Maya Salameh", email: "maya.salameh@example.com", phone: "+961 3 777 441", address: "Tripoli, Lebanon", createdAt: new Date() },
  { name: "Karim Atallah", email: "karim.atallah@example.com", phone: "+961 78 991 220", address: "Beirut, Lebanon", createdAt: new Date() },
  { name: "Dana Karam", email: "dana.karam@example.com", phone: "+961 70 111 220", address: "Jounieh, Lebanon", createdAt: new Date() },
  { name: "Fadi Daher", email: "fadi.daher@example.com", phone: "+961 3 888 999", address: "Beirut, Lebanon", createdAt: new Date() }
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrders(customers, products) {
  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const carriers = ["DHL", "LibanPost", "Aramex", "UPS"];
  const orders = [];

  for (let i = 0; i < 18; i++) {
    const customer = randomItem(customers);
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const selected = Array.from({ length: itemCount }, () => randomItem(products));
    const items = selected.map(p => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      quantity: Math.floor(Math.random() * 3) + 1
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    orders.push({
      customerId: customer._id,
      items,
      total: parseFloat(total.toFixed(2)),
      status: randomItem(statuses),
      carrier: randomItem(carriers),
      estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  const demo = customers.find(c => c.email === "demo@example.com");
  if (demo) {
    for (let i = 0; i < 3; i++) {
      const p = randomItem(products);
      orders.push({
        customerId: demo._id,
        items: [{ productId: p._id, name: p.name, price: p.price, quantity: 1 }],
        total: p.price,
        status: randomItem(statuses),
        carrier: randomItem(carriers),
        estimatedDelivery: new Date(Date.now() + i * 2 * 86400000),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  return orders;
}

async function seedDatabase() {
  try {
    const db = await connectDB();

    const productCol = db.collection("products");
    const customerCol = db.collection("customers");
    const orderCol = db.collection("orders");

    await productCol.deleteMany({});
    await customerCol.deleteMany({});
    await orderCol.deleteMany({});

    console.log("Cleared old data");

    const insertedProducts = await productCol.insertMany(products);
    const insertedCustomers = await customerCol.insertMany(customers);

    const fullProducts = Object.values(insertedProducts.insertedIds).map((id, i) => ({
      ...products[i],
      _id: id
    }));
    const fullCustomers = Object.values(insertedCustomers.insertedIds).map((id, i) => ({
      ...customers[i],
      _id: id
    }));

    const orders = generateOrders(fullCustomers, fullProducts);
    await orderCol.insertMany(orders);

    console.log(`Seeded:
      - ${products.length} products
      - ${customers.length} customers
      - ${orders.length} orders`);
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

seedDatabase();