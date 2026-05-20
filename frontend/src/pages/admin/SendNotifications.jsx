import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bell, Users, Search, BookOpen, Clock, Check, AlertCircle, X, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const SendNotifications = () => {
  const navigate = useNavigate();
  
  // Tab control
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system'); // 'system', 'order', 'design'
  const [link, setLink] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all', 'specific'
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Data States
  const [customers, setCustomers] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  
  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Ready templates
  const presets = [
    {
      id: 'design_ready',
      label: '✨ Design Ready for Review',
      title: '✨ Custom Design Ready',
      message: 'Your customized design is ready! Please review and approve the mockup in your studio dashboard to proceed with printing.',
      type: 'design',
      link: '/profile?tab=orders'
    },
    {
      id: 'customization_required',
      label: '📸 Upload Photos Needed',
      title: '📸 Photo Upload Needed',
      message: 'To complete your printing order, please go to your dashboard and upload your high-resolution custom photos.',
      type: 'design',
      link: '/profile?tab=orders'
    },
    {
      id: 'order_shipped',
      label: '📦 Order Shipped / Dispatched',
      title: '📦 Order Handed Over to Courier',
      message: 'Your custom printed frame / gift has been packaged and dispatched! Check your My Orders tab for shipping details.',
      type: 'order',
      link: '/profile?tab=orders'
    },
    {
      id: 'sale_launch',
      label: '💖 Valentine Special Offer',
      title: '💖 Valentine Special Live Now',
      message: 'Celebrate special memories with our curated couple collections! Check out newly listed customized photo frames and mugs with 25% off.',
      type: 'system',
      link: '/shop'
    },
    {
      id: 'photoshoot_ready',
      label: '📸 Session Gallery Uploaded',
      title: '📸 Photoshoot Session Uploaded',
      message: 'Your photoshoot session images have been professionally curated and uploaded to our gallery. Open the Studio Gallery tab to pick your favorites!',
      type: 'system',
      link: '/gallery'
    }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch all customers for target selector
      const customerData = await api.get('/api/admin/customers?limit=200');
      setCustomers(customerData.customers || []);
      
      // Fetch history log
      const historyData = await api.get('/api/notifications/admin/list');
      setSentNotifications(historyData.notifications || []);
    } catch (error) {
      console.error('Failed to load notification assets:', error);
      if (error.message.includes('Authentication')) {
        alert('Your session has expired. Please log in again.');
        navigate('/admin/login');
      } else {
        setErrorMsg('Could not fetch user registry or notification history.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyData = await api.get('/api/notifications/admin/list');
      setSentNotifications(historyData.notifications || []);
    } catch (error) {
      console.error('Failed to reload history:', error);
    }
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setType(preset.type);
    setLink(preset.link);
    
    // Smooth scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setSuccessMsg(`Applied template: "${preset.label}"`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleUserSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSelectAllFilteredUsers = (filteredUsers) => {
    const filteredIds = filteredUsers.map(u => u.id);
    const allSelected = filteredIds.every(id => selectedUserIds.includes(id));
    
    if (allSelected) {
      // Remove all filtered users
      setSelectedUserIds(selectedUserIds.filter(id => !filteredIds.includes(id)));
    } else {
      // Add missing filtered users
      const union = [...new Set([...selectedUserIds, ...filteredIds])];
      setSelectedUserIds(union);
    }
  };

  const handleClearForm = () => {
    setTitle('');
    setMessage('');
    setType('system');
    setLink('');
    setTargetType('all');
    setSelectedUserIds([]);
    setUserSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please specify both a Title and a Message.');
      return;
    }

    if (targetType === 'specific' && selectedUserIds.length === 0) {
      setErrorMsg('Please select at least one specific user to notify.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        targetType,
        title,
        message,
        type,
        link: link.trim() || null,
        ...(targetType === 'specific' && { userIds: selectedUserIds })
      };

      await api.post('/api/notifications/send', payload);
      
      setSuccessMsg(`Notification successfully broadcasted to ${targetType === 'all' ? 'all' : selectedUserIds.length} recipient(s)!`);
      handleClearForm();
      fetchHistory(); // Refresh history log
    } catch (error) {
      console.error('Submission failed:', error);
      if (error.message.includes('Authentication')) {
        alert('Your session has expired. Please log in again.');
        navigate('/admin/login');
      } else {
        setErrorMsg(error.message || 'Failed to dispatch notifications. Verify server details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filters for targets
  const filteredCustomers = customers.filter(customer => {
    const term = userSearchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term)
    );
  });

  // Filters for history search
  const filteredHistory = sentNotifications.filter(item => {
    const term = historySearchTerm.toLowerCase();
    const userName = item.user_id?.name || '';
    const userEmail = item.user_id?.email || '';
    return (
      item.title?.toLowerCase().includes(term) ||
      item.message?.toLowerCase().includes(term) ||
      userName.toLowerCase().includes(term) ||
      userEmail.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-valentine-red"></div>
        <p className="text-gray-500 font-body text-sm font-semibold">Configuring Notification Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Bell className="w-8 h-8 text-valentine-red animate-pulse" />
              Notification Center
            </h1>
            <p className="text-gray-600 mt-1 font-body">Broadcast system alerts, updates, and custom approvals to your customer database</p>
          </div>
          
          {/* Tab Selection */}
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-6 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'send'
                  ? 'bg-white text-gray-950 shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Send className="w-4 h-4" />
              Broadcast Alert
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchHistory();
              }}
              className={`px-6 py-2.5 rounded-xl font-body font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-white text-gray-950 shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              Broadcast Log ({sentNotifications.length})
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-xs font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* TAB 1: SEND NOTIFICATIONS */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Template Presets Sidebar (Grid columns 1 to 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BookOpen className="w-40 h-40 text-valentine-red" />
                </div>
                
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Ready to Send Templates
                </h2>
                <p className="text-xs text-gray-500 font-body mb-6">Select a pre-made template below to instantly load and edit the notification parameters.</p>
                
                <div className="space-y-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-valentine-red bg-white hover:bg-valentine-pink/5 hover:shadow-md transition-all flex justify-between items-center group"
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-xs font-bold text-gray-800 group-hover:text-valentine-red transition-colors">
                          {preset.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                          {preset.message}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-valentine-red group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Broadcast Form Panel (Grid columns 6 to 12) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configure Dispatch</h2>
                <p className="text-xs text-gray-500 font-body mt-1">Specify target recipients, message details, and custom navigation redirects.</p>
              </div>

              {/* Form Input fields */}
              <div className="space-y-5">
                
                {/* Dispatch Target Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Notify Target</label>
                    <select
                      value={targetType}
                      onChange={(e) => {
                        setTargetType(e.target.value);
                        setSelectedUserIds([]); // reset selection
                      }}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-3.5 font-body text-xs font-semibold text-gray-800 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all"
                    >
                      <option value="all">📢 All Users ({customers.length})</option>
                      <option value="specific">🎯 Specific Users</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Message Category</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-3.5 font-body text-xs font-semibold text-gray-800 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all"
                    >
                      <option value="system">🔧 System Alert</option>
                      <option value="design">🎨 Custom Design Workflow</option>
                      <option value="order">📦 Order Update</option>
                    </select>
                  </div>
                </div>

                {/* Specific Target Selector (Conditionally shown) */}
                {targetType === 'specific' && (
                  <div className="border border-gray-100 rounded-3xl p-4 bg-gray-50/50 space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Select Recipients ({selectedUserIds.length} selected)
                      </span>
                      {filteredCustomers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSelectAllFilteredUsers(filteredCustomers)}
                          className="text-[10px] font-bold text-valentine-red hover:underline"
                        >
                          {filteredCustomers.every(c => selectedUserIds.includes(c.id)) ? 'Deselect All' : 'Select All Filtered'}
                        </button>
                      )}
                    </div>
                    
                    {/* Search inside specific users */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, email or phone..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl font-body text-xs text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all"
                      />
                    </div>

                    {/* Scrollable list of users */}
                    <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-2xl bg-white p-2 divide-y divide-gray-50 custom-scrollbar">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-center py-6 text-xs text-gray-400 font-body">No customers match search parameters.</p>
                      ) : (
                        filteredCustomers.map((c) => {
                          const isChecked = selectedUserIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => handleToggleUserSelection(c.id)}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-valentine-pink/5 rounded-xl cursor-pointer transition-all"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isChecked 
                                  ? 'bg-valentine-red border-valentine-red text-white' 
                                  : 'border-gray-300 bg-white'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{c.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{c.email} • {c.phone || 'No Phone'}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Notification Title</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ✨ Custom Design Completed!"
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-body text-xs text-gray-800 placeholder-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Message Details</label>
                  <textarea
                    required
                    rows="4"
                    maxLength={300}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about order updates, approvals or promotions. Max 300 characters."
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-body text-xs text-gray-800 placeholder-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end pr-1 mt-1">
                    <span className="text-[9px] font-bold text-gray-400">{message.length}/300</span>
                  </div>
                </div>

                {/* Link Redirect */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Redirect Path (Optional)</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. /profile?tab=orders"
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-body text-xs text-gray-800 placeholder-gray-300 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1 font-body">Clicking the notification redirects the user to this frontend route.</p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl text-xs font-body font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all outline-none"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 bg-gray-950 text-white rounded-2xl text-xs font-body font-bold uppercase tracking-widest hover:bg-valentine-red active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Broadcasting alert...' : 'Send Notification'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: HISTORY LOG */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            
            {/* Search Filter for Log */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Broadcast Archive</h2>
                <p className="text-xs text-gray-500 font-body mt-1">Audit trail of the last 50 notification dispatches</p>
              </div>
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title, description, or user..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-body text-xs text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-valentine-red outline-none transition-all"
                />
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipient</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title / Content</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Redirect Route</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dispatched Date</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Read Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50 font-body text-xs text-gray-700">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Clock className="w-10 h-10 text-gray-300" />
                          <p className="text-gray-400 text-xs font-semibold">No dispatch history records found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.user_id ? (
                            <div>
                              <p className="font-bold text-gray-900">{item.user_id.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{item.user_id.email}</p>
                              {item.user_id.role !== 'customer' && (
                                <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                                  {item.user_id.role}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Disassociated User</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.type === 'design' 
                              ? 'bg-purple-50 text-purple-600' 
                              : item.type === 'order' 
                                ? 'bg-indigo-50 text-indigo-600' 
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-bold text-gray-900 truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{item.message}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.link ? (
                            <span className="text-[10px] font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 font-mono">
                              {item.link}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-[10px]">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.read ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3 stroke-[3]" />
                              Opened
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-gray-100 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Unread
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SendNotifications;
