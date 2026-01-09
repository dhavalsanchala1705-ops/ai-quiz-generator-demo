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

  // Password Rules State
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

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

  const checkPasswordStrength = (val: string) => {
    const rules = {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val),
    };
    setPasswordRules(rules);
    return Object.values(rules).every(Boolean);
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (isLogin) {
      // Less strict on login, just check length
      if (val.length < 1) {
        setPasswordError('Password is required');
        return false;
      }
    } else {
      // Strict on signup
      if (!checkPasswordStrength(val)) {
        setPasswordError('Password must meet all requirements');
        return false;
      }
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
    if (!isLogin) {
      checkPasswordStrength(val);
    }
    validatePassword(val);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, val);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    validateConfirmPassword(val, password);
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
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isLogin) {
        const user = login(email, password);
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
          const user = signup(name, email, password);
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

  // Render Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
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
            Enter your email and we'll send you a link to reset your password.
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
                We've sent a password reset link to <span className="font-semibold">{email}</span>
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
                className={`w-full p-3 border rounded-lg focus:ring-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors ${emailError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'
                  }`}
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
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${!email || !!emailError || isLoading
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'
                }`}
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
    );
  }

  // Login / Signup View
  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2 mb-4 text-green-600 dark:text-green-400 text-xs font-semibold bg-green-50 dark:bg-green-900/20 py-1 px-3 rounded-full w-fit mx-auto border border-green-100 dark:border-green-800">
          <Lock size={12} />
          <span>Secure Connection</span>
        </div>
        <img src="/logo.png" alt="FundaMinds Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{isLogin ? 'Sign in to continue your learning journey' : 'Start personalizing your education today'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-3 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
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
            className={`w-full p-3 border rounded-lg focus:ring-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors ${emailError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'
              }`}
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
              type={showPassword ? "text" : "password"}
              className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors ${passwordError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'
                }`}
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
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs space-y-1 border border-slate-100 dark:border-slate-700">
              <p className="font-semibold text-slate-500 mb-2">Password Requirements:</p>
              <div className={`flex items-center gap-2 ${passwordRules.length ? 'text-green-600' : 'text-slate-400'}`}>
                {passwordRules.length ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordRules.upper ? 'text-green-600' : 'text-slate-400'}`}>
                {passwordRules.upper ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordRules.lower ? 'text-green-600' : 'text-slate-400'}`}>
                {passwordRules.lower ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                <span>One lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordRules.number ? 'text-green-600' : 'text-slate-400'}`}>
                {passwordRules.number ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                <span>One number</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordRules.special ? 'text-green-600' : 'text-slate-400'}`}>
                {passwordRules.special ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                <span>One special character</span>
              </div>
            </div>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors ${confirmPasswordError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'
                  }`}
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
                <RefreshCw size={20} />
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
                className={`w-20 p-3 border rounded-lg focus:ring-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors text-center font-bold ${captchaError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500'}`}
                placeholder="Answer"
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

        {
          error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        }

        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${!isFormValid() || isLoading
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'
            }`}
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
      </form >

      <div className="mt-6 flex items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or continue with</span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              onAuthSuccess({
                id: `google-${Date.now()}`,
                name: 'Google User',
                email: 'google@example.com',
                createdAt: Date.now(),
                lastDifficulty: 'Easy'
              } as any);
            }, 1000);
          }}
          className="flex items-center justify-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              onAuthSuccess({
                id: `microsoft-${Date.now()}`,
                name: 'Microsoft User',
                email: 'microsoft@example.com',
                createdAt: Date.now(),
                lastDifficulty: 'Easy'
              } as any);
            }, 1000);
          }}
          className="flex items-center justify-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0H0v10h10V0z" fill="#F25022" />
            <path d="M21 0H11v10h10V0z" fill="#7FBA00" />
            <path d="M10 11H0v10h10V11z" fill="#00A4EF" />
            <path d="M21 11H11v10h10V11z" fill="#FFB900" />
          </svg>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Microsoft</span>
        </button>
      </div>

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
    </div >
  );
};

export default Auth;
