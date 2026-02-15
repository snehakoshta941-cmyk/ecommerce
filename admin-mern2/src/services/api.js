import axios from 'axios'

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.3:5000/api'

console.log('🌐 Admin API URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('📤 API Request:', config.method.toUpperCase(), config.url)
  return config
})

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, {
      status: response.status,
      dataType: Array.isArray(response.data) ? 'Array' : typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      dataLength: Array.isArray(response.data) ? response.data.length : 
                  response.data?.products?.length || 'N/A'
    })
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.message)
    return Promise.reject(error)
  }
)

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })

// Stats
export const getStats = () => api.get('/admin/stats')

// Products
export const getProducts = async (params = {}) => {
  // Add cache buster to force fresh data
  const cacheParams = { ...params, _v: Date.now() }
  const response = await api.get('/products', { params: cacheParams })
  // Normalize response format - backend returns { products: [], pagination: {} }
  if (response.data && response.data.products) {
    return { ...response, data: response.data.products }
  }
  return response
}
export const addProduct = (data) => api.post('/admin/products', data)
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`)

// Orders
export const getOrders = (params) => api.get('/admin/orders', { params })
export const getOrderById = (id) => api.get(`/orders/${id}`)
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status })
export const cancelOrder = (id) => api.put(`/admin/orders/${id}/status`, { status: 'Cancelled' })

// Users
export const getUsers = (params) => api.get('/admin/users', { params })
export const getUserDetails = (id) => api.get(`/admin/users/${id}`)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)

// Inventory
export const getInventory = (params) => api.get('/admin/inventory', { params })
export const getLowStockProducts = (threshold) => api.get('/admin/inventory/low-stock', { params: { threshold } })
export const updateStock = (id, data) => api.patch(`/admin/inventory/${id}/stock`, data)
export const bulkStockUpdate = (updates) => api.post('/admin/inventory/bulk-update', { updates })

// Categories
export const getCategories = () => api.get('/admin/categories')
export const getCategoryById = (id) => api.get(`/admin/categories/${id}`)
export const addCategory = (data) => api.post('/admin/categories', data)
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`)
export const toggleCategoryStatus = (id) => api.patch(`/admin/categories/${id}/toggle`)

// Shipments
export const getShipments = (params) => api.get('/admin/shipments', { params })
export const getShipmentById = (id) => api.get(`/admin/shipments/${id}`)
export const updateShipmentTracking = (id, data) => api.put(`/admin/shipments/${id}/tracking`, data)
export const addTrackingEvent = (id, data) => api.post(`/admin/shipments/${id}/tracking-event`, data)

// Returns & Refunds
export const getReturns = (params) => api.get('/admin/returns', { params })
export const getReturnById = (id) => api.get(`/admin/returns/${id}`)
export const approveReturn = (id, data) => api.put(`/admin/returns/${id}/approve`, data)
export const rejectReturn = (id, data) => api.put(`/admin/returns/${id}/reject`, data)
export const processRefund = (id, data) => api.post(`/admin/returns/${id}/refund`, data)
export const updateReturnStatus = (id, status) => api.put(`/admin/returns/${id}/status`, { status })

// Coupons
export const getCoupons = () => api.get('/coupons')
export const getAdminCoupons = () => api.get('/admin/coupons')
export const getCouponById = (id) => api.get(`/admin/coupons/${id}`)
export const addCoupon = (data) => api.post('/admin/coupons', data)
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data)
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`)
export const toggleCouponStatus = (id) => api.patch(`/admin/coupons/${id}/toggle`)
export const validateCoupon = (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount })
export const applyCoupon = (code) => api.post('/coupons/apply', { code })

// Notifications
export const getNotifications = () => api.get('/notifications')
export const getUnreadCount = () => api.get('/notifications/unread-count')
export const markAsRead = (id) => api.put(`/notifications/${id}/read`)
export const markAllAsRead = () => api.put('/notifications/read-all')
export const deleteNotification = (id) => api.delete(`/notifications/${id}`)

// Wishlist
export const getWishlist = () => api.get('/wishlist')

// Reviews
export const getProductReviews = (productId) => api.get(`/products/${productId}/reviews`)

export default api
