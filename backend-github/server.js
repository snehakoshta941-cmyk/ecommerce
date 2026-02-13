require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression()); // Enable gzip compression for all responses
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for large payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (product images)
app.use('/images', express.static(__dirname + '/public/images'));

// Serve test page
app.use(express.static(__dirname));

// MongoDB Connection
const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: 'ecommerce', // Explicitly set database name
    };

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, options);
    console.log('✅ MongoDB Connected Successfully');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Initialize sample products after connection
    await initializeProducts();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Using mock data for development');
    console.log('💡 Note: MongoDB Compass can connect, check Node.js DNS settings');
    // Continue without DB - mock data will be used
  }
};

connectDB();

// ============ MONGOOSE SCHEMAS ============

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  image: String,
  images: [String],
  category: String,
  subCategory: String,
  subcategory: String,
  brand: String,
  rating: Number,
  reviews: Number,
  stock: Number,
  sold: Number,
  tags: [String],
  colors: [String],
  sizes: [String],
  material: String,
  care: String,
  isPopular: Boolean,
  isTrending: Boolean,
  isFeatured: Boolean,
  inStock: Boolean,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'products' });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: Array,
  total: Number,
  address: Object,
  paymentMethod: String,
  status: { type: String, default: 'Pending' },
  trackingId: String,
  shipment: {
    carrier: String,
    trackingNumber: String,
    shippedDate: Date,
    estimatedDelivery: Date,
    currentLocation: String,
    trackingHistory: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String,
    }],
  },
  createdAt: { type: Date, default: Date.now },
});

const AddressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  label: String,
  address: String,
  selected: Boolean,
});

const ReviewSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String,
  userName: String,
  createdAt: { type: Date, default: Date.now },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  image: String,
  icon: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  productCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NotificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: { type: String, enum: ['order', 'sale', 'review', 'payment', 'general'], default: 'general' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: String,
  read: { type: Boolean, default: false },
  orderId: mongoose.Schema.Types.ObjectId,
  productId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  createdAt: { type: Date, default: Date.now },
});

// Cart Schema
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    addedAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Return Schema
const ReturnSchema = new mongoose.Schema({
  returnId: { type: String, unique: true, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: false },
    name: String,
    quantity: Number,
    price: Number,
    reason: String
  }],
  reason: { type: String, required: true },
  description: String,
  images: [String],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Refunded'],
    default: 'Pending'
  },
  refund: {
    amount: Number,
    method: String,
    status: String,
    processedAt: Date,
    transactionId: String
  },
  pickup: {
    scheduled: Boolean,
    date: Date,
    timeSlot: String,
    address: String,
    trackingNumber: String
  },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Delete existing model if it exists
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Address = mongoose.model('Address', AddressSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Category = mongoose.model('Category', CategorySchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Wishlist = mongoose.model('Wishlist', WishlistSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Return = mongoose.model('Return', ReturnSchema);

// Initialize sample products if database is empty
const initializeProducts = async () => {
  try {
    // Check if connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Database not connected, skipping product initialization');
      return;
    }

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        {
          name: 'Nike Air Max 1',
          price: 8999,
          image: 'https://via.placeholder.com/150',
          category: 'Shoes',
          rating: 4.5,
          reviews: 102,
          description: 'Premium quality Nike Air Max shoes with excellent comfort.',
          inStock: true,
        },
        {
          name: 'Nike Air Max 2',
          price: 9499,
          image: 'https://via.placeholder.com/150',
          category: 'Shoes',
          rating: 4.8,
          reviews: 85,
          description: 'Latest Nike Air Max collection.',
          inStock: true,
        },
        {
          name: 'Adidas Ultraboost',
          price: 12999,
          image: 'https://via.placeholder.com/150',
          category: 'Shoes',
          rating: 4.7,
          reviews: 120,
          description: 'Comfortable running shoes.',
          inStock: true,
        },
        {
          name: 'Puma RS-X',
          price: 7999,
          image: 'https://via.placeholder.com/150',
          category: 'Shoes',
          rating: 4.3,
          reviews: 65,
          description: 'Stylish casual shoes.',
          inStock: true,
        },
      ]);
      console.log('✅ Sample products initialized');
    } else {
      console.log(`📦 Found ${count} products in database`);
    }
  } catch (error) {
    console.log('⚠️  Could not initialize products:', error.message);
  }
};

