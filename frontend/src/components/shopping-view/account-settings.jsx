import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updatePassword, updateProfile, deleteAccount, logoutUser } from "@/store/auth-slice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Lock, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

function AccountSettings({ onBackToProfile, hideHeader }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    userName: user?.userName || "",
    gender: user?.gender || "",
    avatar: user?.avatar || ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const result = await dispatch(updateProfile(profileData));
    if (result?.payload?.success) {
      toast({ title: "Profile Updated", description: "Your username has been updated successfully." });
    } else {
      toast({ title: "Error", description: result?.payload?.message || "Failed to update profile", variant: "destructive" });
    }
    setIsUpdatingProfile(false);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    const result = await dispatch(deleteAccount());
    if (result?.payload?.success) {
      toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
      dispatch(logoutUser());
    } else {
      toast({ title: "Error", description: result?.payload?.message || "Failed to delete account", variant: "destructive" });
    }
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Account Settings</h2>
          {onBackToProfile && (
            <Button variant="outline" onClick={onBackToProfile} className="gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Button>
          )}
        </div>
      )}

      {/* Profile Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-gradient border-t-2 border-primary overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Profile Details</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.userName}
                    onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-start pt-4">
                <Button type="submit" disabled={isUpdatingProfile} className="rounded-xl font-bold px-8">
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
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
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
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
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
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

      {/* Danger Zone Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-red-500/5 border border-red-500/20 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-red-500">Danger Zone</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground max-w-xl">
                Permanently delete your account and all of your data. This action cannot be undone. 
                All your orders, addresses, wishlist items, and reviews will be permanently removed.
              </p>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-xl font-bold px-6">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Yes, Delete My Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default AccountSettings;
