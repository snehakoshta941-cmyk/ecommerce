import { useState, useEffect } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api'
import { Plus, Edit, Trash2, Search, Download, Upload, Eye, EyeOff, CheckSquare, Square, Filter } from 'lucide-react'

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkAction, setBulkAction] = useState({ type: '', value: '' })
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: '',
    visibility: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    description: '',
    isVisible: true
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    let filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice))
    }
    if (filters.stockStatus === 'in-stock') {
      filtered = filtered.filter(p => (p.stock || 0) > 10)
    } else if (filters.stockStatus === 'low-stock') {
      filtered = filtered.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10)
    } else if (filters.stockStatus === 'out-of-stock') {
      filtered = filtered.filter(p => (p.stock || 0) === 0)
    }
    if (filters.visibility === 'visible') {
      filtered = filtered.filter(p => p.isVisible)
    } else if (filters.visibility === 'hidden') {
      filtered = filtered.filter(p => !p.isVisible)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, products, filters])

  const loadProducts = async () => {
    try {
      const response = await getProducts()
      const productsWithVisibility = response.data.map(p => ({
        ...p,
        isVisible: p.isVisible !== undefined ? p.isVisible : true
      }))
      setProducts(productsWithVisibility)
      setFilteredProducts(productsWithVisibility)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData)
      } else {
        await addProduct(formData)
      }
      loadProducts()
      resetForm()
      alert('Product saved successfully!')
    } catch (error) {
      alert('Error saving product')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        loadProducts()
        alert('Product deleted successfully!')
      } catch (error) {
        alert('Error deleting product')
      }
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock || 0,
      image: product.image || '',
      description: product.description || '',
      isVisible: product.isVisible !== undefined ? product.isVisible : true
    })
    setShowAddModal(true)
  }

  const toggleVisibility = async (productId) => {
    const product = products.find(p => p._id === productId)
    try {
      await updateProduct(productId, { ...product, isVisible: !product.isVisible })
      setProducts(products.map(p =>
        p._id === productId ? { ...p, isVisible: !p.isVisible } : p
      ))
      alert('Visibility updated!')
    } catch (error) {
      alert('Error updating visibility')
    }
  }

  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction.type || !bulkAction.value) {
      alert('Please select action and value')
      return
    }

    try {
      const updatedProducts = products.map(p => {
        if (selectedProducts.includes(p._id)) {
          switch (bulkAction.type) {
            case 'visibility':
              return { ...p, isVisible: bulkAction.value === 'show' }
            case 'stock':
              return { ...p, stock: parseInt(bulkAction.value) }
            case 'price-increase':
              return { ...p, price: p.price * (1 + parseFloat(bulkAction.value) / 100) }
            case 'price-decrease':
              return { ...p, price: p.price * (1 - parseFloat(bulkAction.value) / 100) }
            case 'category':
              return { ...p, category: bulkAction.value }
            default:
              return p
          }
        }
        return p
      })

      // Update each product
      for (const product of updatedProducts) {
        if (selectedProducts.includes(product._id)) {
          await updateProduct(product._id, product)
        }
      }

      setProducts(updatedProducts)
      setSelectedProducts([])
      setShowBulkModal(false)
      setBulkAction({ type: '', value: '' })
      alert(`Bulk action applied to ${selectedProducts.length} products!`)
    } catch (error) {
      alert('Error performing bulk action')
    }
  }

  const handleExport = () => {
    const headers = ['Name', 'Category', 'Price', 'Stock', 'Visibility', 'Rating']
    const rows = filteredProducts.map(p => [
      p.name,
      p.category,
      p.price,
      p.stock || 0,
      p.isVisible ? 'Visible' : 'Hidden',
      p.rating || 0
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      description: '',
      isVisible: true
    })
    setEditingProduct(null)
    setShowAddModal(false)
  }

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      stockStatus: '',
      visibility: ''
    })
  }

  const categories = [...new Set(products.map(p => p.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory with bulk operations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Products</p>
          <p className="text-3xl font-bold mt-1">{products.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">In Stock</p>
          <p className="text-3xl font-bold mt-1">{products.filter(p => (p.stock || 0) > 0).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Out of Stock</p>
          <p className="text-3xl font-bold mt-1">{products.filter(p => (p.stock || 0) === 0).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Visible</p>
          <p className="text-3xl font-bold mt-1">{products.filter(p => p.isVisible).length}</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Upload size={18} />
              Bulk ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">
                  <button onClick={toggleSelectAll}>
                    {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="text-primary-600" size={20} />
                    ) : (
                      <Square className="text-gray-400" size={20} />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Visibility</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button onClick={() => toggleSelectProduct(product._id)}>
                      {selectedProducts.includes(product._id) ? (
                        <CheckSquare className="text-primary-600" size={20} />
                      ) : (
                        <Square className="text-gray-400" size={20} />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <img
                      src={product.image || product.images?.[0] || 'https://via.placeholder.com/50'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4 font-semibold">₹{product.price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (product.stock || 0) > 50 ? 'bg-green-100 text-green-800' :
                      (product.stock || 0) > 10 ? 'bg-yellow-100 text-yellow-800' :
                      (product.stock || 0) > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleVisibility(product._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.isVisible
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={product.isVisible ? 'Hide Product' : 'Show Product'}
                    >
                      {product.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isVisible" className="text-sm font-semibold text-gray-700">
                    Product Visible to Customers
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Bulk Operations</h2>
              <p className="text-gray-600 mb-4">{selectedProducts.length} products selected</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Action Type
                  </label>
                  <select
                    value={bulkAction.type}
                    onChange={(e) => setBulkAction({ ...bulkAction, type: e.target.value, value: '' })}
                    className="input-field"
                  >
                    <option value="">Select Action</option>
                    <option value="visibility">Change Visibility</option>
                    <option value="stock">Update Stock</option>
                    <option value="price-increase">Increase Price (%)</option>
                    <option value="price-decrease">Decrease Price (%)</option>
                    <option value="category">Change Category</option>
                  </select>
                </div>

                {bulkAction.type === 'visibility' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visibility
                    </label>
                    <select
                      value={bulkAction.value}
                      onChange={(e) => setBulkAction({ ...bulkAction, value: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select</option>
                      <option value="show">Show</option>
                      <option value="hide">Hide</option>
                    </select>
                  </div>
                )}

                {(bulkAction.type === 'stock' || bulkAction.type === 'price-increase' || bulkAction.type === 'price-decrease') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {bulkAction.type === 'stock' ? 'New Stock Value' : 'Percentage'}
                    </label>
                    <input
                      type="number"
                      value={bulkAction.value}
                      onChange={(e) => setBulkAction({ ...bulkAction, value: e.target.value })}
                      className="input-field"
                      placeholder={bulkAction.type === 'stock' ? 'Enter stock quantity' : 'Enter percentage'}
                    />
                  </div>
                )}

                {bulkAction.type === 'category' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Category
                    </label>
                    <select
                      value={bulkAction.value}
                      onChange={(e) => setBulkAction({ ...bulkAction, value: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBulkAction}
                  className="btn-primary flex-1"
                  disabled={!bulkAction.type || !bulkAction.value}
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setShowBulkModal(false)
                    setBulkAction({ type: '', value: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Advanced Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="input-field"
                      placeholder="₹0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="input-field"
                      placeholder="₹10000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock (≤10)</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={filters.visibility}
                    onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="btn-primary flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    setShowFilterModal(false)
                  }}
                  className="btn-secondary flex-1"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
