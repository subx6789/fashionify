import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAvatar, updatePreferences, updatePassword } from "@/store/auth-slice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Settings, User, Shirt, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function UserProfile() {
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [avatarSeed, setAvatarSeed] = useState(user?.avatar || user?.userName || "Fashion");

  // Preferences State
  const [preferences, setPreferences] = useState({
    topSize: user?.topSize || "M",
    bottomSize: user?.bottomSize || "32",
    shoeSize: user?.shoeSize || "10",
    style: user?.preferredStyle || "Streetwear",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  function handleGenerateNewAvatar() {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
    dispatch(setAvatar(randomSeed));
    toast({
      title: "Avatar Generated!",
      description: "A new fresh look has been applied to your profile and navbar.",
    });
  }

  async function handleSavePreferences(e) {
    e.preventDefault();
    const result = await dispatch(updatePreferences({
      topSize: preferences.topSize,
      bottomSize: preferences.bottomSize,
      shoeSize: preferences.shoeSize,
      preferredStyle: preferences.style
    }));

    if (result?.payload?.success) {
      toast({
        title: "Preferences Saved",
        description: "Your fashion profile has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result?.payload?.message || "Failed to save preferences",
        variant: "destructive"
      });
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setIsUpdatingPassword(true);
    const result = await dispatch(updatePassword(passwordData));
    
    if (result?.payload?.success) {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordData({ oldPassword: "", newPassword: "" });
    } else {
      toast({
        title: "Update Failed",
        description: result?.payload?.message || "Failed to update password",
        variant: "destructive"
      });
    }
    setIsUpdatingPassword(false);
  }

  return (
    <div className="space-y-8">
      {/* Profile Header & Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-inner"
      >
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl shadow-primary/20 bg-background">
            <img
              src={`https://api.dicebear.com/9.x/micah/svg?seed=${avatarSeed}&backgroundColor=transparent`}
              alt="Avatar"
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <button
            onClick={handleGenerateNewAvatar}
            className="absolute bottom-0 right-0 p-2 bg-gradient-brand text-primary-foreground text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Generate Random Avatar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-center md:text-left flex-1">
          <h2 className="text-3xl font-extrabold text-gradient">{user?.userName}</h2>
          <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
            <User className="w-4 h-4" /> {user?.email}
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary dark:text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            {user?.role} Member
          </div>
        </div>

        <div className="hidden md:block">
           <Button variant="outline" className="gap-2 rounded-xl border-primary-border/20 hover:bg-primary/10">
             <Settings className="w-4 h-4" /> Account Settings
           </Button>
        </div>
      </motion.div>

      {/* Fashion Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-gradient border-t-2 border-primary-border overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Shirt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">My Fashion Preferences</h3>
            </div>
            
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Top Size</label>
                  <select 
                    value={preferences.topSize}
                    onChange={(e) => setPreferences({...preferences, topSize: e.target.value})}
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Bottom Size</label>
                  <select 
                    value={preferences.bottomSize}
                    onChange={(e) => setPreferences({...preferences, bottomSize: e.target.value})}
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="28">28</option>
                    <option value="30">30</option>
                    <option value="32">32</option>
                    <option value="34">34</option>
                    <option value="36">36</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Shoe Size (US)</label>
                  <select 
                    value={preferences.shoeSize}
                    onChange={(e) => setPreferences({...preferences, shoeSize: e.target.value})}
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Preferred Style</label>
                  <select 
                    value={preferences.style}
                    onChange={(e) => setPreferences({...preferences, style: e.target.value})}
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Formal">Formal</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button type="submit" disabled={isLoading} className="bg-gradient-premium bg-gradient-premium-hover rounded-xl text-primary-foreground font-bold px-8">
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="card-gradient border-t-2 border-t-red-500/30 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Security & Password</h3>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Current Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    placeholder="Enter current password"
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password (min 8 chars, 1 uppercase, 1 symbol)"
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters and include uppercase, lowercase, number, and special character.</p>
                </div>
              </div>

              <div className="flex justify-start pt-4">
                <Button type="submit" disabled={isUpdatingPassword} className="bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold px-8 transition-colors">
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default UserProfile;
