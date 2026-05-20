import { useState } from 'react';
import { Send, MessageCircle, Image, Users, TestTube } from 'lucide-react';
import api from '../../utils/api';

export default function WhatsAppMessaging() {
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  // Single message state
  const [singlePhone, setSinglePhone] = useState('');

  // Bulk message state
  const [bulkPhones, setBulkPhones] = useState('');

  // Image message state
  const [imagePhone, setImagePhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  const handleSendSingle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/api/whatsapp/order-confirmation', {
        orderId: 'TEST-' + Date.now(),
        customerPhone: singlePhone,
        customerName: 'Customer',
        total: '999',
        deliveryDate: new Date().toLocaleDateString('en-IN')
      });

      setResult({
        type: 'success',
        message: 'Message sent successfully! ✅'
      });
      setSinglePhone('');
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.error || 'Failed to send message'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const phoneArray = bulkPhones
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (phoneArray.length === 0) {
        setResult({
          type: 'error',
          message: 'Please enter at least one phone number'
        });
        setLoading(false);
        return;
      }

      const response = await api.post('/api/whatsapp/campaign', {
        phoneNumbers: phoneArray,
        message: message
      });

      setResult({
        type: 'success',
        message: `Campaign sent! ✅ Sent: ${response.data.sent}, Failed: ${response.data.failed}`
      });
      setBulkPhones('');
      setMessage('');
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.error || 'Failed to send campaign'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/api/whatsapp/send-image', {
        customerPhone: imagePhone,
        imageUrl: imageUrl,
        caption: imageCaption
      });

      setResult({
        type: 'success',
        message: 'Image sent successfully! ✅'
      });
      setImagePhone('');
      setImageUrl('');
      setImageCaption('');
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.error || 'Failed to send image'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await api.get('/api/whatsapp/test');
      setResult({
        type: 'success',
        message: 'Test message sent! Check your WhatsApp ✅'
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error.response?.data?.details?.error?.message || 'Test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Messaging</h1>
        <p className="text-gray-600">Send WhatsApp messages to customers</p>
      </div>

      {/* Test Connection Button */}
      <div className="mb-6">
        <button
          onClick={handleTest}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <TestTube className="w-4 h-4" />
          Test WhatsApp Connection
        </button>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`mb-6 p-4 rounded-lg ${
          result.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {result.message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('single')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'single'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Single Message
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'bulk'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Bulk Campaign
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'image'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Image className="w-4 h-4 inline mr-2" />
            Send Image
          </button>
        </div>
      </div>

      {/* Single Message Tab */}
      {activeTab === 'single' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Send Single Message</h2>
          <form onSubmit={handleSendSingle}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (with country code)
              </label>
              <input
                type="text"
                value={singlePhone}
                onChange={(e) => setSinglePhone(e.target.value)}
                placeholder="919876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: Country code + number (no + sign, no spaces)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Test Order Confirmation'}
            </button>
          </form>
        </div>
      )}

      {/* Bulk Campaign Tab */}
      {activeTab === 'bulk' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Send Bulk Campaign</h2>
          <form onSubmit={handleSendBulk}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers (one per line)
              </label>
              <textarea
                value={bulkPhones}
                onChange={(e) => setBulkPhones(e.target.value)}
                placeholder="919876543210&#10;919876543211&#10;919876543212"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Note:</strong> Messages will be sent with 1 second delay between each to avoid rate limits.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              <Users className="w-4 h-4" />
              {loading ? 'Sending Campaign...' : 'Send Campaign'}
            </button>
          </form>
        </div>
      )}

      {/* Send Image Tab */}
      {activeTab === 'image' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Send Image</h2>
          <form onSubmit={handleSendImage}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={imagePhone}
                onChange={(e) => setImagePhone(e.target.value)}
                placeholder="919876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption (optional)
              </label>
              <textarea
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Check out this product! 🎁"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              <Image className="w-4 h-4" />
              {loading ? 'Sending Image...' : 'Send Image'}
            </button>
          </form>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📱 WhatsApp API Status</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• API is configured and ready to use</li>
          <li>• In test mode: Can only send to approved numbers</li>
          <li>• Add test numbers in Facebook Business Manager</li>
          <li>• Rate limit: 1 message per second for bulk campaigns</li>
        </ul>
      </div>
    </div>
  );
}
