import { useState, useEffect } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/api";
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";

// Safe ID fallback
const safeId = () => {
  try {
    return crypto?.randomUUID?.() || Date.now().toString();
  } catch {
    return Date.now().toString();
  }
};

const Products = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    description: "",
    isVisible: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  // ================= SAFE LOAD =================
  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await getProducts();
      const data = res?.data;

      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.products)) list = data.products;
      else if (Array.isArray(data?.data)) list = data.data;

      const clean = list.map((p = {}) => ({
        _id: p._id || safeId(),
        name: p.name || "Unnamed",
        category: p.category || "General",
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        image: p.image || p?.images?.[0] || "",
        description: p.description || "",
        isVisible: p.isVisible ?? true
      }));

      setProducts(clean);

    } catch (err) {
      console.error("❌ Load failed:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
      } else {
        await addProduct(payload);
      }

      await loadProducts();
      resetForm();

    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save product");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ================= EDIT (FIXED FOR MOBILE) =================
  const handleEdit = (product) => {
    if (!product) return;

    // clone to avoid stale reference
    const p = { ...product };

    setEditingProduct(p);

    setFormData({
      name: p.name || "",
      price: p.price?.toString() || "",
      category: p.category || "",
      stock: p.stock?.toString() || "",
      image: p.image || "",
      description: p.description || "",
      isVisible: p.isVisible ?? true
    });

    // ensure modal opens after state update
    setTimeout(() => setShowAddModal(true), 0);
  };

  // ================= VISIBILITY =================
  const toggleVisibility = async (id) => {
    const product = products.find(p => p._id === id);
    if (!product) return;

    const updated = { ...product, isVisible: !product.isVisible };

    // optimistic UI
    setProducts(prev =>
      prev.map(p => p._id === id ? updated : p)
    );

    try {
      await updateProduct(id, updated);
    } catch (err) {
      console.error("Visibility failed:", err);
      loadProducts();
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      stock: "",
      image: "",
      description: "",
      isVisible: true
    });

    setEditingProduct(null);
    setShowAddModal(false);
  };

  // ================= FILTER =================
  const filteredProducts = products.filter(p => {
    const name = (p.name || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    return name.includes(q) || cat.includes(q);
  });

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center h-96 items-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"/>
      </div>
    );
  }

  // ================= UI =================
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

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filteredProducts.map(p => (
          <div key={p._id} className="bg-white rounded-xl shadow border p-4">

            <div className="flex justify-between mb-3">
              <span className="text-xs text-purple-600 break-all">{p._id}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                p.isVisible ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {p.isVisible ? "Visible" : "Hidden"}
              </span>
            </div>

            <img
              src={p.image || "https://via.placeholder.com/120"}
              className="w-28 h-28 rounded border"
              onError={e => e.target.src = "https://via.placeholder.com/120"}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-bold">₹{p.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock</p>
                <p>{p.stock}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toggleVisibility(p._id)}
                className="flex-1 bg-gray-100 py-2 rounded"
              >
                {p.isVisible ? "Hide" : "Show"}
              </button>

              <button
                onClick={() => handleEdit(p)}
                className="px-4 py-2 bg-blue-50 rounded active:scale-95"
              >
                <Edit size={18}/>
              </button>

              <button
                onClick={() => handleDelete(p._id)}
                className="px-4 py-2 bg-red-50 rounded active:scale-95"
              >
                <Trash2 size={18}/>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 👉 Your modal stays unchanged */}

    </div>
  );
};

export default Products;
