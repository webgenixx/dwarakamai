import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const TermsConditionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="valentine-gradient text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Terms & Conditions
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
              Welcome to Dwarakamai digital photo studio. By accessing and using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchase or using our services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">1. Acceptance of Terms</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                By using our website, you confirm that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You are at least 18 years old or have parental/guardian consent</li>
                <li>You have the legal capacity to enter into binding contracts</li>
                <li>You will provide accurate and complete information</li>
                <li>You agree to comply with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* Products and Services */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">2. Products and Services</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">2.1 Product Descriptions</h3>
                <p>
                  We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions, colors, or other content are accurate, complete, or error-free. Actual products may vary slightly from images shown.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2.2 Customization Services</h3>
                <p>
                  For customized products, you are responsible for providing accurate text, images, and specifications. We are not liable for errors in customization resulting from incorrect information provided by you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2.3 Service Bookings</h3>
                <p>
                  Photography, videography, and decoration services are subject to availability. Bookings must be confirmed at least 7 days in advance. Service terms and pricing will be communicated separately.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing and Payment */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">3. Pricing and Payment</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">3.1 Pricing</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All prices are in Indian Rupees (INR)</li>
                  <li>Prices are subject to change without notice</li>
                  <li>The price at the time of order placement will apply</li>
                  <li>Prices include applicable taxes unless stated otherwise</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3.2 Payment</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We accept payments through Razorpay (Credit/Debit Cards, UPI, Net Banking, Wallets)</li>
                  <li>Payment must be completed before order processing</li>
                  <li>All transactions are secure and encrypted</li>
                  <li>We do not store your payment card information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Orders and Delivery */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">4. Orders and Delivery</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">4.1 Order Processing</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Orders are processed within 1-2 business days</li>
                  <li>Customized products may take 3-5 business days</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Order confirmation will be sent via email</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">4.2 Delivery</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Delivery timelines are estimates and not guaranteed</li>
                  <li>Delivery charges may apply based on location</li>
                  <li>You must provide accurate shipping information</li>
                  <li>Risk of loss passes to you upon delivery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">5. User Accounts</h2>
            <div className="space-y-3 text-gray-700">
              <p>When you create an account, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate and current information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Not share your account credentials with others</li>
              </ul>
              <p className="mt-3">
                We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">6. Prohibited Activities</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>You may not:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the website for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit viruses, malware, or harmful code</li>
                <li>Scrape, copy, or reproduce website content without permission</li>
                <li>Impersonate another person or entity</li>
                <li>Interfere with the proper functioning of the website</li>
                <li>Submit false or misleading information</li>
                <li>Engage in fraudulent activities</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">7. Intellectual Property</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of Dwarakamai digital photo studio and protected by copyright and trademark laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">8. Limitation of Liability</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                To the maximum extent permitted by law, Dwarakamai digital photo studio shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from unauthorized access to your account</li>
                <li>Delays or failures in delivery beyond our control</li>
                <li>Product defects not reported within the warranty period</li>
              </ul>
              <p className="mt-3">
                Our total liability shall not exceed the amount paid by you for the specific product or service.
              </p>
            </div>
          </section>

          {/* Warranty Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">9. Warranty Disclaimer</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Products and services are provided "as is" without warranties of any kind, either express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The website will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The website is free from viruses or harmful components</li>
                <li>Products will meet your specific requirements</li>
              </ul>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless Dwarakamai digital photo studio from any claims, damages, losses, or expenses arising from your violation of these Terms or your use of our services.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the website after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-valentine-pink/10 rounded-lg p-6 border border-valentine-pink/20">
            <h2 className="text-2xl font-bold text-valentine-red mb-4">13. Contact Information</h2>
            <div className="text-gray-700 space-y-2">
              <p>For questions about these Terms and Conditions, contact us:</p>
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

export default TermsConditionsPage;
