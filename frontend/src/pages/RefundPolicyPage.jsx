import { RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="valentine-gradient text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Refund & Cancellation Policy
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
              At Dwarakamai digital photo studio, we strive to ensure customer satisfaction. This policy outlines our refund and cancellation procedures for products and services. Please read carefully before making a purchase.
            </p>
          </section>

          {/* Order Cancellation */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">1. Order Cancellation</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">1.1 Cancellation by Customer</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">Before Order Processing</p>
                      <p className="text-sm text-green-700">Orders can be cancelled within 2 hours of placement if not yet processed. Full refund will be initiated.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">After Order Processing</p>
                      <p className="text-sm text-yellow-700">Once order is processed or shipped, cancellation is not possible. You may request a return after delivery.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">Customized Products</p>
                      <p className="text-sm text-red-700">Personalized/customized products cannot be cancelled once production has started.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">1.2 Cancellation by Dwarakamai digital photo studio</h3>
                <p className="mb-2">We reserve the right to cancel orders in the following cases:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Product unavailability or stock issues</li>
                  <li>Pricing or product information errors</li>
                  <li>Payment verification failure</li>
                  <li>Suspected fraudulent activity</li>
                  <li>Force majeure events</li>
                </ul>
                <p className="mt-2 text-sm italic">In such cases, full refund will be processed within 5-7 business days.</p>
              </div>
            </div>
          </section>

          {/* Return Policy */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">2. Return Policy</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">2.1 Eligible Returns</h3>
                <p className="mb-2">Returns are accepted within 7 days of delivery for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Damaged or defective products</li>
                  <li>Wrong product delivered</li>
                  <li>Product significantly different from description</li>
                  <li>Missing items from order</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2.2 Return Conditions</h3>
                <p className="mb-2">To be eligible for return, products must:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Be in original condition with tags and packaging intact</li>
                  <li>Not be used, worn, or altered</li>
                  <li>Include all accessories and free gifts (if any)</li>
                  <li>Have proof of purchase (order ID/invoice)</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 text-red-800">2.3 Non-Returnable Items</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-red-700">
                  <li>Customized/personalized products</li>
                  <li>Perishable items (cakes, flowers, chocolates)</li>
                  <li>Intimate or sanitary products</li>
                  <li>Products damaged due to misuse</li>
                  <li>Items purchased during clearance sales (unless defective)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-valentine-red" />
              <h2 className="text-2xl font-bold text-valentine-red">3. Refund Process</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">3.1 Refund Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-valentine-red text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <p className="font-semibold">Request Submission</p>
                      <p className="text-sm">Submit return/refund request within 7 days of delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-valentine-red text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <p className="font-semibold">Verification (2-3 business days)</p>
                      <p className="text-sm">Our team reviews your request and may contact you for details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-valentine-red text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <p className="font-semibold">Product Return (if applicable)</p>
                      <p className="text-sm">Ship the product back to us (pickup may be arranged)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-valentine-red text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                    <div>
                      <p className="font-semibold">Quality Check (1-2 business days)</p>
                      <p className="text-sm">We inspect the returned product</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-valentine-red text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                    <div>
                      <p className="font-semibold">Refund Initiation (5-7 business days)</p>
                      <p className="text-sm">Refund processed to original payment method</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3.2 Refund Method</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Refunds will be credited to the original payment method</li>
                  <li>Credit/Debit Card: 5-7 business days</li>
                  <li>UPI/Net Banking: 3-5 business days</li>
                  <li>Wallet: 2-3 business days</li>
                </ul>
                <p className="mt-2 text-sm italic">Note: Bank processing times may vary and are beyond our control.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3.3 Partial Refunds</h3>
                <p className="mb-2">Partial refunds may be issued for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Products with minor defects (if customer agrees to keep)</li>
                  <li>Products returned without original packaging</li>
                  <li>Products showing signs of use</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Service Cancellation */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">4. Service Cancellation & Refund</h2>
            <div className="space-y-4 text-gray-700">
              <p>For photography, videography, and decoration services:</p>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold">More than 15 days before event: 100% refund</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="font-semibold">7-15 days before event: 50% refund</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="font-semibold">3-7 days before event: 25% refund</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold">Less than 3 days before event: No refund</p>
                </div>
              </div>
              <p className="text-sm italic mt-3">
                Refunds will be processed within 10-15 business days after cancellation.
              </p>
            </div>
          </section>

          {/* Exchange Policy */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">5. Exchange Policy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We offer exchanges for defective or wrong products within 7 days of delivery. Exchange is subject to product availability.
              </p>
              <p>
                If the desired product is unavailable, we will process a full refund or offer store credit.
              </p>
            </div>
          </section>

          {/* How to Request */}
          <section>
            <h2 className="text-2xl font-bold text-valentine-red mb-4">6. How to Request Refund/Cancellation</h2>
            <div className="space-y-3 text-gray-700">
              <p>To request a refund or cancellation:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Login to your account and go to "My Orders"</li>
                <li>Select the order you want to cancel/return</li>
                <li>Click on "Request Cancellation" or "Request Return"</li>
                <li>Provide reason and upload images (if applicable)</li>
                <li>Submit the request</li>
              </ol>
              <p className="mt-4">Alternatively, contact us directly:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email: <a href="mailto:dwarakamaiphotoplanet9@gmail.com" className="text-valentine-red hover:underline">dwarakamaiphotoplanet9@gmail.com</a></li>
                <li>Phone: <a href="tel:+919492686421" className="text-valentine-red hover:underline">+91 94926 86421</a></li>
                <li>WhatsApp: <a href="https://wa.me/919492686421" className="text-valentine-red hover:underline">+91 94926 86421</a></li>
              </ul>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-valentine-red mb-4">Important Notes</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Shipping charges are non-refundable (except in case of defective/wrong products)</li>
              <li>Return shipping costs are borne by the customer (unless product is defective)</li>
              <li>Refund requests must include order ID and reason</li>
              <li>We reserve the right to reject refund requests that don't meet our policy criteria</li>
              <li>This policy does not affect your statutory rights</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-valentine-pink/10 rounded-lg p-6 border border-valentine-pink/20">
            <h2 className="text-2xl font-bold text-valentine-red mb-4">Questions?</h2>
            <div className="text-gray-700 space-y-2">
              <p>If you have questions about our Refund & Cancellation Policy, please contact us:</p>
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

export default RefundPolicyPage;
