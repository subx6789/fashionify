/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: account.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 2
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import React, { useState } from "react";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import UserProfile from "@/components/shopping-view/user-profile";
import AccountSettings from "@/components/shopping-view/account-settings";
import { User, MapPin, ShoppingBag, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CollapsibleSection({ title, icon, isOpen, onClick, children }) {
  return (
    <div className="border border-primary/20 rounded-2xl bg-card overflow-hidden shadow-sm">
      <button 
        onClick={onClick} 
        className="w-full flex items-center justify-between p-6 bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-6 h-6 text-muted-foreground" /> : <ChevronDown className="w-6 h-6 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-primary/10"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingAccount() {
  const [openSection, setOpenSection] = useState("orders");

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <div className="relative h-[350px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
          alt="Account Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 tracking-tight">My Account</h1>
          <p className="text-muted-foreground font-medium">Manage your profile, orders, and addresses.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 py-8 -mt-6 relative z-10 max-w-6xl">
        <div className="flex flex-col rounded-3xl border border-primary/10 bg-background/95 backdrop-blur-3xl p-6 md:p-10 shadow-2xl shadow-primary/5 space-y-8">
          
          <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <UserProfile />
            
            <div className="space-y-6">
              <CollapsibleSection 
                title="Account Settings" 
                icon={<Settings className="w-6 h-6" />} 
                isOpen={openSection === "settings"} 
                onClick={() => setOpenSection(openSection === "settings" ? null : "settings")}
              >
                <div className="-mt-8">
                  <AccountSettings hideHeader={true} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="My Orders" 
                icon={<ShoppingBag className="w-6 h-6" />} 
                isOpen={openSection === "orders"} 
                onClick={() => setOpenSection(openSection === "orders" ? null : "orders")}
              >
                <ShoppingOrders />
              </CollapsibleSection>

              <CollapsibleSection 
                title="My Addresses" 
                icon={<MapPin className="w-6 h-6" />} 
                isOpen={openSection === "address"} 
                onClick={() => setOpenSection(openSection === "address" ? null : "address")}
              >
                <Address />
              </CollapsibleSection>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
