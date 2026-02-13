# ECommerce Backend API

Node.js + Express + MongoDB backend for ECommerce mobile app.

## Features

- User authentication (JWT)
- Product management with search
- Order management with tracking
- Wishlist & Cart
- Returns & Refunds
- Notifications
- Coupons
- Reviews & Ratings
- Email notifications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

3. Start server:
```bash
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/popular/list` - Get popular products

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order
- `PUT /api/orders/:id/status` - Update order status

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Returns
- `GET /api/returns` - Get returns
- `POST /api/returns` - Create return request

## Deployment

### Render
1. Push to GitHub
2. Connect to Render
3. Add environment variables
4. Deploy

### Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `EMAIL_USER` - Email for notifications
- `EMAIL_PASSWORD` - Email app password

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer
- Compression
- CORS
