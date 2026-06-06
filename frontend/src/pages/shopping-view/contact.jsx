import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 98765 43210",
    sub: "24 x 7",
  },
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@fashionify.com",
    sub: "Response within 24 hours",
  },
  {
    icon: MapPin,
    title: "Head Office",
    detail: "Sector V",
    sub: "Salt Lake, Kolkata 700091",
  },
];

function ShoppingContact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        (import.meta.env.VITE_API_URL || "") + "/api/contact",
        formData
      );
      if (res.data?.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We will get back to you shortly.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({
          title: "Error",
          description: res.data?.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to send",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold tracking-tight"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg"
        >
          Have questions about our collections or need help with an order? Our boutique support team is here to help.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info cards */}
        <div className="lg:col-span-1 space-y-5">
          {CONTACT_INFO.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                className="border-2 border-border bg-card p-5 flex items-start gap-4 rounded-sm"
                style={{ boxShadow: "3px 3px 0px 0px hsl(var(--neu-black))" }}
              >
                {/* Icon box */}
                <div
                  className="flex-shrink-0 p-2.5 border-2 border-border bg-primary rounded-sm"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-black text-base mb-0.5">{item.title}</h3>
                  <p className="font-bold text-foreground/90 text-sm">{item.detail}</p>
                  <span className="text-xs text-muted-foreground">{item.sub}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="border-2 border-border bg-card rounded-sm p-8"
              style={{ boxShadow: "4px 4px 0px 0px hsl(var(--neu-black))" }}
            >
              {/* Form header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 border-2 border-border bg-primary rounded-sm"
                  style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                >
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-black">Send a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-black text-foreground" htmlFor="contact-name">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="flex h-11 w-full border-2 border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                      style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-black text-foreground" htmlFor="contact-email">
                      Your Email
                    </label>
                    <input
                      id="contact-email"
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="flex h-11 w-full border-2 border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                      style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-black text-foreground" htmlFor="contact-subject">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    required
                    type="text"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="flex h-11 w-full border-2 border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                    style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-black text-foreground" htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Write your query here…"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="flex w-full border-2 border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none rounded-sm"
                    style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="neu-btn-primary h-12 px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    "Sending…"
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingContact;
