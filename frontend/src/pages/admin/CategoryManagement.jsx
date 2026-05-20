import { useState, useEffect } from 'react';
import { Package, Upload, Save, X, Trash2, Edit } from 'lucide-react';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        image: null,
        is_occasion: false,
        occasion_order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
            const data = await response.json();
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingItem(category);
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            icon: category.icon || '',
            image: null,
            is_occasion: category.is_occasion || false,
            occasion_order: category.occasion_order || 0
        });
        setPreviewImage(category.image_url
            ? (category.image_url.startsWith('http') ? category.image_url : `${import.meta.env.VITE_API_URL}${category.image_url}`)
            : null);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            slug: '',
            icon: '',
            image: null,
            is_occasion: false,
            occasion_order: 0
        });
        setPreviewImage(null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setCategories(categories.filter(c => c.id !== id));
                alert('Category deleted successfully');
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const submitData = new FormData();

            submitData.append('name', formData.name);
            submitData.append('slug', formData.slug);
            submitData.append('icon', formData.icon);
            submitData.append('is_occasion', formData.is_occasion);
            submitData.append('occasion_order', formData.occasion_order);

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const url = editingItem
                ? `${import.meta.env.VITE_API_URL}/api/categories/${editingItem.id}`
                : `${import.meta.env.VITE_API_URL}/api/categories`;

            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Category ${editingItem ? 'updated' : 'created'} successfully!`);
                setShowModal(false);
                setEditingItem(null);
                fetchCategories();
            } else {
                alert(data.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                    <p className="text-gray-600 mt-1">Manage shop categories</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-orange-primary text-black px-4 py-2 rounded-lg hover:bg-orange-hover transition-colors font-semibold flex items-center gap-2"
                >
                    <Package className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="relative h-48 bg-gray-100">
                            {category.image_url ? (
                                <img
                                    src={category.image_url.startsWith('http') ? category.image_url : `${import.meta.env.VITE_API_URL}${category.image_url}`}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 bg-white/90 rounded-full hover:bg-orange-primary hover:text-black transition-colors shadow-sm"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{category.icon}</span>
                                <h3 className="font-semibold text-lg">{category.name}</h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 font-mono">{category.slug}</p>
                                {category.is_occasion && (
                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                                        Occasion #{category.occasion_order}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Image
                                    </label>
                                    <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-500">
                                                <Upload className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm">Click to upload image</p>
                                            </div>
                                        )}
                                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 w-full justify-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            {previewImage ? 'Change Image' : 'Select Image'}
                                        </label>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Slash */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                                    />
                                </div>

                                {/* Icon */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Icon (Emoji)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="e.g. 🎁"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                                    />
                                </div>

                                {/* Is Occasion */}
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <input
                                        type="checkbox"
                                        id="is_occasion"
                                        checked={formData.is_occasion}
                                        onChange={(e) => setFormData({ ...formData, is_occasion: e.target.checked })}
                                        className="w-5 h-5 text-orange-primary focus:ring-orange-primary border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="is_occasion" className="text-sm font-bold text-gray-800 cursor-pointer block">
                                            Show in "Shop by Occasion"
                                        </label>
                                        <p className="text-xs text-gray-500">Toggle this to show/hide in the homepage occasion section</p>
                                    </div>
                                </div>

                                {/* Occasion Order */}
                                {formData.is_occasion && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Occasion Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.occasion_order}
                                            onChange={(e) => setFormData({ ...formData, occasion_order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                                            placeholder="Lower numbers show first"
                                        />
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-orange-primary text-black font-semibold px-6 py-2 rounded-lg hover:bg-orange-hover transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Category
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
    );
};

export default CategoryManagement;
