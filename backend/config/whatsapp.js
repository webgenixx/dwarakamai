import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Send a WhatsApp message using Facebook Graph API
 * @param {string} to - Recipient phone number (with country code, no + sign)
 * @param {string} message - Message text
 * @returns {Promise} API response
 */
export const sendWhatsAppMessage = async (to, message) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp message sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ WhatsApp message failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send a WhatsApp template message
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Template name from WhatsApp Business Manager
 * @param {string} languageCode - Language code (e.g., 'en', 'en_US')
 * @param {Array} components - Template components (optional)
 * @returns {Promise} API response
 */
export const sendWhatsAppTemplate = async (to, templateName, languageCode = 'en', components = []) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp template sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ WhatsApp template failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send WhatsApp message with media (image, video, document)
 * @param {string} to - Recipient phone number
 * @param {string} mediaType - Type: 'image', 'video', 'document'
 * @param {string} mediaUrl - URL of the media file
 * @param {string} caption - Optional caption
 * @returns {Promise} API response
 */
export const sendWhatsAppMedia = async (to, mediaType, mediaUrl, caption = '') => {
  try {
    const mediaObject = {
      link: mediaUrl
    };

    if (caption && (mediaType === 'image' || mediaType === 'video')) {
      mediaObject.caption = caption;
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: mediaType,
        [mediaType]: mediaObject
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp media sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ WhatsApp media failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Verify WhatsApp webhook
 * @param {string} mode - Verification mode
 * @param {string} token - Verification token
 * @param {string} challenge - Challenge string
 * @returns {string|null} Challenge if verified, null otherwise
 */
export const verifyWebhook = (mode, token, challenge) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'dwarakamai_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return challenge;
  }

  console.log('❌ Webhook verification failed');
  return null;
};

export default {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendWhatsAppMedia,
  verifyWebhook
};
