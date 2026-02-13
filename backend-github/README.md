# 🛍️ ECommerce Backend API

Complete backend API for ECommerce Mobile App with product management, orders, authentication, and more.

## ✨ Features

- ✅ User Authentication (JWT)
- ✅ Product Management with Categories
- ✅ Order Management & Tracking
- ✅ Cart & Wishlist
- ✅ Reviews & Ratings
- ✅ Returns & Refunds
- ✅ Notifications
- ✅ Search & Filters
- ✅ Coupons & Discounts
- ✅ HomeScreen Sections (Most Popular, Trending, High Quality)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB URI and JWT secret.

### 3. Seed Database (Optional)
```bash
# Seed all HomeScreen products (Sarees, Bangles, Beauty)
node seed-all-homescreen-products.js
```

### 4. Start Server
```bash
node server.js
```

Server runs on `http://localhost:5000`

---

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/popular` - Most popular products (8 sarees)
- `GET /api/products/trending` - Trending collection (6 bangles)
- `GET /api/products/high-quality-beauty` - High quality beauty (8 products)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/related` - Get related products

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Returns
- `GET /api/returns` - Get user returns
- `POST /api/returns` - Create return request
- `GET /api/returns/:id` - Get return details

---

## 🗄️ Database Seeding

### Seed HomeScreen Products
Run this script to populate your database with curated products:

```bash
node seed-all-homescreen-products.js
```

This will add:
- **8 Party Wear Sarees** (Most Popular section)
- **6 Designer Bangles** (Trending Collection)
- **8 Beauty Products** (High Quality Beauty)

All products have:
- ✅ Unique images (no duplicates)
- ✅ Names matching images
- ✅ Proper categorization
- ✅ Ratings and reviews

---

## 🌐 Deploy to Render

### Step 1: Push to GitHub
```bash
cd backend-github
git init
git add .
git commit -m "Initial commit - ECommerce Backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: ecommerce-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Your JWT secret key (generate a random string)

### Step 4: Deploy
Click **Create Web Service** and wait 2-3 minutes for deployment.

### Step 5: Seed Database (After Deployment)
Once deployed, run the seed script on Render:
1. Go to your service → **Shell** tab
2. Run: `node seed-all-homescreen-products.js`

---

## 📦 HomeScreen Products

### Most Popular Section (8 Sarees)
- Beige Sequins Embroidered Party Wear Saree - ₹2,499
- Neon Pink Embroidered Party Wear Saree - ₹2,799
- Charming Orange Soft Jimmy Choo Saree - ₹2,299
- Sangria Embellished Party Wear Saree - ₹3,199
- Chaand Party Wear Saree with Blouse - ₹2,899
- Grey Silk Party Wear Saree - ₹2,599
- Red Georgette Sequence Work Saree - ₹2,399
- Banarasi Soft Silk Zari Weaving Saree - ₹3,499

### Trending Collection (6 Bangles)
- Designer Gold Plated Bangles Set - ₹1,299
- Traditional Kundan Bangles - ₹1,599
- Antique Gold Plated Floral Bangles - ₹1,399
- Bridal Rajwadi Bangle Set - ₹2,199
- Gold Finish Kundan Jhoomer Bangles - ₹1,799
- Premium Designer Bangles - ₹1,899

### High Quality Beauty (8 Products)
- Mamaearth Rice Face Wash - ₹249
- Mamaearth Cleanse & Glow Kit - ₹499
- Mamaearth Charcoal Face Scrub - ₹299
- Lindo Beauty Rose Cream - ₹199
- Panchvati Rose Nourishing Cream - ₹349
- Avon Naturals Rose Day Cream - ₹399
- Vaseline SPF 30 Body Lotion - ₹449
- Vaseline Mature Skin Rejuvenation - ₹499

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `EMAIL_USER` | Email for notifications | No |
| `EMAIL_PASSWORD` | Email app password | No |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Compression**: gzip compression enabled

---

## 📝 API Response Format

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

---

## 📊 Database Models

- **User**: User accounts and authentication
- **Product**: Product catalog with categories
- **Order**: Customer orders with tracking
- **Cart**: Shopping cart items
- **Wishlist**: User wishlist
- **Review**: Product reviews and ratings
- **Category**: Product categories
- **Notification**: User notifications
- **Return**: Return requests
- **Address**: Shipping addresses

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS enabled for mobile app
- Input validation
- Error handling middleware

---

## 📱 Mobile App Integration

This backend is designed to work with the ECommerce React Native mobile app.

**Backend URL Format**: `https://your-backend.onrender.com/api`

Update your mobile app's `.env` file:
```
API_BASE_URL=https://your-backend.onrender.com/api
```

---

## 🐛 Troubleshooting

### Cold Start (Render Free Tier)
- First request may take 30-60 seconds
- Subsequent requests are fast (1-3 seconds)
- Mobile app has retry logic built-in

### Database Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has read/write permissions

### Deployment Issues
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `node server.js` is the start command

---

## 📄 License

MIT

---

## 🤝 Support

For issues or questions, create an issue on GitHub.

---

## 🎯 Next Steps

1. ✅ Deploy to Render
2. ✅ Add environment variables
3. ✅ Run seed script
4. ✅ Test API endpoints
5. ✅ Connect mobile app
6. ✅ Test HomeScreen sections

**Happy Coding! 🚀**
