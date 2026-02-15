import { useState, useEffect } from 'react'
import { getAdminCoupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from '../services/api'
import { Ticket, Percent, DollarSign, Calendar, Users, Plus, Edit, Trash2, Eye, EyeOff, Tag } from 'lucide-react'

const Coupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true
  })

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const response = await getAdminCoupons()
      setCoupons(response.data.coupons || [])
    } catch (error) {
      console.error('Error loading coupons:', error)
      alert('Failed to load coupons. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const couponData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      }

      if (editingCoupon) {
        const response = await updateCoupon(editingCoupon._id, couponData)
        setCoupons(coupons.map(c => 
          c._id === editingCoupon._id ? response.data.coupon : c
        ))
        alert('Coupon updated successfully!')
      } else {
        const response = await addCoupon(couponData)
        setCoupons([response.data.coupon, ...coupons])
        alert('Coupon created successfully!')
      }
      resetForm()
      loadCoupons()
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert(error.response?.data?.message || 'Error saving coupon. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      isActive: coupon.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(couponId)
        setCoupons(coupons.filter(c => c._id !== couponId))
        alert('Coupon deleted successfully!')
      } catch (error) {
        console.error('Error deleting coupon:', error)
        alert(error.response?.data?.message || 'Error deleting coupon. Please try again.')
      }
    }
  }

  const toggleStatus = async (couponId) => {
    try {
      const response = await toggleCouponStatus(couponId)
      setCoupons(coupons.map(c => 
        c._id === couponId ? response.data.coupon : c
      ))
      alert('Coupon status updated!')
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error updating coupon status. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true
    })
    setEditingCoupon(null)
    setShowModal(false)
  }

  const isActive = (coupon) => {
    return coupon.isActive && new Date(coupon.validUntil) > new Date()
  }

  const getStats = () => {
    const total = coupons.length
    const active = coupons.filter(c => isActive(c)).length
    const expired = coupons.filter(c => new Date(c.validUntil) < new Date()).length
    const totalUsage = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)
    return { total, active, expired, totalUsage }
  }

  const stats = getStats()

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
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount coupons and promotions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Coupons</p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Active Coupons</p>
          <p className="text-3xl font-bold mt-1">{stats.active}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Expired</p>
          <p className="text-3xl font-bold mt-1">{stats.expired}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Total Usage</p>
          <p className="text-3xl font-bold mt-1">{stats.totalUsage}</p>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="card hover:shadow-lg transition-shadow border-l-4 border-primary-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Ticket className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{coupon.code}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive(coupon) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive(coupon) ? 'Active' : new Date(coupon.validUntil) < new Date() ? 'Expired' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(coupon._id)}
                className={`p-2 rounded-lg transition-colors ${
                  coupon.isActive
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={coupon.isActive ? 'Deactivate' : 'Activate'}
              >
                {coupon.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {coupon.discountType === 'percentage' ? (
                  <Percent size={16} className="text-green-600" />
                ) : (
                  <DollarSign size={16} className="text-green-600" />
                )}
                <span className="font-semibold text-green-600">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}% OFF` 
                    : `₹${coupon.discountValue} OFF`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign size={16} />
                <span>Min Order: ₹{coupon.minOrderAmount || 0}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                <span>
                  Used: {coupon.usedCount || 0}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                </span>
              </div>

              {coupon.maxDiscount && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Max discount: ₹{coupon.maxDiscount}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
              <button
                onClick={() => handleEdit(coupon)}
                className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(coupon._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Coupon"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {coupons.length === 0 && (
        <div className="card text-center py-12">
          <Ticket className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No coupons found</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Your First Coupon
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="input-field pl-11"
                        placeholder="e.g., SAVE20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="2"
                    placeholder="Brief description of the coupon..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="input-field"
                      placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      className="input-field"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Discount Amount
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="input-field"
                      placeholder="Leave empty for no limit"
                      min="0"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="input-field"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of times this coupon can be used
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Active (Users can see and use this coupon)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="btn-primary flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
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

export default Coupons
