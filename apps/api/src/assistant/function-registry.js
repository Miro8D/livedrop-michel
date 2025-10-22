import { getDb } from "../db.js";

class FunctionRegistry {
  constructor() {
    this.registry = {};
  }

  register(name, schema, handler) {
    this.registry[name] = { schema, handler };
  }

  getAllSchemas() {
    return Object.entries(this.registry).map(([name, { schema }]) => ({
      name,
      ...schema
    }));
  }

  async execute(name, args) {
    const func = this.registry[name];
    if (!func) throw new Error(`Function "${name}" not found`);
    return await func.handler(args);
  }
}

const registry = new FunctionRegistry();

registry.register(
  "getOrderStatus",
  {
    description: "Get the current status of an order by its ID.",
    parameters: {
      orderId: "string"
    }
  },
  async ({ orderId }) => {
    const db = getDb();
    const orders = db.collection("orders");
    const order = await orders.findOne({ _id: orderId });
    if (!order) return { error: "Order not found" };
    return { orderId, status: order.status };
  }
);

registry.register(
  "searchProducts",
  {
    description: "Search for products by name or keyword.",
    parameters: {
      query: "string",
      limit: "number"
    }
  },
  async ({ query, limit = 5 }) => {
    const db = getDb();
    const products = db.collection("products");
    const results = await products
      .find({ name: { $regex: query, $options: "i" } })
      .limit(limit)
      .toArray();
    return results;
  }
);

registry.register(
  "getCustomerOrders",
  {
    description: "Retrieve all orders placed by a customer email.",
    parameters: {
      email: "string"
    }
  },
  async ({ email }) => {
    const db = getDb();
    const customers = db.collection("customers");
    const orders = db.collection("orders");
    const customer = await customers.findOne({ email });
    if (!customer) return { error: "Customer not found" };
    const customerOrders = await orders
      .find({ customerId: customer._id })
      .toArray();
    return customerOrders;
  }
);

export default registry;
