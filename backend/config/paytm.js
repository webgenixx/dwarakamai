import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Paytm Configuration
export const paytmConfig = {
  MID: process.env.PAYTM_MERCHANT_ID || 'WJHrWq1261615383104',
  MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY || 'hwxOxPs5Whj5baT1',
  WEBSITE: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
  INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE || 'Retail',
  CHANNEL_ID_WEB: process.env.PAYTM_CHANNEL_ID_WEB || 'WEB',
  CHANNEL_ID_APP: process.env.PAYTM_CHANNEL_ID_APP || 'WAP',
  PAYTM_GATEWAY_URL: process.env.PAYTM_GATEWAY_URL || 'https://securegw-stage.paytm.in/order/initiate',
  PAYTM_VERIFY_URL: process.env.PAYTM_VERIFY_URL || 'https://securegw-stage.paytm.in/merchant-status/?cmd=get:TransactionDetail',
};

/**
 * Generate Paytm Checksum
 */
export const generateChecksum = (params, key) => {
  const keys = Object.keys(params).sort();
  let str = '';
  keys.forEach((key) => {
    str += params[key] + '|';
  });
  str += key;
  
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return hash;
};

/**
 * Verify Paytm Response Checksum
 */
export const verifyChecksum = (params, key, checksum) => {
  const generatedChecksum = generateChecksum(params, key);
  return generatedChecksum === checksum;
};

export default paytmConfig;
