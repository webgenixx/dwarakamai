import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { getAuthHeaders, isAuthenticated, isAdmin } from '../../utils/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'trending', 'regular'
  const [filterCategory, setFilterCategory] = useState('all'); // Category filter
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    discount: 0,
    stock_quantity: 0,
    valentine_special: false,
    special_offer: false,
    customizable: false,
    is_active: true,
    material: '',
    sizes: [],
    customization_options: {
      imageUpload: false,
      textInput: [],
      sizes: []
    }
  });

  // Main image state
  const [mainImageFile, setMainImageFile] = useState(null);       // new File to upload as main
  const [mainImagePreview, setMainImagePreview] = useState(null); // preview URL
  const [mainImagePublicId, setMainImagePublicId] = useState(''); // existing public_id

  // Additional images state (up to 4)
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [additionalImagePublicIds, setAdditionalImagePublicIds] = useState([]);

  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingAdditional, setIsDraggingAdditional] = useState(false);
  const MAX_ADDITIONAL = 4;

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated() || !isAdmin()) {
      alert('Please login as admin to access this page');
      window.location.href = '/admin/login';
      return;
    }
    
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      // Ensure all products have special_offer field (default to false if missing)
      const productsWithDefaults = (data.products || []).map(product => ({
        ...product,
        special_offer: product.special_offer ?? false,
        valentine_special: product.valentine_special ?? false
      }));
      setProducts(productsWithDefaults);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processMainImageFile(file);
    e.target.value = '';
  };

  const processMainImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert(`"${file.name}" is not an image file.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(`"${file.name}" exceeds 5MB.`);
      return;
    }
    setMainImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setMainImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
    setMainImagePublicId('');
  };

  const handleAdditionalImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    processAdditionalImageFiles(files);
    e.target.value = '';
  };

  const processAdditionalImageFiles = (files) => {
    const remaining = MAX_ADDITIONAL - additionalImagePreviews.length;
    if (remaining <= 0) {
      alert(`You can only upload up to ${MAX_ADDITIONAL} additional images.`);
      return;
    }
    const toAdd = files.slice(0, remaining);
    toAdd.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`"${file.name}" is not an image file and was skipped.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" exceeds 5MB and was skipped.`);
        return;
      }
      setAdditionalImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAdditionalImage = (index) => {
    const isExisting = index < additionalImagePublicIds.length;
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (isExisting) {
      setAdditionalImagePublicIds((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - additionalImagePublicIds.length;
      setAdditionalImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  // Drag handlers for main image
  const handleDragEnterMain = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingMain(true); };
  const handleDragLeaveMain = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingMain(false); };
  const handleDragOverMain = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDropMain = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingMain(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processMainImageFile(file);
  };

  // Drag handlers for additional images
  const handleDragEnterAdditional = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAdditional(true); };
  const handleDragLeaveAdditional = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAdditional(false); };
  const handleDragOverAdditional = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDropAdditional = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingAdditional(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) processAdditionalImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication before submitting
    if (!isAuthenticated() || !isAdmin()) {
      alert('Your session has expired. Please login again.');
      window.location.href = '/admin/login';
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('No authentication token found. Please login again.');
      window.location.href = '/admin/login';
      return;
    }

    console.log('Submitting with token:', token.substring(0, 20) + '...');

    try {
      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/api/products/${editingProduct.id}`
        : `${import.meta.env.VITE_API_URL}/api/products`;

      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'customization_options') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'sizes') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Send the currently kept additional image public_ids.
      // Backend will delete any existing additional images NOT in this list.
      formDataToSend.append('kept_additional_ids', JSON.stringify(additionalImagePublicIds));

      // Also send kept main image public_id so backend knows if main was removed
      formDataToSend.append('kept_main_id', mainImagePublicId || '');

      // Append main image if a new one was selected
      if (mainImageFile) {
        formDataToSend.append('main_image', mainImageFile);
      }

      // Append new additional image files
      additionalImageFiles.forEach((file) => {
        formDataToSend.append('additional_images', file);
      });

      console.log('Making request to:', url);
      console.log('Method:', editingProduct ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.clear();
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        fetchProducts();
        handleCloseModal();
        alert('Product saved successfully!');
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    // Check authentication
    if (!isAuthenticated() || !isAdmin()) {
      alert('Your session has expired. Please login again.');
      window.location.href = '/admin/login';
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Deleting product ID:', id);
    console.log('Using token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Delete response status:', response.status);

      if (response.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.clear();
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        const result = await response.json();
        fetchProducts();
        
        if (result.deactivated) {
          alert('Product deactivated successfully!\n\nNote: This product exists in orders and cannot be permanently deleted. It has been deactivated instead.');
        } else {
          alert('Product deleted successfully!');
        }
      } else {
        const error = await response.json();
        console.error('Delete error response:', error);
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const pCatId = typeof product.category_id === 'object' && product.category_id !== null 
      ? (product.category_id._id || product.category_id.id) 
      : product.category_id;

    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: pCatId || '',
      price: product.price,
      discount: product.discount || 0,
      stock_quantity: product.stock_quantity || 0,
      valentine_special: product.valentine_special ?? false,
      special_offer: product.special_offer ?? false,
      customizable: product.customizable || false,
      is_active: product.is_active ?? true,
      material: product.material || '',
      sizes: product.sizes || [],
      customization_options: product.customization_options || {
        imageUpload: false,
        textInput: [],
        sizes: []
      }
    });
    // Load existing images into split state
    const existingImages = product.images && product.images.length > 0
      ? product.images
      : (product.image_url ? [{ url: product.image_url, public_id: product.image_public_id }] : []);

    // First image is the main image
    if (existingImages.length > 0) {
      setMainImagePreview(existingImages[0].url);
      setMainImagePublicId(existingImages[0].public_id || '');
    } else {
      setMainImagePreview(null);
      setMainImagePublicId('');
    }
    setMainImageFile(null);

    // Remaining images are additional
    const additional = existingImages.slice(1);
    setAdditionalImagePreviews(additional.map(img => img.url));
    setAdditionalImagePublicIds(additional.map(img => img.public_id || ''));
    setAdditionalImageFiles([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setMainImageFile(null);
    setMainImagePreview(null);
    setMainImagePublicId('');
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setAdditionalImagePublicIds([]);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      price: '',
      discount: 0,
      stock_quantity: 0,
      valentine_special: false,
      special_offer: false,
      customizable: false,
      is_active: true,
      material: '',
      sizes: [],
      customization_options: {
        imageUpload: false,
        textInput: [],
        sizes: []
      }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' ? true :
      filterType === 'trending' ? product.valentine_special === true :
      filterType === 'special_offers' ? product.special_offer === true :
      filterType === 'regular' ? !product.valentine_special && !product.special_offer : true;
      
    const pCatId = typeof product.category_id === 'object' && product.category_id !== null 
      ? (product.category_id._id || product.category_id.id) 
      : product.category_id;

    const matchesCategory = 
      filterCategory === 'all' ? true :
      pCatId && pCatId.toString() === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-valentine-red text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-valentine-darkRed transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
              }}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                filterType === 'all' && filterCategory === 'all'
                  ? 'text-valentine-red border-b-2 border-valentine-red'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => {
                setFilterType('trending');
                setFilterCategory('all');
              }}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                filterType === 'trending' && filterCategory === 'all'
                  ? 'text-valentine-red border-b-2 border-valentine-red'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔥 Trending Now ({products.filter(p => p.valentine_special).length})
            </button>
            <button
              onClick={() => {
                setFilterType('special_offers');
                setFilterCategory('all');
              }}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                filterType === 'special_offers' && filterCategory === 'all'
                  ? 'text-valentine-red border-b-2 border-valentine-red'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎁 Special Offers ({products.filter(p => p.special_offer).length})
            </button>
            <button
              onClick={() => {
                setFilterType('regular');
                setFilterCategory('all');
              }}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                filterType === 'regular' && filterCategory === 'all'
                  ? 'text-valentine-red border-b-2 border-valentine-red'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Regular Products ({products.filter(p => !p.valentine_special && !p.special_offer).length})
            </button>
            
            {/* Category Tabs */}
            <div className="border-l border-gray-300 mx-2"></div>
            {categories.map((category) => {
              const categoryProductCount = products.filter(p => {
                const pCatId = typeof p.category_id === 'object' && p.category_id !== null 
                  ? (p.category_id._id || p.category_id.id) 
                  : p.category_id;
                return pCatId && pCatId.toString() === category.id.toString();
              }).length;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setFilterType('all');
                    setFilterCategory(category.id.toString());
                  }}
                  className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                    filterCategory === category.id.toString()
                      ? 'text-valentine-red border-b-2 border-valentine-red'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.name} ({categoryProductCount})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
            />
          </div>

          {/* Info Banner for Trending */}
          {filterType === 'trending' && filterCategory === 'all' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Products marked as "Show in trending" appear in the "Trending Now"
                section on the homepage. Edit the "Show in trending" checkbox when editing a product to
                add or remove it from trending.
              </p>
            </div>
          )}

          {/* Info Banner for Special Offers */}
          {filterType === 'special_offers' && filterCategory === 'all' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>🎁 Tip:</strong> Products marked as "Special Offer" appear in the "Special Offers"
                section on the homepage. Edit the "Special Offer" checkbox when editing a product to
                add or remove it from special offers.
              </p>
            </div>
          )}
          
          {/* Info Banner for Category Filter */}
          {filterCategory !== 'all' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
              <p className="text-sm text-purple-800">
                <strong>📂 Filtered by:</strong> {categories.find(c => c.id.toString() === filterCategory)?.name || 'Category'}
              </p>
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setFilterType('all');
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-semibold underline"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload — Main Image + Additional Images */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image
                        <span className="ml-2 text-xs text-gray-400 font-normal">(displayed as the primary product image)</span>
                      </label>

                      {mainImagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={mainImagePreview}
                            alt="Main product image"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-valentine-red"
                          />
                          <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-valentine-red text-white py-0.5 rounded-b-lg font-bold">Main</span>
                          <button
                            type="button"
                            onClick={handleRemoveMainImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragEnter={handleDragEnterMain}
                          onDragOver={handleDragOverMain}
                          onDragLeave={handleDragLeaveMain}
                          onDrop={handleDropMain}
                          className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                            isDraggingMain
                              ? 'border-valentine-red bg-valentine-pink/10 scale-105'
                              : 'border-gray-300 hover:border-valentine-red'
                          }`}
                        >
                          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <label className="cursor-pointer">
                            <span className="text-sm font-medium text-valentine-red hover:text-valentine-darkRed">
                              Click to upload main image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMainImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="text-xs text-gray-400 mt-1">or drag & drop — PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Images */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Additional Images
                          <span className="ml-2 text-xs text-gray-400 font-normal">(up to {MAX_ADDITIONAL} extra images)</span>
                        </label>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          additionalImagePreviews.length >= MAX_ADDITIONAL ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {additionalImagePreviews.length}/{MAX_ADDITIONAL}
                        </span>
                      </div>

                      {additionalImagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {additionalImagePreviews.map((src, idx) => (
                            <div key={idx} className="relative group aspect-square">
                              <img
                                src={src}
                                alt={`Additional image ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveAdditionalImage(idx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {additionalImagePreviews.length < MAX_ADDITIONAL && (
                        <div
                          onDragEnter={handleDragEnterAdditional}
                          onDragOver={handleDragOverAdditional}
                          onDragLeave={handleDragLeaveAdditional}
                          onDrop={handleDropAdditional}
                          className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                            isDraggingAdditional
                              ? 'border-valentine-red bg-valentine-pink/10 scale-105'
                              : 'border-gray-300 hover:border-valentine-red'
                          }`}
                        >
                          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <label className="cursor-pointer">
                            <span className="text-sm font-medium text-valentine-red hover:text-valentine-darkRed">
                              Click to add {additionalImagePreviews.length === 0 ? 'additional images' : 'more'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAdditionalImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="text-xs text-gray-400 mt-1">or drag & drop — PNG, JPG, GIF up to 5MB each</p>
                          <p className="text-xs text-gray-400">You can add {MAX_ADDITIONAL - additionalImagePreviews.length} more image{MAX_ADDITIONAL - additionalImagePreviews.length !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                    />
                  </div>

                  {/* Material & Sizes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                      <input
                        type="text"
                        placeholder="e.g. Ceramic, Cotton, Wood"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Sizes
                        <span className="ml-1 text-xs text-gray-400 font-normal">(press Enter to add)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Small, Medium, Large"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && !formData.sizes.includes(val)) {
                              setFormData({ ...formData, sizes: [...formData.sizes, val] });
                            }
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                      />
                      {formData.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {formData.sizes.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {s}
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, idx) => idx !== i) })}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.valentine_special}
                        onChange={(e) => setFormData({ ...formData, valentine_special: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">🔥 Show in trending</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.special_offer}
                        onChange={(e) => setFormData({ ...formData, special_offer: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">🎁 Special Offer</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.customizable}
                        onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Customizable</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>

                  {/* Customization Options */}
                  {formData.customizable && (
                    <div className="border-2 border-valentine-pink/30 rounded-lg p-4 bg-valentine-pink/5">
                      <h3 className="text-lg font-semibold mb-4 text-valentine-red">Customization Options</h3>
                      
                      <div className="space-y-6">
                        {/* Image Upload Option */}
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.customization_options.imageUpload}
                              onChange={(e) => setFormData({
                                ...formData,
                                customization_options: {
                                  ...formData.customization_options,
                                  imageUpload: e.target.checked
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              📸 Require Customer Image Upload
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 ml-6 mt-1">
                            Customer must upload an image to customize this product
                          </p>
                        </div>

                        {/* Text Input Fields */}
                        <div>
                          <label className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={formData.customization_options.textInput && formData.customization_options.textInput.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    customization_options: {
                                      ...formData.customization_options,
                                      textInput: ['Name']
                                    }
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    customization_options: {
                                      ...formData.customization_options,
                                      textInput: []
                                    }
                                  });
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              ✏️ Add Text Input Fields
                            </span>
                          </label>
                          
                          {formData.customization_options.textInput && formData.customization_options.textInput.length > 0 && (
                            <div className="ml-6 space-y-2">
                              {formData.customization_options.textInput.map((field, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={field}
                                    onChange={(e) => {
                                      const newTextInput = [...formData.customization_options.textInput];
                                      newTextInput[index] = e.target.value;
                                      setFormData({
                                        ...formData,
                                        customization_options: {
                                          ...formData.customization_options,
                                          textInput: newTextInput
                                        }
                                      });
                                    }}
                                    placeholder="Field label (e.g., Name, Message)"
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTextInput = formData.customization_options.textInput.filter((_, i) => i !== index);
                                      setFormData({
                                        ...formData,
                                        customization_options: {
                                          ...formData.customization_options,
                                          textInput: newTextInput
                                        }
                                      });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    customization_options: {
                                      ...formData.customization_options,
                                      textInput: [...formData.customization_options.textInput, '']
                                    }
                                  });
                                }}
                                className="text-sm text-valentine-red hover:text-valentine-darkRed font-medium"
                              >
                                + Add Another Field
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Size Options */}
                        <div>
                          <label className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={formData.customization_options.sizes && formData.customization_options.sizes.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    customization_options: {
                                      ...formData.customization_options,
                                      sizes: [{ name: 'Small', price: formData.price }]
                                    }
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    customization_options: {
                                      ...formData.customization_options,
                                      sizes: []
                                    }
                                  });
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 font-medium">
                              📏 Add Size Options
                            </span>
                          </label>
                          
                          {formData.customization_options.sizes && formData.customization_options.sizes.length > 0 && (
                            <div className="ml-6 space-y-2">
                              {formData.customization_options.sizes.map((size, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={size.name}
                                    onChange={(e) => {
                                      const newSizes = [...formData.customization_options.sizes];
                                      newSizes[index].name = e.target.value;
                                      setFormData({
                                        ...formData,
                                        customization_options: {
                                          ...formData.customization_options,
                                          sizes: newSizes
                                        }
                                      });
                                    }}
                                    placeholder="Size name (e.g., Small, Medium, Large)"
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                                  />
                                  <input
                                    type="number"
                                    value={size.price}
                                    onChange={(e) => {
                                      const newSizes = [...formData.customization_options.sizes];
                                      newSizes[index].price = parseFloat(e.target.value) || 0;
                                      setFormData({
                                        ...formData,
                                        customization_options: {
                                          ...formData.customization_options,
                                          sizes: newSizes
                                        }
                                      });
                                    }}
                                    placeholder="Price"
                                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSizes = formData.customization_options.sizes.filter((_, i) => i !== index);
                                      setFormData({
                                        ...formData,
                                        customization_options: {
                                          ...formData.customization_options,
                                          sizes: newSizes
                                        }
                                      });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    customization_options: {
                                      ...formData.customization_options,
                                      sizes: [...formData.customization_options.sizes, { name: '', price: formData.price }]
                                    }
                                  });
                                }}
                                className="text-sm text-valentine-red hover:text-valentine-darkRed font-medium"
                              >
                                + Add Another Size
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-valentine-red text-white rounded-lg hover:bg-valentine-darkRed"
                    >
                      {editingProduct ? 'Update' : 'Create'} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Floating Add Button for Mobile */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 sm:hidden bg-valentine-red text-white p-4 rounded-full shadow-lg hover:bg-valentine-darkRed transition-all hover:scale-110 z-50"
          aria-label="Add Product"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProductManagement;
