import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, ReceiptText, User, ArrowRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { login, isAuthenticated, isLoading, currentUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const getRedirect = () =>
    currentUser?.role === "ADMIN" ? "/dashboard" : "/pending-bills";

  useEffect(() => {
    if (hydrated && isAuthenticated) navigate({ to: getRedirect() });
  }, [hydrated, isAuthenticated, currentUser, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(username, password);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      return;
    }
    const user = useAuthStore.getState().currentUser;
    navigate({ to: user?.role === "ADMIN" ? "/dashboard" : "/pending-bills" });
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#0b1120]">
      {/* Left side - Illustration / Branding */}
      <motion.div
        className="hidden lg:flex lg:w-[55%] relative items-center justify-center bg-gradient-to-br from-[#0f1d3d] via-[#122a5e] to-[#0a1628] p-12"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-16 h-20 w-20 rounded-2xl bg-blue-400/10 backdrop-blur-sm border border-blue-400/10"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-20 h-16 w-16 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/10"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 right-16 h-12 w-12 rounded-xl bg-indigo-400/10 backdrop-blur-sm border border-indigo-400/10"
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-24 h-14 w-14 rounded-full bg-sky-400/10 backdrop-blur-sm border border-sky-400/10"
          animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-indigo-500/5 blur-[60px]" />

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center text-white">
          <motion.div
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/20 backdrop-blur-sm shadow-xl border border-blue-400/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
          >
            <ReceiptText className="h-10 w-10 text-blue-300" />
          </motion.div>

          <motion.h1
            className="text-4xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Enlarge Associate
          </motion.h1>

          <motion.p
            className="mt-4 text-lg text-blue-100/50 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Track, organize, and manage all your bills in one place with a clean and intuitive dashboard.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {["Real-time tracking", "Smart notifications", "Export reports"].map(
              (feature, i) => (
                <span
                  key={i}
                  className="rounded-full bg-blue-500/10 border border-blue-400/20 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-sm"
                >
                  {feature}
                </span>
              )
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[45%] bg-[#0d1526]">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile brand */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <ReceiptText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Enlarge Associate</h1>
          </div>

          {/* Welcome text */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white">Welcome back 👋</h2>
            <p className="mt-2 text-blue-200/50">
              Enter your credentials to access your account
            </p>
          </motion.div>

          <form onSubmit={submit} className="space-y-5">
            {/* Username field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-blue-100/70"
              >
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-300/40" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setIsFocused("username")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Enter your username"
                  className={`h-12 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-blue-200/30 transition-all duration-200 focus:bg-white/[0.07] focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 ${
                    isFocused === "username" ? "border-blue-400/50 bg-white/[0.07] ring-2 ring-blue-500/20" : ""
                  }`}
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-blue-100/70"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-blue-300/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused("password")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="••••••••"
                  className={`h-12 rounded-xl border-white/10 bg-white/5 pl-11 pr-11 text-white placeholder:text-blue-200/30 transition-all duration-200 focus:bg-white/[0.07] focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 ${
                    isFocused === "password" ? "border-blue-400/50 bg-white/[0.07] ring-2 ring-blue-500/20" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-blue-200 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="pt-1"
            >
              <Button
                type="submit"
                className="group relative h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-2 text-xs text-blue-300/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Secured by Enlarge Associate</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
