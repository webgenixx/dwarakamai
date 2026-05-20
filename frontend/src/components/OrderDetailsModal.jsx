import { useState, useEffect } from 'react';
import { Download, Upload, X, Image as ImageIcon, CheckCircle, XCircle, MapPin, Phone, Mail, DollarSign, AlertCircle } from 'lucide-react';

const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
  const [designs, setDesigns] = useState({});
  const [uploadingDesign, setUploadingDesign] = useState(null);
  const [designFile, setDesignFile] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [updatedOrder, setUpdatedOrder] = useState(order);

  useEffect(() => {
    if (updatedOrder?.items) {
      updatedOrder.items.forEach(async (item) => {
        try {
          const token = localStorage.getItem('token');
          const itemId = item._id || item.id;
          if (!itemId) return;
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/designs/order-item/${itemId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.design) {
              setDesigns(prev => ({ ...prev, [itemId]: data.design }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch design for item:', error);
        }
      });
    }
  }, [updatedOrder]);

  const handleDesignUpload = async (orderItemId) => {
    if (!designFile) return;

    const formData = new FormData();
    formData.append('design', designFile);

    try {
      setUploadingDesign(orderItemId);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/designs/upload/${orderItemId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );

      if (response.ok) {
        alert('Design uploaded successfully!');
        setDesignFile(null);
        window.location.reload();
      } else {
        alert('Failed to upload design');
      }
    } catch (error) {
      console.error('Error uploading design:', error);
      alert('Failed to upload design');
    } finally {
      setUploadingDesign(null);
    }
  };

  const downloadImage = async (url, filename) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image');
    }
  };

  const getCustomizationImages = (item) => {
    if (item.customization_images && item.customization_images.length > 0) {
      return item.customization_images;
    }
    if (item.customization && item.customization.images && Array.isArray(item.customization.images)) {
      return item.customization.images;
    }
    if (item.customization && item.customization.image) {
      return [item.customization.image];
    }
    return [];
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === updatedOrder.order_status) return;

    setUpdatingStatus(true);
    setStatusUpdateError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${updatedOrder.id || updatedOrder._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            order_status: newStatus
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUpdatedOrder(data.order || { ...updatedOrder, order_status: newStatus });
        if (onUpdateStatus) {
          onUpdateStatus(updatedOrder.id || updatedOrder._id, newStatus);
        }
      } else {
        setStatusUpdateError('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setStatusUpdateError('Error updating status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order & Status Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Order Number</p>
              <p className="font-bold text-lg text-gray-900">{updatedOrder.order_number}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold uppercase mb-1">Order Date</p>
              <p className="font-bold text-lg text-gray-900">{(() => { const d = new Date(updatedOrder.createdAt || updatedOrder.created_at); return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); })()}</p>
              <p className="text-xs text-gray-600">{(() => { const d = new Date(updatedOrder.createdAt || updatedOrder.created_at); return isNaN(d) ? '' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); })()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Payment Status</p>
              <p className={`font-bold text-lg ${updatedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {updatedOrder.payment_status?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Contact Info + Shipping Address — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Customer Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">👤</span>
                Contact Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{updatedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Phone</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    {updatedOrder.customer_phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Email</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    {updatedOrder.customer_email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Shipping Address
              </h3>
              <div className="bg-white rounded p-3 border-l-4 border-orange-500 space-y-1">
                <p className="text-gray-900 font-semibold">{updatedOrder.shipping_address || updatedOrder.shipping_info?.address || 'N/A'}</p>
                {updatedOrder.shipping_info && (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-semibold">City:</span> {updatedOrder.shipping_info.city}</p>
                    <p><span className="font-semibold">State:</span> {updatedOrder.shipping_info.state}</p>
                    <p><span className="font-semibold">Pincode:</span> {updatedOrder.shipping_info.pincode}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Order Items with Customization */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">📦</span>
              Order Items
            </h3>
            <div className="space-y-4">
              {updatedOrder.items?.map((item, index) => {
                const customizationImages = getCustomizationImages(item);
                const isCustomizable = customizationImages.length > 0;

                return (
                  <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Item Header */}
                    <div className="bg-gray-50 p-4 flex items-start justify-between border-b">
                      <div className="flex items-start space-x-4">
                        {item.product_image && (
                          <img 
                            src={item.product_image?.startsWith('http') 
                              ? item.product_image 
                              : `${import.meta.env.VITE_API_URL}${item.product_image}`
                            } 
                            alt={item.product_name} 
                            className="w-20 h-20 object-cover rounded border" 
                          />
                        )}
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{item.product_name}</p>
                          <p className="text-sm text-gray-600 mt-1">Quantity: <span className="font-semibold">{item.quantity}</span></p>
                          <p className="text-sm text-gray-600">Price per unit: <span className="font-semibold">₹{parseFloat(item.price).toLocaleString()}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-lg text-valentine-red">₹{parseFloat(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Customization Details */}
                    <div className="p-4 bg-white">
                      {item.customization?.text && (
                        <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Custom Text</p>
                          <p className="text-gray-900">{item.customization.text}</p>
                        </div>
                      )}

                      {/* Customer Uploaded Images */}
                      {isCustomizable && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <ImageIcon className="w-5 h-5 text-purple-600" />
                              Customer Uploaded Images ({customizationImages.length})
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {customizationImages.map((img, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                                  <img
                                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL}${img}`}
                                    alt={`Customer upload ${imgIndex + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                                <button
                                  onClick={() => downloadImage(img, `${order.order_number}-customer-image-${imgIndex + 1}.jpg`)}
                                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded-lg"
                                  title="Download image"
                                >
                                  <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Current Design Status (If Already Uploaded) */}
                      {isCustomizable && designs[item._id || item.id] && (
                        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-800">
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span>🎨</span>
                            Current Design Status
                          </h4>
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs text-gray-600 font-semibold uppercase">Status:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                designs[item._id || item.id].status === 'approved'
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : designs[item._id || item.id].status === 'revision_requested'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {designs[item._id || item.id].status === 'approved' && '✅ Approved'}
                                {designs[item._id || item.id].status === 'revision_requested' && '❌ Revision Requested'}
                                {designs[item._id || item.id].status === 'pending_approval' && '⏳ Pending Customer Approval'}
                              </span>
                            </div>

                            {/* Designed Image Preview */}
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Uploaded Design:</p>
                              <div className="relative group max-w-xs">
                                <div className="aspect-square bg-white rounded-lg overflow-hidden border">
                                  <img
                                    src={
                                      designs[item._id || item.id].admin_designed_image.startsWith('http')
                                        ? designs[item._id || item.id].admin_designed_image
                                        : `${import.meta.env.VITE_API_URL}${designs[item._id || item.id].admin_designed_image}`
                                    }
                                    alt="Admin designed upload"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  onClick={() => downloadImage(
                                    designs[item._id || item.id].admin_designed_image,
                                    `design-${updatedOrder.order_number}-${item._id || item.id}.jpg`
                                  )}
                                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded-lg"
                                >
                                  <Download className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            </div>

                            {/* Customer Feedback (if revision requested) */}
                            {designs[item._id || item.id].status === 'revision_requested' && designs[item._id || item.id].customer_feedback && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 text-red-950">
                                <p className="text-xs font-bold uppercase mb-1">💭 Customer Feedback / Revision Instructions:</p>
                                <p className="text-sm italic font-body">"{designs[item._id || item.id].customer_feedback}"</p>
                              </div>
                            )}

                            {/* Revision Count and Approved Date */}
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              <p>Revision Count: <span className="font-semibold text-gray-700">{designs[item._id || item.id].revision_count || 0}</span></p>
                              {designs[item._id || item.id].approved_at && (
                                <p>Approved At: <span className="font-semibold text-gray-700">{new Date(designs[item._id || item.id].approved_at).toLocaleString()}</span></p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Admin Design Upload Section */}
                      {isCustomizable && (
                        <div className="bg-gradient-to-r from-valentine-red via-pink-400 to-red-400 rounded-lg p-4 text-white">
                          <h4 className="font-bold mb-3 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Upload Designed Image for Customer Approval
                          </h4>
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => setDesignFile(e.target.files[0])}
                              className="text-sm w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-50 rounded text-white placeholder-gray-200 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white file:text-valentine-red"
                            />
                            {designFile && (
                              <p className="text-sm text-white bg-black bg-opacity-20 rounded p-2">
                                Selected: {designFile.name}
                              </p>
                            )}
                            <button
                              onClick={() => handleDesignUpload(item._id || item.id)}
                              disabled={!designFile || uploadingDesign === (item._id || item.id)}
                              className="w-full px-4 py-2 bg-white text-valentine-red font-semibold rounded hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                              {uploadingDesign === (item._id || item.id) ? 'Uploading...' : 'Upload Design'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Details */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Payment Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Payment Method:</span>
                  <span className="font-semibold text-gray-900">{(updatedOrder.payment_method || 'razorpay').toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Payment Status:</span>
                  <span className={`font-semibold ${updatedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {updatedOrder.payment_status?.toUpperCase()}
                  </span>
                </div>
                {updatedOrder.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment ID:</span>
                    <span className="font-semibold text-gray-900 text-xs truncate">{updatedOrder.razorpay_payment_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                Order Status
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Current Status:</span>
                  <span className="font-semibold text-gray-900 px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                    {(updatedOrder.order_status || 'pending').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Order Type:</span>
                  <span className="font-semibold text-gray-900">{(updatedOrder.order_type || 'online').toUpperCase()}</span>
                </div>
                
                {/* Status Update Section */}
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Update Status</p>
                  <div className="flex gap-2">
                    <select
                      value={updatedOrder.order_status || 'pending'}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      disabled={updatingStatus}
                      className="flex-1 px-3 py-2 border border-indigo-300 rounded bg-white text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  {statusUpdateError && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4" />
                      {statusUpdateError}
                    </div>
                  )}
                  {updatingStatus && (
                    <p className="mt-2 text-xs text-indigo-600">Updating status...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-300">
            <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{parseFloat(order.subtotal || 0).toLocaleString()}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-₹{parseFloat(order.discount).toLocaleString()}</span>
                </div>
              )}
              {order.shipping_cost && order.shipping_cost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Shipping Cost:</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(order.shipping_cost).toLocaleString()}</span>
                </div>
              )}
              {order.service_charge && order.service_charge > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Service Charge:</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(order.service_charge).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total Amount:</span>
                  <span className="font-bold text-2xl text-valentine-red">₹{parseFloat(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
