import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Edit2, Trash2, X, Plus } from 'lucide-react';
import api from '../../utils/api';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchImages();
  }, [filterCategory]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = filterCategory ? `?category=${filterCategory}` : '';
      const data = await api.get(`/api/gallery${params}`);
      setImages(data.images || []);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      alert('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);

      if (editingImage) {
        await api.put(`/api/gallery/${editingImage.id}`, {
          title: formData.title,
          description: formData.description,
          category: formData.category
        });
        alert('Image updated successfully');
      } else {
        if (!formData.image) {
          alert('Please select an image');
          return;
        }
        data.append('image', formData.image);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: data
        });

        if (!response.ok) throw new Error('Upload failed');
        alert('Image uploaded successfully');
      }

      setShowModal(false);
      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('Failed to save image');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/api/gallery/${id}`);
      alert('Image deleted successfully');
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      description: image.description || '',
      category: image.category,
      image: null
    });
    setPreviewUrl(image.image_url?.startsWith('http') ? image.image_url : `${import.meta.env.VITE_API_URL}${image.image_url}`);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      image: null
    });
    setPreviewUrl('');
    setEditingImage(null);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'products', label: 'Products' },
    { value: 'events', label: 'Events' },
    { value: 'services', label: 'Services' },
    { value: 'testimonials', label: 'Testimonials' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage gallery images</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Upload Image
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{images.length}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-4 text-gray-500">
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full text-center py-4 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No images found. Upload your first image!</p>
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={image.image_url?.startsWith('http') ? image.image_url : `${import.meta.env.VITE_API_URL}${image.image_url}`}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{image.category}</p>
                {image.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(image)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingImage ? 'Edit Image' : 'Upload New Image'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {previewUrl ? (
                        <div className="space-y-4">
                          <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded" />
                          <button
                            type="button"
                            onClick={() => { setPreviewUrl(''); setFormData({ ...formData, image: null }); }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {editingImage && previewUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                    <img src={previewUrl} alt="Current" className="max-h-64 rounded" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {categories.filter(c => c.value).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingImage ? 'Update Image' : 'Upload Image'}
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

export default GalleryManagement;
