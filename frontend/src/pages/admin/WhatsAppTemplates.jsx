import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Send, Eye, Copy, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

const WhatsAppTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterOccasion, setFilterOccasion] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'promotional',
    occasion: '',
    subject: '',
    message: '',
    variables: []
  });

  useEffect(() => {
    fetchTemplates();
  }, [filterCategory, filterOccasion]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterOccasion) params.append('occasion', filterOccasion);
      
      const response = await api.get(`/api/whatsapp/templates?${params}`);
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        await api.put(`/whatsapp/templates/${editingTemplate.id}`, formData);
      } else {
        await api.post('/whatsapp/templates', formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await api.delete(`/whatsapp/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      occasion: template.occasion || '',
      subject: template.subject,
      message: template.message,
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const handleDuplicate = (template) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      category: template.category,
      occasion: template.occasion || '',
      subject: template.subject,
      message: template.message,
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'promotional',
      occasion: '',
      subject: '',
      message: '',
      variables: []
    });
    setEditingTemplate(null);
  };

  const extractVariables = (text) => {
    const regex = /{{(\w+)}}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  const handleMessageChange = (value) => {
    setFormData(prev => ({
      ...prev,
      message: value,
      variables: extractVariables(value)
    }));
  };

  const getCategoryBadge = (category) => {
    const colors = {
      promotional: 'bg-purple-100 text-purple-800',
      transactional: 'bg-blue-100 text-blue-800',
      notification: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getOccasionBadge = (occasion) => {
    const colors = {
      valentine: 'bg-pink-100 text-pink-800',
      birthday: 'bg-yellow-100 text-yellow-800',
      festival: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[occasion] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Templates</h1>
          <p className="text-gray-600 mt-2">Create and manage message templates for customer communication</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              <option value="promotional">Promotional</option>
              <option value="transactional">Transactional</option>
              <option value="notification">Notification</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Occasions</option>
              <option value="valentine">Valentine's Day</option>
              <option value="birthday">Birthday</option>
              <option value="festival">Festival</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterOccasion('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-4 text-gray-500">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-4 text-gray-500">
            No templates found. Create your first template!
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(template.category)}`}>
                        {template.category}
                      </span>
                      {template.occasion && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getOccasionBadge(template.occasion)}`}>
                          {template.occasion}
                        </span>
                      )}
                    </div>
                  </div>
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                
                <p className="text-sm font-medium text-gray-700 mb-2">{template.subject}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.message}</p>
                
                {template.variables && template.variables.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Used: {template.usage_count || 0} times</span>
                  <span>By: {template.created_by_name}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="promotional">Promotional</option>
                      <option value="transactional">Transactional</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">General</option>
                      <option value="valentine">Valentine's Day</option>
                      <option value="birthday">Birthday</option>
                      <option value="festival">Festival</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    rows="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    placeholder="Use {{variable_name}} for dynamic content"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use double curly braces for variables: {`{{name}}, {{discount}}, {{date}}`}
                  </p>
                </div>
                
                {formData.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detected Variables</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.variables.map((variable, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Template Preview</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Template Name</p>
                  <p className="text-lg font-semibold">{previewTemplate.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Subject</p>
                  <p className="text-base">{previewTemplate.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                      {previewTemplate.message}
                    </pre>
                  </div>
                </div>
                
                {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Variables</p>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.variables.map((variable, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowPreview(false)}
                className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplates;
