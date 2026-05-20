import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { paytmConfig, generateChecksum, verifyChecksum } from '../config/paytm.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { logAdminAction, getChanges } from '../middleware/auditLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendWhatsAppMessage } from '../config/whatsapp.js';

const router = express.Router();

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

// Create Paytm Order
router.post('/create-paytm-order', async (req, res) => {
  try {
    const { amount, orderId, orderNumber } = req.body;

    // Use order_number as ORDER_ID (Paytm requirement)
    const paymentOrderId = orderNumber || orderId;

    const params = {
      MID: paytmConfig.MID,
      WEBSITE: paytmConfig.WEBSITE,
      CHANNEL_ID: paytmConfig.CHANNEL_ID_WEB,
      INDUSTRY_TYPE_ID: paytmConfig.INDUSTRY_TYPE_ID,
      ORDER_ID: paymentOrderId,
      CUST_ID: paymentOrderId,
      TXN_AMOUNT: amount.toString(),
      EMAIL: 'customer@dwarakamaidigitalphotostudio.com',
      MOBILE_NO: '9999999999',
      CALLBACK_URL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/orders/paytm-callback`,
    };

    console.log('Creating Paytm order with params:', params);

    // Generate checksum
    const checksum = generateChecksum(params, paytmConfig.MERCHANT_KEY);
    params.CHECKSUMHASH = checksum;

    res.json({
      success: true,
      paytmParams: params,
      paytmGatewayUrl: paytmConfig.PAYTM_GATEWAY_URL,
    });
  } catch (error) {
    console.error('Paytm order creation error:', error);
    res.status(500).json({ error: 'Failed to create Paytm payment order' });
  }
});

// Test Mode: Bypass Paytm and mark order as paid (for development/testing)
router.post('/test-payment/:orderId', async (req, res) => {
  try {
    // Only allow in development mode or if test flag is enabled
    if (process.env.NODE_ENV !== 'development' && !process.env.ENABLE_TEST_PAYMENTS) {
      return res.status(403).json({ error: 'Test payments not enabled' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        payment_status: 'paid',
        order_status: 'confirmed',
        paytm_transaction_status: 'TEST_MODE_SUCCESS'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('✅ Test payment processed for order:', order.order_number);
    res.json({ success: true, message: 'Test payment successful', order });
  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({ error: 'Test payment failed' });
  }
});

// Verify Paytm Payment
router.post('/verify-paytm-payment', async (req, res) => {
  try {
    const { ORDERID, TXNID, TXNAMOUNT, TXNSTATUS } = req.body;
    let checksumhash = req.body.CHECKSUMHASH;

    const verifyParams = {
      MID: paytmConfig.MID,
      ORDERID,
      TXNID,
      TXNAMOUNT,
      TXNSTATUS,
    };

    const isValidChecksum = verifyChecksum(verifyParams, paytmConfig.MERCHANT_KEY, checksumhash);

    if (!isValidChecksum) {
      return res.status(400).json({ success: false, error: 'Invalid checksum' });
    }

    if (TXNSTATUS === 'TXN_SUCCESS') {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Transaction failed', status: TXNSTATUS });
    }
  } catch (error) {
    console.error('Paytm verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Paytm Callback Handler
router.post('/paytm-callback', async (req, res) => {
  try {
    const { ORDERID, TXNSTATUS, TXNAMOUNT } = req.body;
    let checksumhash = req.body.CHECKSUMHASH;

    const verifyParams = {
      MID: paytmConfig.MID,
      ORDERID,
      TXNSTATUS,
      TXNAMOUNT,
    };

    const isValidChecksum = verifyChecksum(verifyParams, paytmConfig.MERCHANT_KEY, checksumhash);

    if (isValidChecksum && TXNSTATUS === 'TXN_SUCCESS') {
      // Update order payment status
      await Order.findByIdAndUpdate(
        ORDERID,
        { payment_status: 'paid', paytm_order_id: ORDERID },
        { new: true }
      );
      res.json({ success: true, message: 'Payment processed successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment' });
    }
  } catch (error) {
    console.error('Paytm callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Create order
router.post('/',
  [
    body('customer_name').trim().notEmpty(),
    body('customer_phone').trim().notEmpty(),
    body('shipping_address').trim().notEmpty(),
    body('items').isArray({ min: 1 }),
    body('total').isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const {
        customer_name, customer_email, customer_phone,
        shipping_address, items, subtotal, shipping_cost = 0,
        service_charge = 0, total, payment_method = 'razorpay', shipping_info
      } = req.body;

      const orderNumber = generateOrderNumber();

      const shippingAddressText = shipping_address ||
        (shipping_info ? `${shipping_info.address}, ${shipping_info.city}, ${shipping_info.state} - ${shipping_info.pincode}` : null);

      // Build order items and update stock
      const orderItems = items.map((item) => ({
        product_id: item.product_id || item.id || null,
        product_name: item.name,
        product_image: item.image || item.image_url || null,
        quantity: item.quantity,
        price: item.price || item.finalPrice,
        customization: item.customization || null,
      }));

      // Update stock for each product
      for (const item of items) {
        const pid = item.product_id || item.id;
        if (pid) {
          await Product.findByIdAndUpdate(pid, {
            $inc: { stock_quantity: -item.quantity },
          });
        }
      }

      const order = await Order.create({
        order_number: orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address: shippingAddressText,
        shipping_info,
        items: orderItems,
        subtotal,
        shipping_cost,
        service_charge,
        total,
        payment_method: payment_method || 'paytm',
        payment_status: 'pending',
        order_status: 'pending',
      });

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order._id,
          order_number: order.order_number,
          total: order.total,
          status: order.order_status,
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// Get user's orders (authenticated)
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const rawLimit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const rawOffset = Math.max(Number(req.query.offset) || 0, 0);
    const userEmail = req.user.email;

    const orders = await Order.find({ customer_email: userEmail, payment_status: 'paid' })
      .sort({ createdAt: -1 })
      .skip(rawOffset)
      .limit(rawLimit)
      .lean();

    // Ensure product_id in items is always a plain string for frontend use
    const formatted = orders.map(o => ({
      ...o,
      id: o._id.toString(),
      items: (o.items || []).map(item => ({
        ...item,
        product_id: item.product_id ? item.product_id.toString() : null,
      })),
    }));

    res.json({ orders: formatted, count: formatted.length });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const rawLimit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const rawOffset = Math.max(Number(req.query.offset) || 0, 0);
    const { status } = req.query;

    const filter = {};
    if (status) filter.order_status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(rawOffset)
      .limit(rawLimit)
      .lean();

    res.json({ orders: orders.map(o => ({ ...o, id: o._id })), count: orders.length });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Return order with all items included
    console.log('Returning order:', order.order_number, 'with', order.items?.length || 0, 'items');
    res.json({ 
      ...order,
      id: order._id,
      items: order.items || []
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { razorpay_payment_id, razorpay_signature, payment_status: 'paid' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Payment updated successfully', order });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ error: 'Order not found' });

    const updates = {};
    if (order_status) updates.order_status = order_status;
    if (payment_status) updates.payment_status = payment_status;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });

    const changes = getChanges(oldOrder, order);
    await logAdminAction(req, 'UPDATE', 'order', order._id, order.order_number, changes);

    if (order_status && oldOrder.order_status !== order_status) {
      const user = await User.findOne({ email: order.customer_email });
      if (user) {
        let title = 'Order Update';
        let message = `Your order ${order.order_number} status has been updated to ${order_status}.`;
        
        if (order_status === 'shipped') {
          title = 'Order Shipped';
          message = `Great news! Your order ${order.order_number} is on its way.`;
        } else if (order_status === 'delivered') {
          title = 'Order Delivered';
          message = `Your order ${order.order_number} has been delivered. Enjoy!`;
        }

        await Notification.create({
          user_id: user._id,
          title,
          message,
          type: 'order',
          link: `/order/${order._id}`
        });
      }

      // Send WhatsApp Notification
      if (order.customer_phone) {
        const statusEmojis = {
          'pending': '⏳',
          'processing': '📦',
          'shipped': '🚚',
          'delivered': '✅',
          'cancelled': '❌'
        };
        const statusMessages = {
          'pending': 'Your order is pending confirmation',
          'processing': 'Your order is being processed',
          'shipped': 'Your order has been shipped!',
          'delivered': 'Your order has been delivered',
          'cancelled': 'Your order has been cancelled'
        };
        
        const frontendUrl = process.env.FRONTEND_URL || 'https://dwarakamaidigitalphotostudio.com';
        const waMessage = `${statusEmojis[order_status] || '📦'} Order Update\n\nHi ${order.customer_name}!\n\nOrder #${order.order_number}\nStatus: ${statusMessages[order_status] || `Your order status is now ${order_status}`}\n\nView details: ${frontendUrl}/order/${order._id}\n\nQuestions? Call us at +91 9492686421`;
        
        // Send asynchronously without awaiting
        sendWhatsAppMessage(order.customer_phone, waMessage).catch(err => console.error('Failed to send WA update:', err));
      }
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
