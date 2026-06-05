import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

function ShoppingFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const res = await axios.post((import.meta.env.VITE_API_URL || "") + "/api/newsletter/subscribe", { email });
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

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="group">
              <BrandLogo showText={true} textClassName="text-xl" />
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Your one-stop destination for premium fashion and accessories. Dress better, feel better.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <Link
                  key={i}
                  to={href}
                  className="p-2 border-2 border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
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
              {["Customer Service", "Returns & Exchanges", "Shipping Information", "Track Order"].map((item) => (
                <li key={item}>
                  <Link to="#" className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-black mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <Link to="#" className="hover:text-primary font-body font-medium transition-colors hover:underline underline-offset-4">
                    {item}
                  </Link>
                </li>
              ))}
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
    </footer>
  );
}

export default ShoppingFooter;
