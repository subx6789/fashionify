import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAvatar } from "@/store/auth-slice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Settings, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function UserProfile() {
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [avatarSeed, setAvatarSeed] = useState(user?.avatar || user?.userName || "Fashion");



  function handleGenerateNewAvatar() {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
    dispatch(setAvatar(randomSeed));
    toast({
      title: "Avatar Generated!",
      description: "A new fresh look has been applied to your profile and navbar.",
    });
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

      </motion.div>


    </div>
  );
}

export default UserProfile;
