import { useState, useEffect } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api'
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'

const Products = () => {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

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

  // ✅ ULTRA SAFE PRODUCT LOADER
  const loadProducts = async () => {
    try {
      setLoading(true)

      const res = await getProducts()

      console.log("🔥 Raw API:", res)

      // ---- normalize backend response ----
      let list = []

      const data = res?.data

      if (Array.isArray(data)) list = data
      else if (Array.isArray(data?.products)) list = data.products
      else if (Array.isArray(data?.data)) list = data.data
      else list = []

      // ---- sanitize products ----
      const clean = list.map(p => ({
        _id: p?._id || crypto.randomUUID(),
        name: p?.name || "Unnamed",
        category: p?.category || "General",
        price: Number(p?.price || 0),
        stock: Number(p?.stock || 0),
        image: p?.image || p?.images?.[0] || "",
        description: p?.description || "",
        isVisible: p?.isVisible ?? true
      }))

      console.log("✅ Clean products:", clean)

      setProducts(clean)

    } catch (err) {
      console.error("❌ Load failed:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData)
      } else {
        await addProduct(formData)
      }

      await loadProducts()
      resetForm()

    } catch (err) {
      console.error("Save error:", err)
      alert("Failed to save product")
    }
  }

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return

    try {
      await deleteProduct(id)
      loadProducts()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  // ✅ EDIT
  const handleEdit = (p) => {
    if (!p) return

    setEditingProduct(p)

    setFormData({
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
      image: p.image,
      description: p.description,
      isVisible: p.isVisible
    })

    setShowAddModal(true)
  }

  // ✅ VISIBILITY
  const toggleVisibility = async (id) => {
    const product = products.find(p => p._id === id)
    if (!product) return

    try {
      await updateProduct(id, {
        ...product,
        isVisible: !product.isVisible
      })

      setProducts(prev =>
        prev.map(p =>
          p._id === id ? { ...p, isVisible: !p.isVisible } : p
        )
      )

    } catch (err) {
      console.error("Visibility failed:", err)
    }
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

  // ✅ SAFE FILTER
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ================= UI =================

  if (loading) {
    return (
      <div className="flex justify-center h-96 items-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"/>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Products</h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex gap-2"
        >
          <Plus size={18}/> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400"/>
        <input
          className="input-field pl-10"
          placeholder="Search products..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products Table - Desktop */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={p.image || 'https://via.placeholder.com/50'}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4 font-semibold">₹{p.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (p.stock || 0) > 50 ? 'bg-green-100 text-green-800' :
                        (p.stock || 0) > 10 ? 'bg-yellow-100 text-yellow-800' :
                        (p.stock || 0) > 0 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.stock || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleVisibility(p._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          p.isVisible
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={p.isVisible ? 'Hide Product' : 'Show Product'}
                      >
                        {p.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No products found
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-md border p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="text-sm font-semibold text-purple-600 break-all">{p._id}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  p.isVisible
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {p.isVisible ? "Visible" : "Hidden"}
                </span>
              </div>

              {/* Product Image */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Product</p>
                <img
                  src={p.image || 'https://via.placeholder.com/120'}
                  alt={p.name}
                  className="w-28 h-28 object-cover rounded-lg border"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/120'}
                />
              </div>

              <hr className="my-4"/>

              {/* Bottom Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-xl font-bold">₹{p.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="font-semibold">{p.stock || 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleVisibility(p._id)}
                  className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  {p.isVisible ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleEdit(p)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg"
                >
                  <Edit size={18}/>
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Product Modal */}
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

    </div>
  )
}

export default Products
