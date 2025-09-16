# LiveDrop – System Design

This project is a system design exercise for **Live Drops** – a flash-sale & follow platform where creators can run limited-inventory product drops, and users can follow, browse, and order in real-time.

---

## 📌 Architecture Overview

![Architecture Diagram](link-to-excalidraw-diagram)

### Components
- **Clients**: Web + Mobile apps  
- **API Gateway**: Single entry point for all requests  
- **Services**:  
  - User Service (users, following relationships)  
  - Creator Service (profiles, followers)  
  - Product/Drop Service (products, drops, stock)  
  - Order Service (orders, idempotency, stock deduction)  
  - Notification Service (real-time updates)  
- **Databases**:  
  - SQL DB for orders & stock (strong consistency)  
  - NoSQL DB for followers & activity feeds (scalable)  
  - Cache (Redis) for hot data  
- **Message Queue**: Kafka/RabbitMQ for async events (drop started, sold out, order confirmation)  
- **Monitoring**: Track latency, traffic, cache hit ratio, follower queries performance  

---

## 📊 Data Models

### User
- id (PK)  
- name  
- email  
- followed_creators[]  

### Creator
- id (PK)  
- name  
- profile  
- followers[]  

### Product
- id (PK)  
- creator_id (FK)  
- name, description, price  

### Drop
- id (PK)  
- product_id (FK)  
- start_time, end_time  
- stock (atomic decrement)  

### Order
- id (PK)  
- user_id (FK)  
- drop_id (FK)  
- quantity  
- status  
- idempotency_key  

---

## 🔌 API Design (Example Endpoints)

### Follow
- `POST /creators/{id}/follow`
- `DELETE /creators/{id}/unfollow`
- `GET /users/{id}/following`
- `GET /creators/{id}/followers`

### Browse
- `GET /products?status=live&page=1`
- `GET /drops/{id}`
- `GET /creators/{id}/drops`

### Orders
- `POST /orders` (with `Idempotency-Key` header)
- `GET /users/{id}/orders`

### Notifications
- WebSocket: `wss://api.livedrop.com/notifications`
- Events: `drop_started`, `stock_low`, `sold_out`, `order_confirmed`

---

## ⚡ Caching Strategy

- Product details + creator profiles cached in Redis (long TTL).  
- Stock counts cached but invalidated immediately on order placement.  
- Follower lists cached with sharding to avoid hot spots for celebrity creators.  

---

## ⚖️ Tradeoffs & Key Choices

- **SQL for orders/stock** → ensures no overselling.  
- **NoSQL for followers** → scales to millions of fans per creator.  
- **Message queues** for real-time events → avoids bottlenecks and ensures reliable notifications.  
- **Caching** for low latency on frequent queries.  
- **Idempotency keys** prevent duplicate orders.  

---

## ✅ Requirements Satisfaction

- High throughput reads (500–1500 rps) supported via caching + sharding.  
- Order placement ≤500ms with atomic DB transactions.  
- Notifications within 2s using pub/sub + push.  
- System resilient to single instance failures.  
- Data access restricted to authorized users only.  

---

## 📈 Monitoring & Metrics

- Request volume & latency (p95)  
- Cache hit ratio  
- Lock contention on stock updates  
- Follower list query performance  
- System health dashboards  

---
