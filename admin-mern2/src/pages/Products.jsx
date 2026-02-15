import { useState, useEffect, useRef } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api'
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'

const Products = () => {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const searchTimeout = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    description: '',
    isVisible: true
  })

  // ================= LOAD PRODUCTS =================
  const loadProducts = async () => {
    try {
      setLoading(true)

      const params = { limit: 200 }

      if (categoryFilter !== 'All') {
        params.category = categoryFilter
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const res = await getProducts(params)

      const data = res?.data

      let list = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data?.products)) list = data.products
      else if (Array.isArray(data?.data)) list = data.data

      const clean = list.map(p => ({
        _id: p?._id,
        name: p?.name || "Unnamed",
        category: p?.category || "General",
        price: Number(p?.price || 0),
        stock: Number(p?.stock || 0),
        image: p?.image || p?.images?.[0] || "",
        description: p?.description || "",
        isVisible: p?.isVisible ?? true
      }))

      setProducts(clean)

    } catch (err) {
      console.error("Load failed:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadProducts()
  }, [categoryFilter])

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      loadProducts()
    }, 500)

    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery])

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      let response

      if (editingProduct) {
        response = await updateProduct(editingProduct._id, formData)
      } else {
        response = await addProduct(formData)
      }

      const saved =
        response?.data?.product ||
        response?.data?.data ||
        response?.data

      const formatted = {
        _id: saved._id,
        name: saved.name,
        category: saved.category,
        price: Number(saved.price),
        stock: Number(saved.stock),
        image: saved.image || "",
        description: saved.description || "",
        isVisible: saved.isVisible ?? true
      }

      if (editingProduct) {
        setProducts(prev =>
          prev.map(p => p._id === editingProduct._id ? formatted : p)
        )
      } else {
        setProducts(prev => [formatted, ...prev])
      }

      resetForm()

    } catch (err) {
      console.error("Save error:", err)
      alert("Failed to save product")
    }
  }

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return

    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  // ================= EDIT =================
  const handleEdit = (p) => {
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

  // ================= VISIBILITY =================
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Stock</th>
                <th className="py-3 px-4 text-left">Visibility</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p._id} className="border-t">
                    <td className="py-3 px-4">{p.name}</td>
                    <td className="py-3 px-4">₹{p.price}</td>
                    <td className="py-3 px-4">{p.stock}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleVisibility(p._id)}>
                        {p.isVisible ? <Eye size={18}/> : <EyeOff size={18}/>}
                      </button>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => handleEdit(p)}>
                        <Edit size={18}/>
                      </button>
                      <button onClick={() => handleDelete(p._id)}>
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal same as yours (no change needed) */}
    </div>
  )
}

export default Products
