import React, { useState, useEffect } from 'react';
import { login, signup } from '../services/storageService';
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
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [captchaError, setCaptchaError] = useState('');



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




  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (val: string, pass: string) => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (val !== pass) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
  };

  const isFormValid = () => {
    if (!email) return false;
    if (emailError) return false;

    // Login Validation
    if (isLogin && !isForgotPassword) {
      if (!password || passwordError) return false;
    }

    // Signup Validation
    if (!isLogin && !isForgotPassword) {
      if (!name || !password || passwordError) return false;
      if (!captchaInput || parseInt(captchaInput) !== captcha.answer) {
        setCaptchaError('Incorrect captcha answer');
        return false;
      }
      if (!confirmPassword || confirmPasswordError) return false;
    }

    return true;
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setResetSent(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) return;

    setIsLoading(true);

    // Simulate network delay
    // Simulate network delay (Removed as we have real API now)
    // await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user) {
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }
          onAuthSuccess(user);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        if (!name || !email || !password || !confirmPassword) {
          setError('Please fill in all fields.');
          setIsLoading(false);
          return;
        }
        try {
          const user = await signup(name, email, password);
          onAuthSuccess(user);
        } catch (err: any) {
          setError(err.message || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
        {isForgotPassword ? (
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
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all ${emailError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600'}`}
                    placeholder="student@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateEmail(email)}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!email || !!emailError || isLoading}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${!email || !!emailError || isLoading ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'}`}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all ${emailError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600'}`}
                  placeholder="student@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                />
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all ${passwordError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword(password)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}

                {!isLogin && (
                  <p className="mt-2 text-xs text-slate-500">
                    You can set any password you like.
                  </p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all ${confirmPasswordError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600'}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => validateConfirmPassword(confirmPassword, password)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Check</label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-lg font-mono font-bold text-slate-600 dark:text-slate-200 tracking-wider">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Refresh Captcha"
                    >
                      <span className="text-xl font-bold">⟳</span>
                    </button>
                    <input
                      type="number"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        if (parseInt(e.target.value) === captcha.answer) {
                          setCaptchaError('');
                        }
                      }}
                      className={`w-24 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all text-center font-bold ${captchaError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600'}`}
                      placeholder="?"
                    />
                  </div>
                  {captchaError && <p className="text-red-500 text-xs mt-1">{captchaError}</p>}
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

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center animate-shake">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${!isFormValid() || isLoading ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    {isLogin ? 'Logging In...' : 'Signing Up...'}
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
