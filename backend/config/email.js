import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const hasCredentials = () =>
  Boolean(String(process.env.EMAIL_USER || '').trim()) &&
  Boolean(String(process.env.EMAIL_PASSWORD || '').trim());

/** @returns {import('nodemailer').Transporter | null} */
function buildMailTransport() {
  if (!hasCredentials()) return null;

  const host = String(process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure =
    process.env.EMAIL_SECURE === 'true' ||
    process.env.EMAIL_SECURE === '1' ||
    port === 465;

  const isProd = process.env.NODE_ENV === 'production';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: String(process.env.EMAIL_USER).trim(),
      pass: String(process.env.EMAIL_PASSWORD).trim(),
    },
    // STARTTLS on 587 (Gmail, most providers)
    requireTLS: port === 587 && !secure,
    connectionTimeout: 25_000,
    greetingTimeout: 25_000,
    socketTimeout: 25_000,
    // In production use default certificate verification (stricter than dev-only bypass)
    tls: isProd
      ? { minVersion: 'TLSv1.2' }
      : { rejectUnauthorized: false },
  });
}

let transporter = buildMailTransport();

export const isEmailConfigured = () => Boolean(transporter);

export const recreateEmailTransport = () => {
  transporter = buildMailTransport();
};

if (!hasCredentials()) {
  console.warn(
    '⚠️  EMAIL_USER / EMAIL_PASSWORD are not set — OTP and transactional email will not send until configured on the server.'
  );
} else if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email SMTP verify failed:', error.message);
      if (process.env.NODE_ENV === 'production') {
        console.error(
          '   Production checklist: set EMAIL_USER + EMAIL_PASSWORD (Gmail App Password), confirm host/port, and ensure outbound SMTP (587 or 465) is allowed on your host.'
        );
      }
    } else {
      console.log('✅ Email SMTP is reachable');
    }
  });
}

