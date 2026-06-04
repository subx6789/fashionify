import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Sparkles, Truck, Users, ChevronDown, ChevronUp } from "lucide-react";

// Custom FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/50">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left bg-card hover:bg-muted/30 transition-colors"
      >
        <span className="font-semibold text-foreground">{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-card"
          >
            <div className="p-4 pt-0 text-muted-foreground leading-relaxed border-t border-border mt-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingAbout() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqs = [
    {
      question: "What makes Fashionify different from other fashion retailers?",
      answer: "We focus heavily on curating pieces that aren't just trendy, but also sustainably sourced and ethically manufactured. Our quality control ensures every fabric and stitch meets our high 'industrial-grade' standards."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship domestically. However, we are rapidly expanding our supply chain and plan to offer international shipping to select countries very soon!"
    },
    {
      question: "What is your return and exchange policy?",
      answer: "We offer a hassle-free 30-day return policy. If the fit isn't perfect or you simply change your mind, you can return or exchange the item for free, provided it is unused and in its original packaging."
    },
    {
      question: "Are your premium gift wrapping options customizable?",
      answer: "Yes! When you select premium gift wrapping at checkout, you can add a personalized note. Our team carefully wraps your items in luxury eco-friendly packaging."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl space-y-24">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-extrabold dark:text-gradient tracking-tight"
        >
          Our Story
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Fashionify was born out of a rebellion against fast fashion. We believe that true style shouldn't come at the expense of quality, comfort, or the environment. Our founders set out to bridge the gap between high-end luxury boutiques and accessible online retail.
          </p>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Today, we are proud to serve a community of individuals who express themselves boldly through what they wear. Every collection is a testament to our dedication to craftsmanship and modern aesthetics.
          </p>
        </motion.div>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-muted/20 p-8 md:p-12 rounded-3xl border border-border">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight dark:text-gradient">Why Choose Fashionify?</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We don't just sell clothes; we provide a curated lifestyle experience. Our styling experts work around the clock to source the finest materials from trusted global artisans.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you are upgrading your daily streetwear, seeking the perfect statement piece for an evening gala, or stepping out in comfortable yet stylish footwear, our platform guarantees an industrial-grade shopping experience with enterprise-level customer support.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Sparkles,
              title: "Exclusive Designs",
              desc: "Uniquely curated apparel that ensures you stand out from the crowd.",
            },
            {
              icon: ShieldCheck,
              title: "Premium Quality",
              desc: "Strictly vetted high-grade fabrics that withstand the test of time.",
            },
            {
              icon: Truck,
              title: "Express Shipping",
              desc: "Industry-leading fulfillment speeds to get your gear to you fast.",
            },
            {
              icon: Users,
              title: "Happy Customers",
              desc: "Over 50,000+ satisfied shoppers trust our impeccable service.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="card-gradient card-gradient-hover border-t-2 border-primary-border overflow-hidden h-full">
                <CardContent className="flex flex-col items-center text-center p-6 space-y-3 h-full">
                  <div className="p-3 rounded-full bg-gradient-brand text-primary-foreground text-primary-foreground shadow-md shadow-primary/20">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight dark:text-gradient">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">Got questions? We've got answers.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaqIndex === index}
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default ShoppingAbout;
