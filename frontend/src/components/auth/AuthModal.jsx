import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, HousePlug, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";
import { useToast } from "@/components/ui/use-toast";
import { loginUser, registerUser, adminLoginUser, verifyRegisterOtp } from "@/store/auth-slice";
import { KeyRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/* ─── Password strength ────────────────────────────────────────────────── */
const PASSWORD_RULES = [
  { label: "8+ characters",       test: (p) => p.length >= 8 },
  { label: "Uppercase (A-Z)",     test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase (a-z)",     test: (p) => /[a-z]/.test(p) },
  { label: "Number (0-9)",        test: (p) => /[0-9]/.test(p) },
  { label: "Special character",   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-red-500", "bg-red-400", "bg-amber-500", "bg-yellow-400", "bg-green-500"];
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? colors[passed - 1] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-bold ${passed === 5 ? "text-green-500" : "text-muted-foreground"}`}>
        {labels[passed - 1] || "Too weak"}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1 text-[11px]">
              {ok
                ? <CheckCircle2 className="h-3 w-3 text-green-500 flex-none" />
                : <XCircle className="h-3 w-3 text-muted-foreground/40 flex-none" />
              }
              <span className={ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Login Form ───────────────────────────────────────────────────────── */
function LoginForm({ onSwitchToRegister, onClose }) {
  const [formData, setFormData]       = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch                      = useDispatch();
  const { toast }                     = useToast();
  const { isLoading }                 = useSelector((state) => state.auth);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (result?.payload?.success) {
      toast({ title: result.payload.message || "Welcome back!" });
      onClose();
    } else {
      toast({
        title: result?.payload?.message || "Login failed. Check your credentials.",
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="modal-email">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="neu-input w-full pl-10"
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="modal-password">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="neu-input w-full pl-10 pr-10"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="neu-btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in…" : (
          <>Sign In <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <p className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-bold text-primary hover:underline underline-offset-4"
        >
          Create Account
        </button>
      </p>
    </form>
  );
}

/* ─── Register Form ────────────────────────────────────────────────────── */
function RegisterForm({ onSwitchToLogin, onClose }) {
  const [step, setStep]                         = useState(1);
  const [formData, setFormData]                 = useState({ userName: "", email: "", password: "", dateOfBirth: "", gender: "" });
  const [otp, setOtp]                           = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showStrength, setShowStrength]         = useState(false);
  const dispatch                                = useDispatch();
  const { toast }                               = useToast();
  const { isLoading }                           = useSelector((state) => state.auth);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(formData.password));

  async function handleInitiate(e) {
    e.preventDefault();
    if (!allRulesPassed) {
      toast({ title: "Password doesn't meet requirements.", variant: "destructive" });
      setShowStrength(true);
      return;
    }
    if (!formData.dateOfBirth) {
      toast({ title: "Please select your date of birth.", variant: "destructive" });
      return;
    }
    if (!formData.gender) {
      toast({ title: "Please select your gender.", variant: "destructive" });
      return;
    }
    
    const result = await dispatch(registerUser(formData));
    if (result?.payload?.success) {
      toast({ title: result.payload.message || "OTP Sent to your email." });
      setStep(2);
    } else {
      toast({
        title: result?.payload?.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!otp || otp.length !== 4) {
      toast({ title: "Please enter a valid 4-digit OTP.", variant: "destructive" });
      return;
    }
    const result = await dispatch(verifyRegisterOtp({ email: formData.email, otp }));
    if (result?.payload?.success) {
      toast({ title: result.payload.message || "Account created successfully! Please sign in." });
      onSwitchToLogin();
    } else {
      toast({
        title: result?.payload?.message || "Verification failed. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (step === 2) {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">We've sent a 4-digit code to</p>
          <p className="font-bold">{formData.email}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-foreground" htmlFor="modal-otp">
            Verification Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="modal-otp"
              type="text"
              maxLength={4}
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="neu-input w-full pl-10 tracking-widest font-mono text-center"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="neu-btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying…" : (
            <>Verify Account <CheckCircle2 className="h-4 w-4 ml-2 inline" /></>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full text-sm text-center text-muted-foreground font-bold hover:text-primary transition-colors mt-2"
        >
          Go Back
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleInitiate} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="modal-name">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-name"
            type="text"
            placeholder="Your name (min 4 characters)"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            className="neu-input w-full pl-10"
            required
            autoComplete="name"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-end">
          <label className="text-sm font-bold text-foreground" htmlFor="modal-reg-email">
            Email Address
          </label>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded">Cannot be changed later</span>
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-reg-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="neu-input w-full pl-10"
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="modal-reg-password">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setShowStrength(true);
            }}
            onFocus={() => setShowStrength(true)}
            className="neu-input w-full pl-10 pr-10"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showStrength && <PasswordStrength password={formData.password} />}
      </div>

      {/* DOB and Gender Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date of Birth */}
        <div className="space-y-1.5 flex flex-col">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-foreground" htmlFor="modal-dob">Date of Birth</label>
          </div>
          <input
            id="modal-dob"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="neu-input w-full h-[42px] px-3 font-medium bg-background text-foreground uppercase-date-icon"
            required
          />
          <span className="text-[10px] text-red-500 font-bold tracking-wider leading-tight">Cannot be changed later</span>
        </div>

        {/* Gender */}
        <div className="space-y-1.5 flex flex-col">
          <label className="text-sm font-bold text-foreground">Gender</label>
          <Select onValueChange={(val) => setFormData({ ...formData, gender: val })}>
            <SelectTrigger className="w-full neu-input border-2 border-border h-[42px] bg-background">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="neu-btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? "Processing…" : (
          <>Continue <ArrowRight className="h-4 w-4 ml-2 inline" /></>
        )}
      </button>

      <p className="text-sm text-center text-muted-foreground pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-primary hover:underline underline-offset-4"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}

/* ─── Admin Login Form ─────────────────────────────────────────────────── */
function AdminLoginForm({ onClose }) {
  const [formData, setFormData]       = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch                      = useDispatch();
  const { toast }                     = useToast();
  const { isLoading }                 = useSelector((state) => state.auth);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(adminLoginUser(formData));
    if (result?.payload?.success) {
      toast({ title: "Admin login successful. Welcome back!" });
      onClose();
    } else {
      toast({
        title: result?.payload?.message || "Login failed. Check your credentials.",
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="modal-admin-email">
          Admin Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-admin-email"
            type="email"
            placeholder="admin@fashionify.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="neu-input w-full pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-foreground" htmlFor="modal-admin-password">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="modal-admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter admin password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="neu-input w-full pl-10 pr-10"
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

      <button
        type="submit"
        disabled={isLoading}
        className="neu-btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? "Authenticating…" : (
          <>Access Dashboard <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  );
}

/* ─── Auth Modal Root ──────────────────────────────────────────────────── */
export default function AuthModal() {
  const { isOpen, mode, closeAuthModal, switchMode } = useAuthModal();

  const isLogin = mode === "login";
  const isAdmin = mode === "admin";
  
  let title = "Welcome Back";
  let subtitle = "Sign in to access your wishlist, orders & more.";
  
  if (isAdmin) {
    title = "Admin Portal";
    subtitle = "Sign in with your administrator credentials.";
  } else if (!isLogin) {
    title = "Create Account";
    subtitle = "Join Fashionify for exclusive deals and a premium experience.";
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="neu-modal max-w-[440px] p-0 overflow-hidden [&>button]:hidden gap-0 bg-card outline-none border-2 border-border">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b-2 border-border">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-border rounded-sm bg-primary text-primary-foreground"
                   style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}>
                <HousePlug className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[260px]">
                  {subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              className="p-1.5 border-2 border-border rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close dialog"
              style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex mt-4 border-2 border-border rounded-sm overflow-hidden"
               style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}>
            {["login", "register", "admin"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-xs font-bold transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {m === "login" ? "Sign In" : m === "register" ? "Sign Up" : "Admin"}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
              transition={{ duration: 0.18 }}
            >
              {isLogin && (
                <LoginForm
                  onSwitchToRegister={() => switchMode("register")}
                  onClose={closeAuthModal}
                />
              )}
              {mode === "register" && (
                <RegisterForm
                  onSwitchToLogin={() => switchMode("login")}
                  onClose={closeAuthModal}
                />
              )}
              {isAdmin && (
                <AdminLoginForm onClose={closeAuthModal} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
