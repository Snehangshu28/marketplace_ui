import { useState } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';

export default function PaymentPage() {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();

  const handlePayment = () => {
    setTimeout(() => {
      setPaymentComplete(true);
    }, 1500);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="p-12 text-center rounded-2xl">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-foreground mb-8">
              Your collaboration request has been sent. The talent will be notified and can review
              your proposal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635]"
              >
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/chat')}>
                View Messages
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-primary">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p className="text-primary">
                    Your payment information is encrypted and secure. We never store your card
                    details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 rounded-2xl sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1615843644216-14d9b92a02ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                    alt="Talent"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <div className="font-medium">Sarah Johnson</div>
                    <div className="text-sm text-foreground">Influencer Collaboration</div>
                    <div className="text-sm text-foreground">Campaign: Summer Launch</div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground">Collaboration Fee</span>
                  <span className="font-medium">$5,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Platform Fee (5%)</span>
                  <span className="font-medium">$250.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Processing Fee</span>
                  <span className="font-medium">$50.00</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">$5,300.00</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635] mt-6"
                size="lg"
              >
                Proceed to Payment
              </Button>

              <p className="text-xs text-foreground text-center mt-4">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
