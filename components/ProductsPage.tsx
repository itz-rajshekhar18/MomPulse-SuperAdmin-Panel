'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ToggleLeft, Loader, X, Image as ImageIcon } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus } from '@/lib/products';
import type { Product, CreateProductInput } from '@/lib/products';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    description: '',
    price: 0,
    category: 'Health & Wellness',
    stock: 0,
  });
  const [imageUrl, setImageUrl] = useState<string>('');

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: typeof product.price === 'number' ? product.price : 0,
        category: product.category,
        stock: typeof product.stock === 'number' ? product.stock : 0,
        image: product.image,
      });
      setImageUrl(product.image || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Health & Wellness',
        stock: 0,
      });
      setImageUrl('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Health & Wellness',
      stock: 0,
    });
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('submit');

    try {
      const productDataToSave = {
        ...formData,
        image: imageUrl || null,
      };

      if (editingProduct) {
        try {
          const success = await updateProduct(editingProduct.id, productDataToSave);
          if (success) {
            setProducts(
              products.map((p) =>
                p.id === editingProduct.id
                  ? {
                      ...p,
                      ...productDataToSave,
                      updatedAt: new Date() as any,
                    }
                  : p
              )
            );
            handleCloseModal();
            alert('Product updated successfully!');
          } else {
            alert('Failed to update product');
          }
        } catch (error: any) {
          console.error('Product update error:', error);
          alert(`Error updating product: ${error.message || 'Unknown error'}`);
        }
      } else {
        try {
          console.log('Creating product with data:', productDataToSave);
          const productId = await createProduct(productDataToSave);
          if (productId) {
            const newProduct: Product = {
              id: productId,
              ...productDataToSave,
              status: 'active',
              createdAt: new Date() as any,
              updatedAt: new Date() as any,
            };
            setProducts([...products, newProduct]);
            handleCloseModal();
            alert('Product created successfully!');
          } else {
            alert('Failed to create product. Check console for details.');
          }
        } catch (error: any) {
          console.error('Product creation error:', error);
          alert(`Error creating product: ${error.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setActionLoading(productId);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        setProducts(products.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    setActionLoading(product.id);
    try {
      const success = await toggleProductStatus(product.id, product.status);
      if (success) {
        setProducts(
          products.map((p) =>
            p.id === product.id
              ? { ...p, status: product.status === 'active' ? 'inactive' : 'active' }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    } finally {
      setActionLoading(null);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage and add new products to the platform</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden flex flex-col">
              {/* Product Image */}
              {product.image ? (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Product Header */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <p className="text-xs text-purple-600 font-semibold mt-1">{product.category}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Price</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">${product.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Stock</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{product.stock || 0}</p>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-gray-500">
                  Created {product.createdAt instanceof Date ? product.createdAt.toLocaleDateString() : new Date((product.createdAt as any).seconds * 1000).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(product)}
                  disabled={actionLoading === product.id}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === product.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Toggle
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={actionLoading === product.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === product.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Product Image URL</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageUrl && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => console.error('Failed to load image')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Vitamins">Vitamins</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'submit'}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'submit' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
