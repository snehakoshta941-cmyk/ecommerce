# ECommerce Backend API

Backend API for ECommerce Mobile App with complete product management, orders, authentication, and more.

## Features

- ✅ User Authentication (JWT)
- ✅ Product Management
- ✅ Order Management
- ✅ Cart & Wishlist
- ✅ Reviews & Ratings
- ✅ Returns & Refunds
- ✅ Notifications
- ✅ Search & Filters
- ✅ Categories & Subcategories
- ✅ Coupons & Discounts

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/high-quality-beauty` - High quality beauty products
- `GET /api/products/trending-collection` - Trending products
- `GET /api/products/most-popular` - Most popular products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/related` - Get related products

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order
- `GET /api/orders/:id` - Get order details

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart

## Deploy to Render

### Step 1: Push to GitHub
```bash
cd backend-github
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ecommerce-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `PORT` - 5000 (optional, Render sets this automatically)

### Step 4: Deploy
Click "Create Web Service" and wait for deployment (2-3 minutes)

## Local Development

### Install Dependencies
```bash
npm install
```

### Create .env file
```bash
cp .env.example .env
```
Then edit `.env` with your actual values.

### Start Server
```bash
node server.js
```

Server will run on `http://localhost:5000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `EMAIL_USER` | Email for notifications | No |
| `EMAIL_PASS` | Email app password | No |

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Compression**: gzip compression enabled

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error"
}
```

## Database Models

- **User**: User accounts and authentication
- **Product**: Product catalog
- **Order**: Customer orders
- **Cart**: Shopping cart items
- **Wishlist**: User wishlist
- **Review**: Product reviews
- **Category**: Product categories
- **Notification**: User notifications
- **Return**: Return requests
- **Address**: Shipping addresses

## Support

For issues or questions, please create an issue on GitHub.

## License

MIT
