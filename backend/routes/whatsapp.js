import express from 'express';
import { sendWhatsAppMessage, sendWhatsAppTemplate, sendWhatsAppMedia } from '../config/whatsapp.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Send order confirmation via WhatsApp
 * POST /api/whatsapp/order-confirmation
 */
router.post('/order-confirmation', authenticate, async (req, res) => {
  try {
    const { orderId, customerPhone, customerName, total, deliveryDate } = req.body;

    if (!customerPhone) {
      return res.status(400).json({ error: 'Customer phone number is required' });
    }

    const message = `
🎉 Order Confirmed!

Hi ${customerName}!

Your order #${orderId} has been confirmed.

Order Details:
💰 Total: ₹${total}
📅 Estimated Delivery: ${deliveryDate}

Thank you for shopping with Dwarakamai digital photo studio! 💝

Track your order: ${process.env.FRONTEND_URL}/orders/${orderId}

Need help? Reply to this message or call us at +91 9492686421
    `.trim();

    const result = await sendWhatsAppMessage(customerPhone, message);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'WhatsApp notification sent',
        messageId: result.data.messages?.[0]?.id
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send WhatsApp message',
        details: result.error
      });
    }
  } catch (error) {
    console.error('WhatsApp order confirmation error:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp notification' });
  }
});

/**
 * Send order status update via WhatsApp
 * POST /api/whatsapp/order-status
 */
router.post('/order-status', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderId, customerPhone, customerName, status } = req.body;

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

    const message = `
${statusEmojis[status]} Order Update

Hi ${customerName}!

Order #${orderId}
Status: ${statusMessages[status]}

View details: ${process.env.FRONTEND_URL}/orders/${orderId}

Questions? Call us at +91 9492686421
    `.trim();

    const result = await sendWhatsAppMessage(customerPhone, message);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Status update sent via WhatsApp'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send status update'
      });
    }
  } catch (error) {
    console.error('WhatsApp status update error:', error);
    res.status(500).json({ error: 'Failed to send status update' });
  }
});

/**
 * Send marketing campaign (Admin only)
 * POST /api/whatsapp/campaign
 */
router.post('/campaign', authenticate, isAdmin, async (req, res) => {
  try {
    const { phoneNumbers, message } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: 'Phone numbers array is required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const results = [];
    const errors = [];

    for (const phone of phoneNumbers) {
      const result = await sendWhatsAppMessage(phone, message);
      
      if (result.success) {
        results.push({ phone, success: true });
      } else {
        errors.push({ phone, error: result.error });
      }

      // Wait 1 second between messages to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('WhatsApp campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

/**
 * Send product image via WhatsApp
 * POST /api/whatsapp/send-image
 */
router.post('/send-image', authenticate, isAdmin, async (req, res) => {
  try {
    const { customerPhone, imageUrl, caption } = req.body;

    if (!customerPhone || !imageUrl) {
      return res.status(400).json({ error: 'Phone number and image URL are required' });
    }

    const result = await sendWhatsAppMedia(
      customerPhone,
      'image',
      imageUrl,
      caption || 'Check out this product from Dwarakamai digital photo studio! 🎁'
    );

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Image sent via WhatsApp'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send image'
      });
    }
  } catch (error) {
    console.error('WhatsApp image send error:', error);
    res.status(500).json({ error: 'Failed to send image' });
  }
});

/**
 * Test WhatsApp connection
 * GET /api/whatsapp/test
 */
router.get('/test', authenticate, isAdmin, async (req, res) => {
  try {
    const testNumber = process.env.WHATSAPP_NUMBER || '919492686421';
    const testMessage = 'Test message from Dwarakamai digital photo studio WhatsApp API. Connection is working! ✅';

    const result = await sendWhatsAppMessage(testNumber, testMessage);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test message sent successfully',
        messageId: result.data.messages?.[0]?.id
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Test message failed',
        details: result.error
      });
    }
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;
