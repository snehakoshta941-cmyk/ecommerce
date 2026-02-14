# E-Commerce Backend API

Complete backend API for E-Commerce application with all features including latest fixes.

## Latest Updates

### February 14, 2026
- ✅ Fixed Return Request HTTP 500 Error
- ✅ Enhanced error handling and logging
- ✅ Dual userId support (req.user.userId and req.userId)
- ✅ Better validation and error messages
- ✅ Track Order screen image render fix
- ✅ Admin panel mobile responsive updates
- ✅ Product images in Orders, Shipments, Returns

## Features

- ✅ User Authentication (JWT)
- ✅ Product Management
- ✅ Order Management with Tracking
- ✅ Cart & Wishlist
- ✅ Returns & Refunds (Fixed HTTP 500)
- ✅ Admin Panel APIs
- ✅ Email Notifications
- ✅ Payment Integration
- ✅ Search & Filters
- ✅ Reviews & Ratings
- ✅ Shipment Tracking

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer
- CORS enabled

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update environment variables in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: Server port (default: 5000)
   - Email configuration (optional)

5. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search?q=query` - Search products

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders (with product population)
- `GET /api/orders/:id` - Get order by ID

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Returns (Fixed HTTP 500 Error)
- `POST /api/returns` - Create return request
- `GET /api/returns/my-returns` - Get user returns
- `GET /api/returns/:id` - Get return by ID

### Admin
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/returns` - Get all returns
- `PUT /api/admin/returns/:id` - Update return status

## Recent Fixes

### Return Request HTTP 500 Error Fix

**Problem**: Return requests were failing with HTTP 500 error

**Solution**:
- Added dual userId support (req.user.userId and req.userId)
- Enhanced error logging with emoji indicators
- Better validation for all required fields
- Safe item processing with default values
- Detailed error responses for debugging

**Code Changes**:
```javascript
// Dual userId support
const userId = req.user?.userId || req.userId;

// Enhanced logging
console.log('📦 Return request received:', { orderId, itemsCount, reason, userId });

// Better validation
if (!userId) {
  return res.status(401).json({ message: 'User not authenticated' });
}
```

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`
5. Deploy

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_connection_string
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

## Testing

Test the API after deployment:

```bash
# Health check
curl https://your-backend-url.com/

# Test login
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test products
curl https://your-backend-url.com/api/products
```

## Troubleshooting

### Return Request Issues

**Error**: HTTP 500 on return request
**Solution**: Check Render logs for detailed error message. Ensure:
- Order exists and belongs to user
- Order status is "Delivered"
- All required fields are provided
- JWT token is valid

**Error**: "User not authenticated"
**Solution**: Verify JWT_SECRET matches across deployments

**Error**: "Order not found"
**Solution**: Ensure order belongs to logged-in user

## License

MIT

## Support

For issues or questions:
1. Check deployment logs
2. Test API endpoints using Postman
3. Verify environment variables
4. Review error messages in logs
