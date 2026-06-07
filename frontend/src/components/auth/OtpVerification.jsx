import { useState, useRef, useEffect } from "react";
import { initiateSignup, verifyOtp } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, Mail, ArrowRight } from "lucide-react";

/**
 * OtpVerification — two-step signup component.
 *
 * Step 1: collect name, email, password → POST /api/auth/signup/initiate
 * Step 2: enter 6-digit OTP            → POST /api/auth/signup/verify
 *
 * Fully self-contained; uses CSS variables from index.css for all colours/shadows.
 */
function OtpVerification() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]         = useState(1); // 1 = signup form, 2 = otp form, 3 = success
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [countdown, setCountdown] = useState(0); // resend cooldown

  // Step 1 form
  const [form, setForm] = useState({ userName: "", email: "", password: "" });

  // Step 2 OTP — split into 6 individual cells
  const [otp, setOtp]     = useState(["", "", "", "", "", ""]);
  const otpRefs           = useRef([]);

  // ── Countdown timer for resend ─────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1_000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleFormChange(e) {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleOtpInput(e, idx) {
    setError("");
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  // Step 1 submit
  async function handleInitiate(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await initiateSignup(form);
      if (data.success) {
        setStep(2);
        setCountdown(60);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Failed to send OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    if (countdown > 0) return;
    setError("");
    setBusy(true);
    try {
      const { data } = await initiateSignup(form);
      if (data.success) {
        setOtp(["", "", "", "", "", ""]);
        setCountdown(60);
      } else {
        setError(data.message || "Could not resend OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error resending OTP.");
    } finally {
      setBusy(false);
    }
  }

  // Step 2 submit
  async function handleVerify(e) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { data } = await verifyOtp({ email: form.email, otp: otpString });
      if (data.success) {
        setStep(3);
        setTimeout(() => navigate("/login"), 2_500);
      } else {
        setError(data.message || "Verification failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // ── Shared style primitives ────────────────────────────────────────────────
  const inputCls = `
    w-full px-4 py-3
    text-sm font-medium text-black bg-white
    border-2 border-black rounded-none
    placeholder:text-gray-400
    focus:outline-none focus:border-[var(--color-acid-green)]
    transition-colors duration-100
  `;

  const primaryBtnCls = `
    w-full py-3.5 text-sm font-black tracking-wide
    bg-[var(--color-acid-green)] text-[var(--color-black)]
    border-2 border-black rounded-none
    inline-flex items-center justify-center gap-2
    hover:bg-[var(--color-black)] hover:text-[var(--color-acid-green)]
    active:translate-x-[2px] active:translate-y-[2px]
    transition-all duration-100
    disabled:opacity-50 disabled:pointer-events-none
  `;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-off-white)] p-4">
      <div
        className="w-full max-w-sm bg-white border-[3px] border-black p-8 flex flex-col gap-6"
        style={{ boxShadow: "var(--shadow-neubrutal-xl)" }}
      >

        {/* ── Logo / Brand ──────────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-black">
            FASHION
            <span className="inline-block px-1 bg-[var(--color-acid-green)] ml-0.5">IFY</span>
          </h1>
          <div className="w-full h-[3px] bg-black mt-2" />
        </div>

        {/* ── Step 1: Signup Form ───────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div>
              <p className="font-black text-xl text-black">Create account</p>
              <p className="text-sm text-gray-500 mt-0.5">We'll send a code to verify your email.</p>
            </div>

            <form onSubmit={handleInitiate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Username
                </label>
                <input
                  name="userName"
                  value={form.userName}
                  onChange={handleFormChange}
                  placeholder="johndoe"
                  required
                  autoComplete="username"
                  className={inputCls}
                  style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={inputCls}
                  style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputCls}
                  style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-300 px-3 py-2 rounded-none">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={primaryBtnCls}
                style={{ boxShadow: "var(--shadow-neubrutal)" }}
              >
                {busy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</>
                ) : (
                  <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: OTP Input ─────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex-none flex items-center justify-center border-2 border-black"
                style={{ background: "var(--color-acid-green)" }}
              >
                <Mail className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="font-black text-lg text-black leading-tight">Check your email</p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">{form.email}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Enter the <strong>6-digit code</strong> we sent. It expires in 5 minutes.
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              {/* OTP cell grid */}
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="
                      w-11 h-14 text-center text-xl font-black text-black
                      border-2 border-black rounded-none bg-white
                      focus:outline-none focus:bg-[var(--color-acid-green)]
                      transition-colors duration-100
                      caret-transparent
                    "
                    style={{ boxShadow: "var(--shadow-neubrutal-sm)" }}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-300 px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || otp.join("").length < 6}
                className={primaryBtnCls}
                style={{ boxShadow: "var(--shadow-neubrutal)" }}
              >
                {busy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : (
                  <>Verify & Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center text-sm text-gray-500">
              Didn't receive it?{" "}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || busy}
                className="font-bold text-black underline underline-offset-2 disabled:opacity-40 disabled:no-underline"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Success ───────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div
              className="w-16 h-16 flex items-center justify-center border-[3px] border-black"
              style={{ background: "var(--color-acid-green)", boxShadow: "var(--shadow-neubrutal)" }}
            >
              <CheckCircle2 className="w-8 h-8 text-black" />
            </div>
            <p className="font-black text-xl text-black">Account created!</p>
            <p className="text-sm text-gray-500">Redirecting you to login…</p>
          </div>
        )}

        {/* ── Footer link ───────────────────────────────────────────────────── */}
        {step !== 3 && (
          <p className="text-center text-xs text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-black underline underline-offset-2">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default OtpVerification;
