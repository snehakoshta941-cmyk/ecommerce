import { useState, useEffect } from 'react'
import { getCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../services/api'
import { FolderTree, Package, Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      alert('Failed to load categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingCategory) {
        // Update existing category
        const response = await updateCategory(editingCategory._id, formData)
        setCategories(categories.map(cat => 
          cat._id === editingCategory._id 
            ? response.data.category
            : cat
        ))
        alert('Category updated successfully!')
      } else {
        // Add new category
        const response = await addCategory(formData)
        setCategories([response.data.category, ...categories])
        alert('Category added successfully!')
      }
      resetForm()
      loadCategories() // Reload to get updated product counts
    } catch (error) {
      console.error('Error saving category:', error)
      alert(error.response?.data?.message || 'Error saving category. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      status: category.status || 'active'
    })
    setShowModal(true)
  }

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      try {
        await deleteCategory(categoryId)
        setCategories(categories.filter(cat => cat._id !== categoryId))
        alert('Category deleted successfully!')
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(error.response?.data?.message || 'Error deleting category. Please try again.')
      }
    }
  }

  const toggleStatus = async (categoryId) => {
    try {
      const response = await toggleCategoryStatus(categoryId)
      setCategories(categories.map(cat => 
        cat._id === categoryId 
          ? response.data.category
          : cat
      ))
      alert('Category status updated!')
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error updating category status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      status: 'active'
    })
    setEditingCategory(null)
    setShowModal(false)
  }

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Categories</p>
          <p className="text-3xl font-bold mt-1">{categories.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-1">
            {categories.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Inactive</p>
          <p className="text-3xl font-bold mt-1">
            {categories.filter(c => c.status === 'inactive').length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Total Products</p>
          <p className="text-3xl font-bold mt-1">
            {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="card hover:shadow-lg transition-shadow">
            {/* Category Image */}
            {category.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FolderTree className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {category.productCount || 0} products
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                category.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {category.status || 'active'}
              </span>
              <button
                onClick={() => toggleStatus(category._id)}
                className={`p-2 rounded-lg transition-colors ${
                  category.status === 'active'
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={category.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                {category.status === 'active' ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Category"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="card text-center py-12">
          <FolderTree className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No categories found</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Your First Category
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Electronics, Clothing, Beauty"
                    required
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
                    placeholder="Brief description of this category..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="input-field pl-11"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Inactive categories won't be visible to customers
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="btn-primary flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                    disabled={submitting}
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

export default Categories
