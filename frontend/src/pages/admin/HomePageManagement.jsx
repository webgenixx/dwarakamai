import { useState, useEffect } from 'react';
import { Image, Upload, Save, X, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

const HomePageManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingType, setCreatingType] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    section: '',
    content_type: '',
    title: '',
    description: '',
    link_url: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/admin/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({
      section: item.section || '',
      content_type: item.content_type || '',
      title: item.title || '',
      description: item.description || '',
      link_url: item.link_url || '',
      display_order: item.display_order || 0,
      is_active: item.is_active
    });
    setPreviewImage(item.image_url
      ? (item.image_url.startsWith('http') ? item.image_url : `${import.meta.env.VITE_API_URL}${item.image_url}`)
      : null);
    setShowModal(true);
  };

  const handleCreate = (contentType, section) => {
    setIsCreating(true);
    setCreatingType(contentType);
    setEditingItem(null);
    setFormData({
      section: section,
      content_type: contentType,
      title: '',
      description: '',
      link_url: '',
      display_order: 0,
      is_active: true
    });
    setPreviewImage(null);
    setShowModal(true);
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

      if (isCreating) {
        submitData.append('section', formData.section);
        submitData.append('content_type', formData.content_type);
      }

      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('link_url', formData.link_url);
      submitData.append('display_order', formData.display_order);
      submitData.append('is_active', formData.is_active);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const url = isCreating
        ? `${import.meta.env.VITE_API_URL}/api/homepage/admin/content`
        : `${import.meta.env.VITE_API_URL}/api/homepage/admin/content/${editingItem.id}`;

      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        alert(isCreating ? 'Content created successfully!' : 'Content updated successfully!');
        setShowModal(false);
        setEditingItem(null);
        setIsCreating(false);
        fetchContent();
      } else {
        alert(data.message || `Failed to ${isCreating ? 'create' : 'update'} content`);
      }
    } catch (error) {
      console.error(`Error ${isCreating ? 'creating' : 'updating'} content:`, error);
      alert(`Failed to ${isCreating ? 'create' : 'update'} content`);
    }
  };

  const toggleActive = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/homepage/admin/content/${item.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_active: !item.is_active })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchContent();
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/homepage/admin/content/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Content deleted successfully!');
        fetchContent();
      } else {
        alert(data.message || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const groupedContent = {
    banner: content.filter(c => c.content_type === 'banner'),
    offer_card: content.filter(c => c.content_type === 'offer_card'),
    testimonial: content.filter(c => c.content_type === 'testimonial')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-valentine-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Management</h1>
          <p className="text-gray-600 mt-1">Manage hero banner, offers, and testimonials</p>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Image className="w-5 h-5" />
            Hero Banner
          </h2>
          <button
            onClick={() => handleCreate('banner', 'hero')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>
        <div className="space-y-4">
          {groupedContent.banner.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onToggleActive={toggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>





      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {isCreating ? 'Add New Content' : 'Edit Content'}
                </h2>
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
                    Image
                  </label>
                  <div className="flex items-center gap-4">
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload New Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                  />
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/shop"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-red focus:border-transparent"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-valentine-red focus:ring-valentine-red border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (visible on homepage)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

// Content Card Component
const ContentCard = ({ item, onEdit, onToggleActive, onDelete }) => {
  return (
    <div className={`border rounded-lg p-4 ${!item.is_active ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
      <div className="flex gap-4">
        {item.image_url && (
          <img
            src={item.image_url?.startsWith('http') ? item.image_url : `${import.meta.env.VITE_API_URL}${item.image_url}`}
            alt={item.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {item.content_type}
            </span>
            <span className="text-xs text-gray-500">
              Order: {item.display_order}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            onClick={() => onToggleActive(item)}
            className={`p-2 rounded-lg transition-colors ${item.is_active
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-100'
              }`}
            title={item.is_active ? 'Hide' : 'Show'}
          >
            {item.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this content?')) {
                onDelete(item.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePageManagement;