// ============ AUTH MIDDLEWARE ============
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = { userId: decoded.userId }; // Add this for compatibility
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ============ AUTH APIs ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.' 
      });
    }

    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    await newUser.save();
    console.log('✅ New user registered:', email);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.' 
      });
    }

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User logged in:', email);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP (placeholder)
app.post('/api/auth/verify-otp', (req, res) => {
  res.json({ message: 'OTP verified successfully' });
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PRODUCT APIs ============

app.get('/api/products', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when database is not connected
      const mockProducts = [
        {
          _id: '1',
          name: 'Nike Air Max 270',
          price: 8999,
          image: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Nike+Air+Max',
          category: 'Shoes',
          rating: 4.5,
          reviews: 102,
          description: 'Premium quality Nike Air Max shoes with excellent comfort and style.',
          inStock: true,
        },
        {
          _id: '2',
          name: 'Adidas Ultraboost',
          price: 12999,
          image: 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Adidas+Ultraboost',
          category: 'Shoes',
          rating: 4.8,
          reviews: 85,
          description: 'Comfortable running shoes with boost technology.',
          inStock: true,
        },
        {
          _id: '3',
          name: 'Puma RS-X',
          price: 7999,
          image: 'https://via.placeholder.com/300x300/95E1D3/FFFFFF?text=Puma+RS-X',
          category: 'Shoes',
          rating: 4.3,
          reviews: 65,
          description: 'Stylish casual shoes for everyday wear.',
          inStock: true,
        },
        {
          _id: '4',
          name: 'Reebok Classic',
          price: 5999,
          image: 'https://via.placeholder.com/300x300/F38181/FFFFFF?text=Reebok+Classic',
          category: 'Shoes',
          rating: 4.6,
          reviews: 120,
          description: 'Classic design with modern comfort.',
          inStock: true,
        },
      ];
      
      // Apply filters to mock data if provided
      const { category, search } = req.query;
      let filteredProducts = mockProducts;
      
      if (category && category !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return res.json(filteredProducts);
    }

    // Database is connected, use real data with pagination and optimization
    const { category, subCategory, search, minPrice, maxPrice, limit = 50, page = 1, diverse = 'false', isHighQuality, isPopular } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (subCategory) {
      // Support both subCategory and subcategory fields
      query.$or = [
        { subCategory: subCategory },
        { subcategory: subCategory }
      ];
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Filter by isHighQuality flag
    if (isHighQuality === 'true') {
      query.isHighQuality = true;
    }

    // Filter by isPopular flag
    if (isPopular === 'true') {
      query.isPopular = true;
    }

    // Add pagination and limit
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;

    let products;

    // If diverse=true, get a mix of products from different subcategories
    if (diverse === 'true' && !category && !subCategory) {
      // Get products from different categories for diversity
      const categories = ['Clothes', 'Shoes', 'Bags', 'Electronics', 'Watch', 'Jewelry', 'Beauty', 'Kitchen', 'Toys'];
      const productsPerCategory = 1; // Get 1 product from each category
      
      const diverseProducts = [];
      for (const cat of categories) {
        const catProducts = await Product.find({ category: cat })
          .select('name price originalPrice discount image images category subCategory subcategory rating reviews description inStock brand stock sold tags colors isHighQuality isTrending isPopular isFeatured')
          .limit(productsPerCategory)
          .lean()
          .exec();
        diverseProducts.push(...catProducts);
        
        // Stop if we have enough products
        if (diverseProducts.length >= limitNum) break;
      }
      
      // If we don't have enough diverse products, fill with random products
      if (diverseProducts.length < limitNum) {
        const remaining = limitNum - diverseProducts.length;
        const additionalProducts = await Product.find({})
          .select('name price originalPrice discount image images category subCategory subcategory rating reviews description inStock brand stock sold tags colors isHighQuality isTrending isPopular isFeatured')
          .limit(remaining)
          .skip(Math.floor(Math.random() * 100)) // Random offset
          .lean()
          .exec();
        diverseProducts.push(...additionalProducts);
      }
      
      // Shuffle and limit to requested amount
      products = diverseProducts
        .sort(() => Math.random() - 0.5)
        .slice(0, limitNum);
    } else {
      // Optimize query with lean() for faster performance
      products = await Product.find(query)
        .select('name price originalPrice discount image images category subCategory subcategory rating reviews description inStock brand stock sold tags colors isHighQuality isTrending isPopular isFeatured') // Only select needed fields
        .limit(limitNum)
        .skip(skip)
        .lean() // Returns plain JavaScript objects instead of Mongoose documents
        .exec();
    }

    // Get total count for pagination info
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular products (isPopular: true)
app.get('/api/products/popular/list', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const { limit = 6 } = req.query;
    
    // Find products marked as popular
    const products = await Product.find({ isPopular: true })
      .select('name price originalPrice discount image images category subcategory brand rating reviews stock sold tags colors sizes material isPopular isTrending')
      .limit(parseInt(limit))
      .sort({ sold: -1, rating: -1 }) // Sort by most sold and highest rated
      .lean()
      .exec();

    res.json(products);
  } catch (error) {
    console.error('Popular products API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search products - MUST be before /:id route
app.get('/api/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    // Search in name, description, category, subCategory
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { subCategory: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name price originalPrice discount image images category subCategory subcategory rating reviews description inStock brand stock sold tags colors isHighQuality isTrending isPopular isFeatured')
    .limit(50)
    .lean()
    .exec();

    console.log(`🔍 Search for "${q}" found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get High Quality Beauty Products
app.get('/api/products/high-quality-beauty', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const products = await Product.find({
      category: 'Beauty',
      isHighQuality: true
    })
    .select('name price originalPrice discount image images category subcategory rating reviews description inStock brand stock sold tags colors isHighQuality')
    .limit(10)
    .sort({ rating: -1, sold: -1 })
    .lean()
    .exec();

    console.log(`✨ High Quality Beauty: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('High Quality Beauty API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Trending Collection (Bangles)
app.get('/api/products/trending-collection', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { isTrending: true },
        { subcategory: 'Bangles' },
        { subCategory: 'Bangles' }
      ]
    })
    .select('name price originalPrice discount image images category subcategory rating reviews description inStock brand stock sold tags colors isTrending')
    .limit(10)
    .sort({ sold: -1, rating: -1 })
    .lean()
    .exec();

    console.log(`🔥 Trending Collection: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Trending Collection API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Most Popular Products
app.get('/api/products/most-popular', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const products = await Product.find({ isPopular: true })
    .select('name price originalPrice discount image images category subcategory rating reviews description inStock brand stock sold tags colors isPopular')
    .limit(10)
    .sort({ sold: -1, rating: -1 })
    .lean()
    .exec();

    console.log(`⭐ Most Popular: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Most Popular API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Related Products (Fast & Optimized)
app.get('/api/products/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;
    
    // Get the current product to find its category
    const currentProduct = await Product.findById(id).select('category subcategory').lean();
    
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Build query for related products
    const query = {
      _id: { $ne: id }, // Exclude current product
      category: currentProduct.category, // Same category
    };
    
    // If subcategory exists, prioritize same subcategory
    if (currentProduct.subcategory) {
      query.subcategory = currentProduct.subcategory;
    }
    
    // Fetch related products with minimal fields for speed
    let relatedProducts = await Product.find(query)
      .select('name price originalPrice discount image category subcategory rating reviews stock inStock')
      .limit(parseInt(limit) * 2) // Get more to filter
      .lean()
      .exec();
    
    // If not enough products with same subcategory, get from same category
    if (relatedProducts.length < parseInt(limit) && currentProduct.subcategory) {
      const additionalQuery = {
        _id: { $ne: id },
        category: currentProduct.category,
        subcategory: { $ne: currentProduct.subcategory }
      };
      
      const additionalProducts = await Product.find(additionalQuery)
        .select('name price originalPrice discount image category subcategory rating reviews stock inStock')
        .limit(parseInt(limit))
        .lean()
        .exec();
      
      relatedProducts = [...relatedProducts, ...additionalProducts];
    }
    
    // Filter and limit
    const filtered = relatedProducts
      .filter(p => p.inStock !== false && p.stock > 0)
      .slice(0, parseInt(limit));
    
    res.json(filtered);
  } catch (error) {
    console.error('Related products API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN PRODUCT APIs ============

// Add Product (Admin)
app.post('/api/admin/products', authMiddleware, async (req, res) => {
  try {
    const { name, price, image, category, subCategory, description, rating, reviews, inStock } = req.body;

    const newProduct = new Product({
      name,
      price,
      image,
      category,
      subCategory,
      description,
      rating: rating || 4.5,
      reviews: reviews || 0,
      inStock: inStock !== undefined ? inStock : true,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Product (Admin)
app.put('/api/admin/products/:id', authMiddleware, async (req, res) => {
  try {
    const { name, price, image, category, subCategory, description, rating, reviews, inStock } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (image) product.image = image;
    if (category) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (description) product.description = description;
    if (rating) product.rating = rating;
    if (reviews !== undefined) product.reviews = reviews;
    if (inStock !== undefined) product.inStock = inStock;

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Product (Admin)
app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle Product Visibility (Admin)
app.patch('/api/admin/products/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.inStock = !product.inStock;
    await product.save();

    res.json({ message: 'Product visibility toggled', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ORDER APIs ============

// Place Order
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;

    const newOrder = new Order({
      userId: req.userId,
      user: req.userId,  // Add user field for populate
      items,
      total,
      address,
      paymentMethod,
      status: 'Pending',
      trackingId: `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`,
    });

    await newOrder.save();

    // Create notification for order placement
    const notification = new Notification({
      userId: req.userId,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order #${newOrder.trackingId} has been placed successfully. Total: ₹${total}`,
      icon: '📦',
      orderId: newOrder._id,
    });
    await notification.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders }); // Wrap in object for consistency
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Order
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ NOTIFICATION APIs ============

// Get User Notifications
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Unread Notification Count
app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark Notification as Read
app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark All Notifications as Read
app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Notification
app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ WISHLIST APIs ============

// Get User Wishlist
app.get('/api/wishlist', authMiddleware, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.userId })
      .populate('productId')
      .sort({ createdAt: -1 });
    
    // Filter out items where product no longer exists
    const validItems = wishlistItems.filter(item => item.productId);
    
    // Return products array
    const products = validItems.map(item => item.productId);
    
    res.json({ wishlist: products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to Wishlist
app.post('/api/wishlist', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({ 
      userId: req.userId, 
      productId 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add to wishlist
    const wishlistItem = new Wishlist({
      userId: req.userId,
      productId
    });
    
    await wishlistItem.save();
    
    res.status(201).json({ 
      message: 'Added to wishlist', 
      product 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove from Wishlist
app.delete('/api/wishlist/:productId', authMiddleware, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOneAndDelete({
      userId: req.userId,
      productId: req.params.productId
    });
    
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if Product is in Wishlist
app.get('/api/wishlist/check/:productId', authMiddleware, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      userId: req.userId,
      productId: req.params.productId
    });
    
    res.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ CART APIs ============

// Get User Cart
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
      await cart.save();
    }
    
    // Filter out items where product no longer exists
    const validItems = cart.items.filter(item => item.productId);
    
    res.json({ cart: { items: validItems, total: calculateCartTotal(validItems) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to Cart
app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }
    
    // Check if product already in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.productId');
    
    res.json({ message: 'Added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Cart Item
app.put('/api/cart/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item.productId.toString() === req.params.productId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.productId');
    
    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove from Cart
app.delete('/api/cart/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json({ message: 'Removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear Cart
app.delete('/api/cart', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate cart total
function calculateCartTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.productId?.price || 0) * item.quantity;
  }, 0);
}

// ============ ADMIN ORDER APIs ============

// Get All Orders (Admin)
app.get('/api/admin/orders', authMiddleware, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.trackingId = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Normalize user field (use user if exists, otherwise userId)
    const normalizedOrders = orders.map(order => {
      const orderObj = order.toObject();
      if (!orderObj.user && orderObj.userId) {
        orderObj.user = orderObj.userId;
      }
      return orderObj;
    });

    const total = await Order.countDocuments(query);

    res.json({
      orders: normalizedOrders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Order Status (Admin)
app.put('/api/admin/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate tracking info when status changes to "Shipped"
    if (status === 'Shipped' && (!order.shipment || !order.shipment.trackingNumber)) {
      // Generate tracking number
      const carriers = ['BlueDart', 'FedEx', 'DHL Express', 'India Post', 'Delhivery'];
      const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
      const trackingPrefix = randomCarrier === 'BlueDart' ? 'BLUE' : 
                            randomCarrier === 'FedEx' ? 'FDX' :
                            randomCarrier === 'DHL Express' ? 'DHL' :
                            randomCarrier === 'India Post' ? 'IP' : 'DLV';
      const trackingNumber = `${trackingPrefix}-${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Set estimated delivery (3-5 days from now)
      const daysToDeliver = Math.floor(Math.random() * 3) + 3; // 3-5 days
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToDeliver);
      
      // Initialize shipment data
      order.shipment = {
        carrier: randomCarrier,
        trackingNumber: trackingNumber,
        shippedDate: new Date(),
        estimatedDelivery: estimatedDelivery,
        currentLocation: 'Warehouse - Dispatched',
        trackingHistory: [
          {
            status: 'Shipped',
            location: 'Warehouse',
            timestamp: new Date(),
            description: 'Package dispatched from warehouse'
          }
        ]
      };
      
      console.log(`✅ Generated tracking for order ${order.trackingId}: ${trackingNumber}`);
    }

    // Update tracking history when status changes
    if (order.shipment && order.shipment.trackingHistory) {
      const locationMap = {
        'Processing': 'Warehouse - Packing',
        'Shipped': 'In Transit',
        'Delivered': 'Customer Location',
        'Cancelled': 'Warehouse - Returned'
      };
      
      order.shipment.trackingHistory.push({
        status: status,
        location: locationMap[status] || 'Unknown',
        timestamp: new Date(),
        description: `Order status updated to ${status}`
      });
      
      order.shipment.currentLocation = locationMap[status] || order.shipment.currentLocation;
    }

    order.status = status;
    await order.save();

    // Create notification for status update
    let notificationMessage = '';
    let notificationIcon = '📦';
    
    switch(status) {
      case 'Processing':
        notificationMessage = `Your order #${order.trackingId} is now being processed.`;
        notificationIcon = '⚙️';
        break;
      case 'Shipped':
        notificationMessage = `Your order #${order.trackingId} has been shipped! Tracking: ${order.shipment?.trackingNumber || 'N/A'}`;
        notificationIcon = '🚚';
        break;
      case 'Delivered':
        notificationMessage = `Your order #${order.trackingId} has been delivered. Enjoy your purchase!`;
        notificationIcon = '✅';
        break;
      case 'Cancelled':
        notificationMessage = `Your order #${order.trackingId} has been cancelled.`;
        notificationIcon = '❌';
        break;
    }

    if (notificationMessage) {
      const notification = new Notification({
        userId: order.userId,
        type: 'order',
        title: `Order ${status}`,
        message: notificationMessage,
        icon: notificationIcon,
        orderId: order._id,
      });
      await notification.save();
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Order Stats (Admin)
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADDRESS APIs ============

app.get('/api/addresses', authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/addresses', authMiddleware, async (req, res) => {
  try {
    const { label, address } = req.body;

    const newAddress = new Address({
      userId: req.userId,
      label,
      address,
      selected: false,
    });

    await newAddress.save();
    res.status(201).json({ message: 'Address added', address: newAddress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ REVIEW APIs ============

app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment, userName } = req.body;

    const newReview = new Review({
      productId,
      userId: req.userId,
      rating,
      comment,
      userName,
    });

    await newReview.save();
    res.status(201).json({ message: 'Review added', review: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PROFILE APIs ============

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json({ message: 'Profile updated', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN USER APIs ============

// Get All Users (Admin)
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Detail (Admin)
app.get('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(10);
    const totalOrders = await Order.countDocuments({ userId: req.params.id });
    const totalSpent = await Order.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      user,
      orders,
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete User (Admin)
app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN CATEGORY APIs ============

// Get All Categories (Admin)
app.get('/api/admin/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Category (Admin)
app.get('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get product count for this category
    const productCount = await Product.countDocuments({ category: category.name });
    
    res.json({ 
      category: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Category (Admin)
app.post('/api/admin/categories', authMiddleware, async (req, res) => {
  try {
    const { name, description, image, icon, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const newCategory = new Category({
      name,
      description,
      image,
      icon,
      status: status || 'active',
    });
    
    await newCategory.save();
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Category (Admin)
app.put('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, image, icon, status } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (status) category.status = status;
    category.updatedAt = Date.now();
    
    await category.save();
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Category (Admin)
app.delete('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productCount} products are using this category.` 
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle Category Status (Admin)
app.patch('/api/admin/categories/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    category.status = category.status === 'active' ? 'inactive' : 'active';
    category.updatedAt = Date.now();
    await category.save();
    
    res.json({ message: 'Category status updated', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN INVENTORY APIs ============

// Get Inventory Overview
app.get('/api/admin/inventory', authMiddleware, async (req, res) => {
  try {
    const { search, category, stockStatus, sortBy } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    // Stock status filter
    if (stockStatus === 'low') {
      query.$expr = { $lte: ['$stock', 10] };
    } else if (stockStatus === 'out') {
      query.stock = 0;
    } else if (stockStatus === 'in') {
      query.stock = { $gt: 0 };
    }
    
    let sortOptions = {};
    if (sortBy === 'stock_asc') sortOptions.stock = 1;
    else if (sortBy === 'stock_desc') sortOptions.stock = -1;
    else if (sortBy === 'name') sortOptions.name = 1;
    else sortOptions.createdAt = -1;
    
    const products = await Product.find(query).sort(sortOptions);
    
    // Calculate stats
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ $expr: { $lte: ['$stock', 10] } });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const totalValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);
    
    res.json({
      products,
      stats: {
        totalProducts,
        lowStock,
        outOfStock,
        inStock: totalProducts - outOfStock,
        totalValue: totalValue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Low Stock Products
app.get('/api/admin/inventory/low-stock', authMiddleware, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ 
      $expr: { $lte: ['$stock', threshold] } 
    }).sort({ stock: 1 });
    
    res.json({ products, threshold });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Product Stock
app.patch('/api/admin/inventory/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { stock, action, quantity } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let newStock = product.stock;
    
    if (action === 'set') {
      newStock = stock;
    } else if (action === 'add') {
      newStock += quantity;
    } else if (action === 'subtract') {
      newStock = Math.max(0, newStock - quantity);
    }
    
    product.stock = newStock;
    await product.save();
    
    res.json({ message: 'Stock updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk Stock Update
app.post('/api/admin/inventory/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { updates } = req.body; // [{ productId, stock }]
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Invalid updates array' });
    }
    
    const results = [];
    for (const update of updates) {
      try {
        const product = await Product.findByIdAndUpdate(
          update.productId,
          { stock: update.stock },
          { new: true }
        );
        results.push({ productId: update.productId, success: true, product });
      } catch (err) {
        results.push({ productId: update.productId, success: false, error: err.message });
      }
    }
    
    res.json({ message: 'Bulk update completed', results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Inventory History (mock data for now)
app.get('/api/admin/inventory/history', authMiddleware, async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.query;
    
    // For now, return mock history
    // In production, you'd have a separate InventoryHistory collection
    const history = [];
    
    res.json({ history, message: 'Inventory history feature coming soon' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN SHIPMENT APIs ============

// Get All Shipments
app.get('/api/admin/shipments', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = { status: { $in: ['Processing', 'Shipped', 'Delivered'] } };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'shipment.trackingNumber': { $regex: search, $options: 'i' } }
      ];
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    // Calculate stats
    const totalShipments = await Order.countDocuments({ status: { $in: ['Processing', 'Shipped', 'Delivered'] } });
    const inTransit = await Order.countDocuments({ status: 'Shipped' });
    const delivered = await Order.countDocuments({ status: 'Delivered' });
    const pending = await Order.countDocuments({ status: 'Processing' });
    
    res.json({
      shipments: orders,
      stats: { totalShipments, inTransit, delivered, pending }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Shipment Details
app.get('/api/admin/shipments/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json({ shipment: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Shipment Tracking
app.put('/api/admin/shipments/:id/tracking', authMiddleware, async (req, res) => {
  try {
    const { carrier, trackingNumber, currentLocation, estimatedDelivery } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (!order.shipment) {
      order.shipment = {};
    }
    
    if (carrier) order.shipment.carrier = carrier;
    if (trackingNumber) order.shipment.trackingNumber = trackingNumber;
    if (currentLocation) order.shipment.currentLocation = currentLocation;
    if (estimatedDelivery) order.shipment.estimatedDelivery = new Date(estimatedDelivery);
    
    if (!order.shipment.shippedDate && order.status === 'Processing') {
      order.shipment.shippedDate = new Date();
      order.status = 'Shipped';
    }
    
    await order.save();
    res.json({ message: 'Tracking updated successfully', shipment: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add Tracking Event
app.post('/api/admin/shipments/:id/tracking-event', authMiddleware, async (req, res) => {
  try {
    const { status, location, description } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (!order.shipment) {
      order.shipment = { trackingHistory: [] };
    }
    
    if (!order.shipment.trackingHistory) {
      order.shipment.trackingHistory = [];
    }
    
    order.shipment.trackingHistory.push({
      status,
      location,
      description,
      timestamp: new Date(),
    });
    
    if (location) {
      order.shipment.currentLocation = location;
    }
    
    await order.save();
    res.json({ message: 'Tracking event added', shipment: order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN RETURNS & REFUNDS APIs ============

// Get All Returns
// DEPRECATED - Old mock endpoint - Use the one at line 2424 instead
/*
app.get('/api/admin/returns', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Mock data - in production you'd have a Returns collection
    const returns = [];
    
    res.json({ returns, stats: { total: 0, pending: 0, approved: 0, rejected: 0 }, message: 'Returns feature coming soon' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
*/

// Process Refund
app.post('/api/admin/refunds/:orderId', authMiddleware, async (req, res) => {
  try {
    const { amount, reason, method } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Mock refund processing
    res.json({ message: 'Refund processed successfully (mock)', refund: { amount, reason, method, status: 'processed' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ WALLET APIs ============

// Wallet Schema
const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    balanceAfter: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Wallet = mongoose.model('Wallet', walletSchema);

// Get Wallet Balance and Transactions
app.get('/api/wallet', authMiddleware, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId, balance: 0, transactions: [] });
      await wallet.save();
    }
    
    res.json({ 
      balance: wallet.balance,
      transactions: wallet.transactions.sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add Money to Wallet
app.post('/api/wallet/add', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId, balance: 0, transactions: [] });
    }
    
    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount: amount,
      description: `Money Added via ${paymentMethod || 'Card'}`,
      balanceAfter: wallet.balance,
      createdAt: new Date()
    });
    wallet.updatedAt = new Date();
    
    await wallet.save();
    
    res.json({ 
      message: 'Money added successfully',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deduct from Wallet (for orders)
app.post('/api/wallet/deduct', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount: amount,
      description: description || `Payment for Order`,
      orderId: orderId,
      balanceAfter: wallet.balance,
      createdAt: new Date()
    });
    wallet.updatedAt = new Date();
    
    await wallet.save();
    
    res.json({ 
      message: 'Payment successful',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ COUPON APIs ============

// Coupon Schema
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.model('Coupon', couponSchema);

// ============ ADMIN COUPON APIs ============

// Get All Coupons (Admin)
app.get('/api/admin/coupons', authMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Coupon (Admin)
app.get('/api/admin/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Coupon (Admin)
app.post('/api/admin/coupons', authMiddleware, async (req, res) => {
  try {
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minOrderAmount, 
      maxDiscount, 
      validFrom, 
      validUntil, 
      usageLimit, 
      isActive 
    } = req.body;
    
    if (!code || !description || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      validFrom: validFrom || Date.now(),
      validUntil,
      usageLimit,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Coupon (Admin)
app.put('/api/admin/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minOrderAmount, 
      maxDiscount, 
      validFrom, 
      validUntil, 
      usageLimit, 
      isActive 
    } = req.body;
    
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Check if new code already exists (excluding current coupon)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }
    
    if (code) coupon.code = code.toUpperCase();
    if (description) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (validFrom) coupon.validFrom = validFrom;
    if (validUntil) coupon.validUntil = validUntil;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    
    await coupon.save();
    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Coupon (Admin)
app.delete('/api/admin/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle Coupon Status (Admin)
app.patch('/api/admin/coupons/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({ message: 'Coupon status updated', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ USER COUPON APIs ============

// Get All Active Coupons
app.get('/api/coupons', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Validate and Apply Coupon
app.post('/api/coupons/validate', authMiddleware, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({ message: 'Code and order amount required' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    const now = new Date();
    
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is not active' });
    }
    
    if (coupon.validFrom > now) {
      return res.status(400).json({ message: 'Coupon is not yet valid' });
    }
    
    if (coupon.validUntil < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
      });
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }
    
    res.json({ 
      valid: true,
      discount: discount,
      finalAmount: orderAmount - discount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply Coupon (increment usage count)
app.post('/api/coupons/apply', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    coupon.usedCount += 1;
    await coupon.save();
    
    res.json({ message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PAYMENT METHOD APIs ============

// Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['card', 'upi', 'netbanking'], required: true },
  cardNumber: { type: String },
  cardHolderName: { type: String },
  expiryDate: { type: String },
  cardType: { type: String, enum: ['visa', 'mastercard', 'amex', 'rupay'] },
  upiId: { type: String },
  bankName: { type: String },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

// Get All Payment Methods
app.get('/api/payment-methods', authMiddleware, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ paymentMethods });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add Payment Method
app.post('/api/payment-methods', authMiddleware, async (req, res) => {
  try {
    const { type, cardNumber, cardHolderName, expiryDate, cardType, upiId, bankName, isDefault } = req.body;
    
    if (isDefault) {
      await PaymentMethod.updateMany({ userId: req.userId }, { isDefault: false });
    }
    
    const paymentMethod = new PaymentMethod({
      userId: req.userId,
      type,
      cardNumber: cardNumber ? `****${cardNumber.slice(-4)}` : undefined,
      cardHolderName,
      expiryDate,
      cardType,
      upiId,
      bankName,
      isDefault: isDefault || false
    });
    
    await paymentMethod.save();
    
    res.status(201).json({ message: 'Payment method added', paymentMethod });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Payment Method
app.delete('/api/payment-methods/:id', authMiddleware, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    res.json({ message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set Default Payment Method
app.put('/api/payment-methods/:id/default', authMiddleware, async (req, res) => {
  try {
    await PaymentMethod.updateMany({ userId: req.userId }, { isDefault: false });
    
    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDefault: true },
      { new: true }
    );
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    res.json({ message: 'Default payment method updated', paymentMethod });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ============ RETURN APIs ============

// Create Return Request
app.post('/api/returns', authMiddleware, async (req, res) => {
  try {
    const { orderId, items, reason, description, images, refundMethod } = req.body;
    
    console.log('📦 Return request received:', { orderId, itemsCount: items?.length, reason });
    
    if (!orderId || !items || items.length === 0 || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, userId: req.user.userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    
    // Generate unique return ID
    const returnId = `RET-${Date.now()}`;
    
    // Process items - ensure productId is valid ObjectId or skip it
    const processedItems = items.map((item, index) => {
      let productId = null;
      
      // Try to get valid productId
      if (item.productId && typeof item.productId === 'string' && item.productId.length === 24) {
        // Valid ObjectId format
        try {
          // Verify it's a valid hex string
          if (/^[0-9a-fA-F]{24}$/.test(item.productId)) {
            productId = item.productId;
          }
        } catch (e) {
          console.log(`⚠️  Invalid productId format for item ${index}: ${item.productId}`);
        }
      }
      
      // If still no valid productId, try to get from order items
      if (!productId) {
        const orderItem = order.items[index] || order.items.find(oi => oi.name === item.name);
        if (orderItem && orderItem.productId) {
          productId = orderItem.productId;
        }
      }
      
      // Build item object - only include productId if it's valid
      const itemData = {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        reason: item.reason || reason
      };
      
      // Only add productId if it's a valid ObjectId
      if (productId) {
        itemData.productId = productId;
      }
      
      console.log(`Item ${index}: productId=${productId || 'SKIPPED'}, name=${item.name}`);
      
      return itemData;
    });
    
    // Calculate refund amount
    const refundAmount = processedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('💰 Refund amount:', refundAmount);
    
    // Create return request
    const returnRequest = new Return({
      returnId,
      orderId,
      userId: req.user.userId,
      items: processedItems,
      reason,
      description: description || '',
      images: images || [],
      status: 'Pending',
      refund: {
        amount: refundAmount,
        method: refundMethod || 'original',
        status: 'pending'
      },
      pickup: {
        scheduled: false,
        address: order.address?.address || ''
      }
    });
    
    await returnRequest.save();
    
    console.log('✅ Return created:', returnId);
    
    res.status(201).json({
      message: 'Return request submitted successfully',
      return: returnRequest
    });
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Returns (alias for /api/returns/my-returns)
app.get('/api/returns', authMiddleware, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user.userId })
      .populate('orderId')
      .sort({ createdAt: -1 });
    
    res.json({ returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Returns
app.get('/api/returns/my-returns', authMiddleware, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user.userId })
      .populate('orderId')
      .sort({ createdAt: -1 });
    
    res.json({ returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Return by ID
app.get('/api/returns/:id', authMiddleware, async (req, res) => {
  try {
    const returnRequest = await Return.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('orderId');
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    res.json({ return: returnRequest });
  } catch (error) {
    console.error('Error fetching return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel Return Request
app.delete('/api/returns/:id', authMiddleware, async (req, res) => {
  try {
    const returnRequest = await Return.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    if (returnRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending returns can be cancelled' });
    }
    
    await Return.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Return request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ADMIN RETURN APIs ============

// Get All Returns (Admin)
app.get('/api/admin/returns', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = status && status !== 'all' ? { status } : {};
    
    const returns = await Return.find(query)
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Return.countDocuments(query);
    
    res.json({
      returns,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Return by ID (Admin)
app.get('/api/admin/returns/:id', authMiddleware, async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('orderId');
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    res.json({ return: returnRequest });
  } catch (error) {
    console.error('Error fetching return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve Return (Admin)
app.put('/api/admin/returns/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { pickupDate, timeSlot } = req.body;
    
    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    returnRequest.status = 'Approved';
    returnRequest.pickup.scheduled = true;
    returnRequest.pickup.date = pickupDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    returnRequest.pickup.timeSlot = timeSlot || '10:00 AM - 2:00 PM';
    returnRequest.pickup.trackingNumber = `PKP-${Date.now()}`;
    returnRequest.updatedAt = new Date();
    
    await returnRequest.save();
    
    res.json({
      message: 'Return approved successfully',
      return: returnRequest
    });
  } catch (error) {
    console.error('Error approving return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject Return (Admin)
app.put('/api/admin/returns/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    returnRequest.status = 'Rejected';
    returnRequest.adminNotes = reason || 'Return request rejected';
    returnRequest.updatedAt = new Date();
    
    await returnRequest.save();
    
    res.json({
      message: 'Return rejected',
      return: returnRequest
    });
  } catch (error) {
    console.error('Error rejecting return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process Refund (Admin)
app.post('/api/admin/returns/:id/refund', authMiddleware, async (req, res) => {
  try {
    const { amount, method, notes } = req.body;
    
    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    returnRequest.status = 'Refunded';
    returnRequest.refund.amount = amount || returnRequest.refund.amount;
    returnRequest.refund.method = method || returnRequest.refund.method;
    returnRequest.refund.status = 'completed';
    returnRequest.refund.processedAt = new Date();
    returnRequest.refund.transactionId = `TXN-${Date.now()}`;
    returnRequest.adminNotes = notes || '';
    returnRequest.updatedAt = new Date();
    
    await returnRequest.save();
    
    res.json({
      message: 'Refund processed successfully',
      return: returnRequest
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Return Status (Admin)
app.put('/api/admin/returns/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return not found' });
    }
    
    returnRequest.status = status;
    returnRequest.updatedAt = new Date();
    
    await returnRequest.save();
    
    res.json({
      message: 'Return status updated',
      return: returnRequest
    });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ CATEGORY APIs ============

// Get All Categories
app.get('/api/categories', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const categories = await Category.find({ status: 'active' })
      .select('name description image icon productCount')
      .sort({ name: 1 })
      .lean();
    
    res.json(categories);
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Category by ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ USER PROFILE APIs ============

// Get User Profile
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== req.userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 Network access: http://192.168.1.3:${PORT}/api`);
  console.log(`🔐 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
});
