# LiveDrop – System Design Assignment

This is my system design for **LiveDrop**,
on this platform creators can run live product drops with limited stock and users can follow creators, get notified when drops go live, browse products and place orders in real time.

---

## Design

Project diagram:  
[Excalidraw Link](https://excalidraw.com/#json=9W7rj4nmXUdGhikORSnxn,eqZGzVr5Os3Qn-rfFWgvuw)

Main parts of the system:
- **API Gateway** – one entry point for web and mobile clients  
- **Auth Service** – login and permissions  
- **Followers Service** – follow/unfollow and listing followers  
- **Product/Drop Service** – products, drops, stock  
- **Order Service** – handles orders, prevents overselling, idempotency  
- **Payment Service** – external payment gateway integration  
- **Notification Service** – real-time updates (drop started, sold out, order confirmed)  
- **Message Queue** – events between services (e.g., Kafka/RabbitMQ)  
- **Cache (Redis)** – fast reads for product, drop, and stock info  
- **Monitoring** – latency, errors, stock contention, cache hit ratio  

---

## Db models

- **Users** → user_id, name, email  
- **Creators** → creator_id, name, profile  
- **Followers** → user_id, creator_id  
- **Products** → product_id, creator_id, name, price, description  
- **Drops** → drop_id, product_id, start_time, end_time, stock, status  
- **Orders** → order_id, user_id, drop_id, quantity, status, idempotency_key  
- **Notifications** → notification_id, user_id, event_type, drop_id, order_id  

---

## API

- **Follow/Unfollow**
  - `POST /creators/{id}/follow`
  - `DELETE /creators/{id}/follow`
  - `GET /users/{id}/following?page=&limit=`
  - `GET /creators/{id}/followers?page=&limit=`
  - `GET /users/{id}/follows/{creatorId}`

- **Products & Drops**
  - `POST /creators/{id}/products`
  - `GET /products?status=&page=&limit=`
  - `GET /products/{id}`
  - `POST /creators/{id}/drops`
  - `GET /drops?status=&page=&limit=`
  - `GET /drops/{id}`

- **Orders**
  - `POST /orders` (with Idempotency-Key header)  
  - `GET /users/{id}/orders?page=&limit=`

- **Notifications**
  - WebSocket: `/notifications`  
  - Events: `drop_started`, `stock_low`, `sold_out`, `order_confirmed`  

---

## Caching

- Redis stores product details and stock counts.  
- Stock is updated instantly when an order is placed.  
- Cached follower lists to avoid hot spots for big creators.  

---

## Tradeoffs

- Used **SQL** for orders/stock to guarantee no overselling.  
- Used **NoSQL** for followers to handle millions of fans.  
- **Message queue** to decouple events and scale notifications.  
- Chose **Redis** for speed but careful with invalidation when stock changes.  

---

## Requirements Check

- Handles 500–1500 reads/sec with cache  
- 150 orders/sec supported with atomic stock updates  
- Order latency <500ms  
- Notifications within 2s via queue + push  
- Scales to “celebrity” level followers  
- Idempotency prevents duplicate orders  
- Keeps working if one stateless service fails  