// Send OTP Email
export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!transporter) {
    throw new Error(
      'Email is not configured on the server (missing EMAIL_USER / EMAIL_PASSWORD).'
    );
  }

  const subject =
    purpose === 'verification'
      ? 'Verify Your Email - Dwarakamai digital photo studio'
      : 'Password Reset OTP - Dwarakamai digital photo studio';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dwarakamai digital photo studio</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #EDE8F2;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.65;
          color: #374151;
        }
        .outer {
          max-width: 600px;
          margin: 0 auto;
          padding: 32px 16px;
        }
        .card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E5D9ED;
          box-shadow: 0 12px 40px rgba(157, 78, 141, 0.12);
        }
        .accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #F7D060 0%, #EAB308 50%, #F7D060 100%);
        }
        .header {
          background: linear-gradient(145deg, #9D4E8D 0%, #7A3B6D 55%, #5C2D52 100%);
          color: #ffffff;
          padding: 36px 28px 32px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .header .tagline {
          margin: 10px 0 0;
          font-size: 13px;
          opacity: 0.92;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        .content {
          padding: 32px 28px 28px;
        }
        .content h2 {
          margin: 0 0 12px;
          font-size: 20px;
          color: #1f2937;
          font-weight: 600;
        }
        .content p {
          margin: 0 0 14px;
          font-size: 15px;
          color: #4b5563;
        }
        .otp-box {
          background: linear-gradient(180deg, #FDF8FC 0%, #F9F5FC 100%);
          border: 2px solid #D4B8D0;
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-label {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9D4E8D;
        }
        .otp-code {
          font-size: 34px;
          font-weight: 700;
          color: #7A3B6D;
          letter-spacing: 0.35em;
          margin: 12px 0 8px;
          font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
        }
        .otp-expiry {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }
        .note-list {
          margin: 20px 0 0;
          padding-left: 20px;
          font-size: 14px;
          color: #4b5563;
        }
        .note-list li {
          margin-bottom: 6px;
        }
        .signoff {
          margin-top: 28px;
          font-size: 15px;
          color: #374151;
        }
        .signoff strong {
          color: #7A3B6D;
        }
        .footer {
          text-align: center;
          padding: 20px 24px 28px;
          background: #FAF8FC;
          border-top: 1px solid #EDE8F2;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }
        .footer p {
          margin: 0 0 8px;
        }
      </style>
    </head>
    <body>
      <div class="outer">
        <div class="card">
          <div class="accent-bar"></div>
          <div class="header">
            <h1>Dwarakamai digital photo studio</h1>
            <p class="tagline">Personalized gifts &amp; memories</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>${
              purpose === 'verification'
                ? 'Thank you for registering. Use the verification code below to confirm your email address.'
                : 'We received a request to reset your password. Use the code below to continue — it is valid for a short time only.'
            }</p>

            <div class="otp-box">
              <p class="otp-label">Your one-time code</p>
              <div class="otp-code">${otp}</div>
              <p class="otp-expiry">Expires in 10 minutes</p>
            </div>

            <p style="margin-top: 20px;"><strong style="color: #7A3B6D;">Please note</strong></p>
            <ul class="note-list">
              <li>Do not share this code with anyone.</li>
              <li>If you did not request this, you can safely ignore this email.</li>
            </ul>

            <p class="signoff">Warm regards,<br><strong>Dwarakamai digital photo studio</strong></p>
          </div>
          <div class="footer">
            <p>This message was sent automatically. Please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Dwarakamai digital photo studio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const fromAddress =
    process.env.EMAIL_FROM?.trim() ||
    `"Dwarakamai digital photo studio" <${process.env.EMAIL_USER}>`;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject,
    html,
  };

  try {
    console.log(`📧 Sending email to: ${email}`);
    console.log(`📝 Subject: ${subject}`);

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    throw error;
  }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  if (!transporter) {
    console.warn('Welcome email skipped: email not configured');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome — Dwarakamai digital photo studio</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #EDE8F2;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.65;
          color: #374151;
        }
        .outer {
          max-width: 600px;
          margin: 0 auto;
          padding: 32px 16px;
        }
        .card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E5D9ED;
          box-shadow: 0 12px 40px rgba(157, 78, 141, 0.12);
        }
        .accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #F7D060 0%, #EAB308 50%, #F7D060 100%);
        }
        .header {
          background: linear-gradient(145deg, #9D4E8D 0%, #7A3B6D 55%, #5C2D52 100%);
          color: #ffffff;
          padding: 36px 28px 32px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .header .tagline {
          margin: 10px 0 0;
          font-size: 13px;
          opacity: 0.92;
        }
        .content {
          padding: 32px 28px 28px;
        }
        .content h2 {
          margin: 0 0 12px;
          font-size: 20px;
          color: #1f2937;
          font-weight: 600;
        }
        .content p, .content li {
          font-size: 15px;
          color: #4b5563;
        }
        .content ul {
          margin: 12px 0 20px;
          padding-left: 20px;
        }
        .content li {
          margin-bottom: 8px;
        }
        .highlight {
          display: inline-block;
          margin-top: 8px;
          padding: 10px 16px;
          background: #FDF8FC;
          border-left: 4px solid #F7D060;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
          color: #5C2D52;
        }
        .signoff {
          margin-top: 24px;
          font-size: 15px;
          color: #374151;
        }
        .signoff strong {
          color: #7A3B6D;
        }
        .footer {
          text-align: center;
          padding: 20px 24px 28px;
          background: #FAF8FC;
          border-top: 1px solid #EDE8F2;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }
        .footer p {
          margin: 0 0 8px;
        }
      </style>
    </head>
    <body>
      <div class="outer">
        <div class="card">
          <div class="accent-bar"></div>
          <div class="header">
            <h1>Welcome aboard</h1>
            <p class="tagline">Dwarakamai digital photo studio</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your account is ready. We are glad you are here — explore personalized gifts, studio services, and more.</p>
            <p><strong style="color: #7A3B6D;">You can now:</strong></p>
            <ul>
              <li>Shop curated products and custom keepsakes</li>
              <li>Book professional photography &amp; services</li>
              <li>Track orders from your profile</li>
              <li>Discover offers and new arrivals</li>
            </ul>
            <p class="highlight">Questions? Reach us through the contact options on our website anytime.</p>
            <p class="signoff">Warm regards,<br><strong>Dwarakamai digital photo studio</strong></p>
          </div>
          <div class="footer">
            <p>This message was sent automatically when you created your account.</p>
            <p>&copy; ${new Date().getFullYear()} Dwarakamai digital photo studio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const fromAddress =
    process.env.EMAIL_FROM?.trim() ||
    `"Dwarakamai digital photo studio" <${process.env.EMAIL_USER}>`;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: 'Welcome to Dwarakamai digital photo studio',
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }
};

export default transporter;
