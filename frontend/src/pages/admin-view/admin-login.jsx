import { useToast } from "@/components/ui/use-toast";
import { adminLoginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const initialState = { email: "", password: "" };

function AdminLogin() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isLoading } = useSelector((state) => state.auth);

  function onSubmit(event) {
    event.preventDefault();
    dispatch(adminLoginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Admin login successful. Welcome back!" });
      } else {
        toast({
          title: data?.payload?.message || "Login failed. Please check your credentials.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-md space-y-6 card-gradient p-8 rounded-2xl shadow-xl border-t-4 border-primary-border"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-xl bg-gradient-brand text-primary-foreground text-primary-foreground shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in with your administrator credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="admin-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@fashionify.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-brand text-primary-foreground hover:from-primary hover:to-primary-dark border-0 text-primary-foreground rounded-xl py-6 font-bold shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {isLoading ? "Authenticating…" : "Access Dashboard"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Regular customers?{" "}
          <a href="/auth/login" className="text-primary hover:underline font-medium">
            Use Customer Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
