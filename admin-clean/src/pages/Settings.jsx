import { useState } from 'react'
import { Settings as SettingsIcon, Shield, Bell, Database, Zap, AlertTriangle, Save } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: 'E-Commerce Store',
    storeEmail: 'admin@store.com',
    storePhone: '+91 1234567890',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    
    // Feature Toggles
    enableRegistration: true,
    enableGuestCheckout: false,
    enableReviews: true,
    enableWishlist: true,
    enableCoupons: true,
    enableNotifications: true,
    
    // Security Settings
    enableRateLimit: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    enableTwoFactor: false,
    
    // Order Settings
    autoConfirmOrders: false,
    orderCancellationWindow: 24,
    returnWindow: 7,
    refundProcessingDays: 5,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderStatusEmails: true,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    logLevel: 'info'
  })

  const [activeTab, setActiveTab] = useState('store')

  const handleSave = () => {
    // API call would go here
    alert('Settings saved successfully!')
  }

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const tabs = [
    { id: 'store', label: 'Store Settings', icon: SettingsIcon },
    { id: 'features', label: 'Feature Toggles', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'orders', label: 'Orders', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: AlertTriangle }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure your store and system preferences</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Store Email</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Store Phone</label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="input-field"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="input-field"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Toggles */}
      {activeTab === 'features' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Feature Toggles</h2>
          <div className="space-y-4">
            {[
              { key: 'enableRegistration', label: 'User Registration', desc: 'Allow new users to register' },
              { key: 'enableGuestCheckout', label: 'Guest Checkout', desc: 'Allow checkout without registration' },
              { key: 'enableReviews', label: 'Product Reviews', desc: 'Enable product review system' },
              { key: 'enableWishlist', label: 'Wishlist', desc: 'Enable wishlist functionality' },
              { key: 'enableCoupons', label: 'Coupons', desc: 'Enable discount coupons' },
              { key: 'enableNotifications', label: 'Notifications', desc: 'Enable push notifications' }
            ].map(feature => (
              <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{feature.label}</p>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(feature.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[feature.key] ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[feature.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Rate Limiting</p>
                <p className="text-sm text-gray-600">Protect against brute force attacks</p>
              </div>
              <button
                onClick={() => handleToggle('enableRateLimit')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableRateLimit ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableRateLimit ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                className="input-field"
                min="3"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="input-field"
                min="15"
                max="120"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for admin login</p>
              </div>
              <button
                onClick={() => handleToggle('enableTwoFactor')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableTwoFactor ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Settings */}
      {activeTab === 'orders' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Order Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Auto-Confirm Orders</p>
                <p className="text-sm text-gray-600">Automatically confirm new orders</p>
              </div>
              <button
                onClick={() => handleToggle('autoConfirmOrders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoConfirmOrders ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoConfirmOrders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Order Cancellation Window (hours)</label>
              <input
                type="number"
                value={settings.orderCancellationWindow}
                onChange={(e) => setSettings({ ...settings, orderCancellationWindow: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Return Window (days)</label>
              <input
                type="number"
                value={settings.returnWindow}
                onChange={(e) => setSettings({ ...settings, returnWindow: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Processing Days</label>
              <input
                type="number"
                value={settings.refundProcessingDays}
                onChange={(e) => setSettings({ ...settings, refundProcessingDays: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications' },
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS notifications' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Send push notifications' },
              { key: 'orderStatusEmails', label: 'Order Status Emails', desc: 'Email on order status change' }
            ].map(feature => (
              <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{feature.label}</p>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(feature.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[feature.key] ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[feature.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">System Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div>
                <p className="font-semibold text-red-900">Maintenance Mode</p>
                <p className="text-sm text-red-600">Put site in maintenance mode</p>
              </div>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Debug Mode</p>
                <p className="text-sm text-gray-600">Enable detailed error logging</p>
              </div>
              <button
                onClick={() => handleToggle('debugMode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.debugMode ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.debugMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Cache Enabled</p>
                <p className="text-sm text-gray-600">Enable application caching</p>
              </div>
              <button
                onClick={() => handleToggle('cacheEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.cacheEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Log Level</label>
              <select
                value={settings.logLevel}
                onChange={(e) => setSettings({ ...settings, logLevel: e.target.value })}
                className="input-field"
              >
                <option value="error">Error Only</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
