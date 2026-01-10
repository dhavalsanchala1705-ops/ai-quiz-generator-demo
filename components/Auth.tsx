import React, { useState, useEffect } from 'react';
import { login, signup, forgotPassword, resetPassword } from '../services/storageService';
import { User } from '../types';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, CheckCircle, Lock, ShieldCheck, Check, X, RefreshCw } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onShowPrivacy?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onShowPrivacy }) => {
  // Mode states
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [emailError, setEmailError] = useState('');
  // const [emailError, setEmailError] = useState(''); // Removed as per instruction
  // const [passwordError, setPasswordError] = useState(''); // Removed as per instruction
  // const [confirmPasswordError, setConfirmPasswordError] = useState(''); // Removed as per instruction
  const [captchaError, setCaptchaError] = useState('');



  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Manual DOM Event Listener for stability
  useEffect(() => {
    // Check for Reset Token
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetToken(token);
    }

    const form = document.getElementById("signupForm") as HTMLFormElement | null;
    const errorEl = document.getElementById("error") as HTMLElement | null;

    if (!form) return;

    const handleFormSubmit = async (e: Event) => {
      e.preventDefault();
      if (errorEl) errorEl.textContent = "";

      const emailInput = document.getElementById("email") as HTMLInputElement | null;
      const passwordInput = document.getElementById("password") as HTMLInputElement | null;
      const usernameInput = document.getElementById("username") as HTMLInputElement | null;
      const confirmInput = document.getElementById("confirmPassword") as HTMLInputElement | null;

      const emailVal = emailInput?.value || "";
      const passVal = passwordInput?.value || "";
      const nameVal = usernameInput?.value || "";
      const confirmVal = confirmInput?.value || "";

      // Basic Logic
      if (!isLogin) {
        // Signup Checks
        if (!nameVal || !emailVal || !passVal) {
          if (errorEl) errorEl.textContent = "All fields are required";
          return;
        }
        if (passVal.length < 6) {
          if (errorEl) errorEl.textContent = "Password must be at least 6 characters";
          return;
        }
        if (passVal !== confirmVal) {
          if (errorEl) errorEl.textContent = "Passwords do not match";
          return;
        }
      } else {
        if (!emailVal || !passVal) {
          if (errorEl) errorEl.textContent = "Email and Password are required";
          return;
        }
      }

      setIsLoading(true);
      try {
        if (isLogin) {
          const user = await login(emailVal, passVal);
          if (user) {
            if (rememberMe) {
              localStorage.setItem('remembered_email', emailVal);
            } else {
              localStorage.removeItem('remembered_email');
            }
            onAuthSuccess(user);
          } else {
            if (errorEl) errorEl.textContent = "Invalid email or password";
          }
        } else {
          try {
            const user = await signup(nameVal, emailVal, passVal);
            onAuthSuccess(user);
          } catch (err: any) {
            if (errorEl) errorEl.textContent = err.message || "Signup failed";
          }
        }
      } catch (err) {
        if (errorEl) errorEl.textContent = "An error occurred";
      } finally {
        setIsLoading(false);
      }
    };

    form.addEventListener("submit", handleFormSubmit);
    return () => {
      form.removeEventListener("submit", handleFormSubmit);
    };
  }, [isLogin, onAuthSuccess, rememberMe]); // Re-bind when mode switches


  // Captcha State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptcha({ num1, num2, answer: num1 + num2 });
    setCaptchaInput('');
    setCaptchaError('');
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    generateCaptcha();
  }, []);




  // Removed validateEmail, validatePassword, validateConfirmPassword, handleEmailChange, handlePasswordChange, handleConfirmPasswordChange, isFormValid, handleSubmit functions.

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !resetToken) return;
    setIsLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      alert("Password updated! Please login.");
      setResetToken(null);
      setIsLogin(true);
      window.history.replaceState(null, '', window.location.pathname);
    } catch (err: any) {
      alert(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified validation for forgot password, as main validation moved to useEffect
    if (!email) {
      // setError('Email is required');
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      // setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setResetSent(true);
    } catch (err: any) {
      alert(err.message || "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  // Unified Render
  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-slate-100 dark:border-slate-700 min-h-[600px] animate-fade-in">
      {/* Left Side - Branding & Animation */}
      <div className="hidden md:flex flex-col justify-between bg-indigo-600 p-12 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg p-3">
              <img src="/logo.png" alt="FundaMinds Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">FundaMinds</span>
          </div>

          <h1 className="text-4xl font-extrabold mb-6 leading-tight">
            Master Any Subject with <span className="text-indigo-200">AI-Powered</span> Learning
          </h1>

          <p className="text-indigo-100 text-lg leading-relaxed mb-8">
            Join thousands of learners who are improving their grades and knowledge with personalized, adaptive quizzes.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <CheckCircle className="mb-2 text-green-300" size={24} />
            <div className="text-2xl font-bold">10k+</div>
            <div className="text-xs text-indigo-100 opacity-80">Quizzes Generated</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <Lock size={24} className="mb-2 text-blue-300" />
            <div className="text-2xl font-bold">Secure</div>
            <div className="text-xs text-indigo-100 opacity-80">Enterprise Grade</div>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 relative">
        {resetToken ? (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Set New Password</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your new password below.</p>
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all border-slate-200 dark:border-slate-600"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
              </div>
              <button disabled={isLoading} type="submit" className="w-full py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex justify-center items-center">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        ) : isForgotPassword ? (
          // Forgot Password View
          <div className="animate-fade-in">
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
                setError('');
              }}
              className="mb-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center transition-colors"
            >
              <ArrowLeft size={18} className="mr-1" /> Back to Login
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl shadow-sm mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Enter your email to receive recovery instructions.
              </p>
            </div>

            {resetSent ? (
              <div className="text-center animate-fade-in">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-900/50 mb-6">
                  <div className="flex justify-center mb-3">
                    <CheckCircle className="text-green-500" size={40} />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Check your inbox</h3>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    We've sent a link to <span className="font-semibold">{email}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all border-slate-200 dark:border-slate-600"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!email || isLoading}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${!email || isLoading ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Sending Link...
                    </>
                  ) : (
                    'Send Recovery Link'
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          // Login / Signup View
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              {/* Removed Logo from here as it's on the left now, simplified header */}
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
              <p className="text-slate-500 dark:text-slate-400">{isLogin ? 'Sign in to allow us to track your progress.' : 'Get started with your free account today.'}</p>
            </div>

            <form id="signupForm" className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    id="username"
                    type="text"
                    className="w-full p-3 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                    placeholder="John Doe"
                    defaultValue={name}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all border-slate-200 dark:border-slate-600"
                  placeholder="student@example.com"
                  defaultValue={email}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                  placeholder="••••••••"
                />
                {!isLogin && (
                  <p className="mt-2 text-xs text-slate-500">
                    You can set any password you like.
                  </p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                    }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div id="error" className="text-red-500 text-sm font-semibold min-h-[20px]">
                {error}
              </div>

              <button
                id="submitBtn"
                type="submit"
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </>
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </button>
            </form>



            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onShowPrivacy}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default Auth;
