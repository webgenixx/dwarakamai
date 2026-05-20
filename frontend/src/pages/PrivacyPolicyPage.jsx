import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="valentine-gradient text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg">Last Updated: February 6, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              At Dwarakamai digital photo studio, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">1.1 Personal Information</h3>
                <p className="mb-2">When you register or place an order, we collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>Shipping Address (including PIN code)</li>
                  <li>Billing Information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">1.2 Order Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Products purchased</li>
                  <li>Customization details</li>
                  <li>Order history and preferences</li>
                  <li>Payment transaction details</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">1.3 Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP Address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Cookies and usage data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate order status and updates</li>
                <li>Provide customer support</li>
                <li>Send promotional offers and newsletters (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
                <li>Personalize your shopping experience</li>
              </ul>
            </div>
          </section>

          {/* Data Storage and Security */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">3. Data Storage and Security</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encrypted data transmission using SSL/TLS</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Regular security audits and updates</li>
                <li>Restricted access to personal data</li>
                <li>Secure payment processing through Razorpay</li>
              </ul>
              <p className="mt-3">
                Your data is stored on secure servers and retained only as long as necessary to provide our services or as required by law.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">4. Data Sharing and Disclosure</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
                <li><strong>Shipping Partners:</strong> To deliver your orders</li>
                <li><strong>Email Service Providers:</strong> To send order confirmations and updates</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="mt-3">
                All third-party service providers are contractually obligated to maintain the confidentiality and security of your information.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">5. Cookies and Tracking</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
              </p>
              <p>
                Types of cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Essential Cookies:</strong> Required for site functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand site usage</li>
                <li><strong>Preference Cookies:</strong> Remember your settings</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">6. Your Rights</h2>
            <div className="space-y-2 text-gray-700">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with data protection authorities</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us at <a href="mailto:dwarakamaiphotoplanet9@gmail.com" className="text-valentine-red hover:underline">dwarakamaiphotoplanet9@gmail.com</a>
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-valentine-pink/10 rounded-lg p-6 border border-valentine-pink/20">
            <h2 className="text-2xl font-bold text-valentine-red mb-4">9. Contact Us</h2>
            <div className="text-gray-700 space-y-2">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="space-y-1">
                <p><strong>Business Name:</strong> Dwarakamai digital photo studio</p>
                <p><strong>Email:</strong> <a href="mailto:dwarakamaiphotoplanet9@gmail.com" className="text-valentine-red hover:underline">dwarakamaiphotoplanet9@gmail.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+919492686421" className="text-valentine-red hover:underline">+91 94926 86421</a></p>
                <p><strong>Address:</strong> 123 Main Street, City Center, Your City, State - 123456, India</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
