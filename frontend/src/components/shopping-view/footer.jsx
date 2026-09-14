/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: footer.jsx
 * Purpose: Feature-specific React component to encapsulate UI logic.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { subscribeNewsletter } from "@/services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MODAL_DATA = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-4 text-sm text-foreground/90 font-body leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Effective Date: January 1, 2026</p>
        <p>At Fashionify, we prioritize your privacy and are committed to safeguarding your personal data.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">1. Information We Collect</h4>
        <p>We collect information you provide directly to us when creating an account, browsing our catalog, placing orders, or subscribing to our newsletter (e.g. name, email address, shipping address, contact number).</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">2. How We Use Your Information</h4>
        <p>We use your information to process transactions, deliver orders, send updates regarding your delivery, prevent fraud, and provide customized style recommendations.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">3. Data Security & Third Parties</h4>
        <p>Your payment data is securely processed via certified gateways (e.g., Razorpay) with bank-grade encryption. We never sell or rent your personal information to third parties.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">4. Your Rights</h4>
        <p>You have the right to access, update, or request deletion of your personal account details at any time by contacting our support team or navigating to your Account settings.</p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    content: (
      <div className="space-y-4 text-sm text-foreground/90 font-body leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Last Updated: January 1, 2026</p>
        <p>Welcome to Fashionify. By accessing or using our website, you agree to be bound by the following terms.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">1. Account Responsibilities</h4>
        <p>You are responsible for maintaining the confidentiality of your account credentials and password. Any actions taken under your credentials remain your responsibility.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">2. Orders and Pricing</h4>
        <p>All orders are subject to acceptance and item availability. We reserve the right to correct pricing or typographical errors and cancel orders placed with incorrect amounts.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">3. Intellectual Property</h4>
        <p>All content, designs, logos, graphics, and apparel images are the property of Fashionify and protected by copyright and intellectual property laws.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">4. Limitation of Liability</h4>
        <p>Fashionify shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our platform or purchased apparel.</p>
      </div>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    content: (
      <div className="space-y-4 text-sm text-foreground/90 font-body leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Cookie & Tracking Notice</p>
        <p>Fashionify uses cookies and similar storage technologies to optimize your browsing journey and analyze site traffic.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">1. Essential Cookies</h4>
        <p>Required for basic functions such as user authentication, security validation, and keeping items in your shopping bag as you browse across pages.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">2. Preference Cookies</h4>
        <p>Remember your preferences such as dark mode/light mode themes and custom filtering preferences.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">3. Analytics & Performance</h4>
        <p>Help us identify popular collections, top-selling categories, and page loading speeds to continuously improve our store experience.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">4. Managing Cookies</h4>
        <p>You can adjust cookie settings via your browser preferences anytime. Disabling essential cookies may impact store checkout functionality.</p>
      </div>
    ),
  },
  customerService: {
    title: "Customer Service",
    content: (
      <div className="space-y-4 text-sm text-foreground/90 font-body leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p>Need assistance with sizing, orders, or styling advice? Our customer support team is available 7 days a week.</p>
        <div className="p-4 border-2 border-border bg-muted/30 rounded-sm space-y-2">
          <p className="font-bold text-foreground">📧 Email Support:</p>
          <p className="text-muted-foreground">support@fashionify.com (Response within 24 hours)</p>
          <p className="font-bold text-foreground mt-3">📞 Phone Support:</p>
          <p className="text-muted-foreground">+91 (800) 123-4567 (Mon–Sat, 9:00 AM – 7:00 PM IST)</p>
          <p className="font-bold text-foreground mt-3">💬 Live Assistance:</p>
          <p className="text-muted-foreground">Visit our Contact page to send a direct message to our support agents.</p>
        </div>
      </div>
    ),
  },
  returns: {
    title: "Returns & Exchanges",
    content: (
      <div className="space-y-4 text-sm text-foreground/90 font-body leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p>We want you to love what you wear. If the fit isn't right, returns and exchanges are simple and hassle-free.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">1. 14-Day Return Window</h4>
        <p>Items can be returned or exchanged within 14 calendar days from the date of package delivery.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">2. Condition of Items</h4>
        <p>Garments must be unworn, unwashed, with all original tags attached and packaging intact.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">3. Refund Timeline</h4>
        <p>Refunds are initiated within 48 hours of item receipt and inspection. Funds appear in original payment method within 5–7 business days.</p>
      </div>
    ),
  },
  shipping: {
    title: "Shipping Information",
    content: (
      <div className="space-y-4 text-sm text-foreground/90 font-body leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p>Fast, reliable delivery straight to your doorstep with end-to-end tracking.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">1. Standard Shipping</h4>
        <p>Delivered within 3–5 business days. Free shipping on all orders over ₹999.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">2. Express Delivery</h4>
        <p>Guaranteed 1–2 business day delivery available for select metropolitan areas during checkout.</p>
        <h4 className="font-heading font-bold text-base text-foreground mt-4">3. Order Tracking</h4>
        <p>Once dispatched, you will receive real-time courier tracking details via email and in your Account Orders dashboard.</p>
      </div>
    ),
  },
};

function ShoppingFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const { toast } = useToast();

  const openModal = (key) => {
    setActiveModal(key);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const res = await subscribeNewsletter({ email });
      if (res.data.success) {
        toast({ title: "Success", description: res.data.message });
        setEmail("");
      } else {
        toast({ title: "Error", description: res.data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to subscribe. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-background border-t-2 border-border">
      {/* Accent bar */}
      <div className="h-1 w-full bg-primary" />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand — spans 2 cols on tablet */}
          <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="group">
              <BrandLogo showText={true} textClassName="text-xl" />
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Your one-stop destination for premium fashion and accessories. Dress better, feel better.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }, i) => (
                <Link
                  key={i}
                  to={href}
                  className="p-2 border-2 border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-heading font-black mb-4 uppercase tracking-wider text-sm">Shop</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { label: "Men's Clothing", to: "/shop/listing?category=men" },
                { label: "Women's Clothing", to: "/shop/listing?category=women" },
                { label: "Kids", to: "/shop/listing?category=kids" },
                { label: "Accessories", to: "/shop/listing?category=accessories" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-heading font-black mb-4 uppercase tracking-wider text-sm">Help</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => openModal("customerService")}
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4 text-left cursor-pointer bg-transparent border-none p-0"
                >
                  Customer Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("returns")}
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4 text-left cursor-pointer bg-transparent border-none p-0"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("shipping")}
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4 text-left cursor-pointer bg-transparent border-none p-0"
                >
                  Shipping Information
                </button>
              </li>
              <li>
                <Link
                  to="/shop/account"
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-black mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => openModal("privacy")}
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4 text-left cursor-pointer bg-transparent border-none p-0"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("terms")}
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4 text-left cursor-pointer bg-transparent border-none p-0"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("cookies")}
                  className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4 text-left cursor-pointer bg-transparent border-none p-0"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-black mb-4 uppercase tracking-wider text-sm">Newsletter</h3>
            <p className="text-sm text-muted-foreground font-body mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background border-2 border-border p-2 text-sm focus:outline-none focus:border-primary font-body"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground p-2 border-2 border-primary hover:bg-background hover:text-primary transition-colors disabled:opacity-50"
                aria-label="Subscribe to newsletter"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-body">&copy; {new Date().getFullYear()} Fashionify. All rights reserved.</p>
          <p className="font-body text-xs">Built with ❤️ for fashion lovers</p>
        </div>
      </div>

      {/* Info & Legal Dialog */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-lg border-2 border-border bg-card p-6 shadow-[6px_6px_0px_0px_hsl(var(--neu-black))] max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b-2 border-border pb-3">
            <DialogTitle className="font-heading font-black text-xl tracking-tight">
              {activeModal && MODAL_DATA[activeModal]?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-body">
              Fashionify Policy & Information Guide
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-2">
            {activeModal && MODAL_DATA[activeModal]?.content}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

export default ShoppingFooter;

