import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, User, AlertCircle, Building2, MapPin, Navigation } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeBranch, setActiveBranch] = useState(null);
  const [errors, setErrors] = useState({ loginId: "", password: "", general: "" });
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Create AbortController for this effect run
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    const fetchActiveBranch = async () => {
      try {
        const res = await api.get("/branches/active", { signal });
        // Only update state if request wasn't aborted
        if (!signal.aborted && res.data.status && res.data.data) {
          setActiveBranch(res.data.data);
        }
      } catch (error) {
        // Don't log if it's an abort error (component unmounted or StrictMode cleanup)
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED' && !signal.aborted) {
          console.log("Could not fetch branch");
        }
      }
    };
    
    fetchActiveBranch();
    
    // Cleanup function to cancel request if component unmounts or StrictMode remounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clear errors when user types
  useEffect(() => {
    if (loginId) {
      setErrors(prev => ({ ...prev, loginId: "" }));
    }
  }, [loginId]);

  useEffect(() => {
    if (password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  }, [password]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ loginId: "", password: "", general: "" });

    try {
      const res = await api.post("/login", { loginId, password });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        toast.success(res.data.message || "Login successful!");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        const errorData = res.data;
        setErrors({
          loginId: errorData.errors?.loginId?.[0] || "",
          password: errorData.errors?.password?.[0] || "",
          general: errorData.message || "Login failed. Please try again."
        });
        toast.error(errorData.message || "Login failed!");
      }
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        setErrors({
          loginId: errorData.errors?.loginId?.[0] || "",
          password: errorData.errors?.password?.[0] || "",
          general: errorData.message || "An error occurred. Please try again."
        });
        toast.error(errorData.message || "Login failed!");
      } else {
        setErrors({
          loginId: "",
          password: "",
          general: "Network error. Please check your connection and try again."
        });
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative overflow-hidden font-sans">
      <Toaster position="top-right" />
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full flex min-h-screen">
        
        {/* LEFT COLUMN: CURVED SIDE */}
        <div className="hidden lg:flex w-[45%] xl:w-[50%] relative items-center justify-center p-12 overflow-hidden">
          {/* THE CURVE SVG - Smooth organic vertical curve */}
          <div className="absolute inset-0 z-0">
            <svg 
              viewBox="0 0 120 100" 
              className="h-full w-full" 
              preserveAspectRatio="none"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              {/* Smooth, flowing vertical curve with pronounced waves */}
              <path 
                d="M 0 0 
                   L 100 0 
                   Q 110 5, 108 15
                   T 110 30
                   T 108 45
                   T 110 60
                   T 108 75
                   T 110 90
                   Q 108 95, 100 100
                   L 0 100 
                   Z" 
                fill="url(#gradient)"
              />
            </svg>
          </div>

          {/* Content on the Curve */}
          <div className="relative z-10 w-full max-w-md text-white">
             {activeBranch ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Active Branch Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/25 backdrop-blur-xl rounded-full text-xs font-bold shadow-lg border border-white/30">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="tracking-wider">ACTIVE BRANCH</span>
                  </div>
                  
                  {/* Branch Info Cards - Redesigned for Full Text Display */}
                  <div className="space-y-4">
                    {/* Branch Name Card */}
                    <div className="group bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-lg hover:from-white/25 hover:via-white/20 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-gradient-to-br from-white/30 to-white/15 rounded-xl border border-white/25 group-hover:scale-105 transition-transform duration-300 flex-shrink-0 mt-0.5">
                          <Building2 size={26} className="text-white"/>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-2">Branch Name</p>
                          <p className="text-xl font-bold text-white leading-snug break-words">{activeBranch.branch_name}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location Card */}
                    <div className="group bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-lg hover:from-white/25 hover:via-white/20 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-gradient-to-br from-white/30 to-white/15 rounded-xl border border-white/25 group-hover:scale-105 transition-transform duration-300 flex-shrink-0 mt-0.5">
                          <MapPin size={26} className="text-white"/>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-2">Location</p>
                          <p className="text-lg font-semibold text-white leading-relaxed break-words">{activeBranch.city}, {activeBranch.state}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Address Card */}
                    {activeBranch.address && (
                      <div className="group bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-md hover:shadow-lg hover:from-white/25 hover:via-white/20 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="p-3.5 bg-gradient-to-br from-white/30 to-white/15 rounded-xl border border-white/25 group-hover:scale-105 transition-transform duration-300 flex-shrink-0 mt-0.5">
                            <Navigation size={26} className="text-white"/>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-white/60 font-semibold uppercase tracking-wide mb-2">Address</p>
                            <p className="text-base font-medium text-white/95 leading-relaxed break-words whitespace-pre-wrap">{activeBranch.address}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
             ) : (
                <div className="space-y-6 text-center">
                   <div className="inline-flex items-center justify-center p-6 bg-white/15 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl">
                     <Building2 size={48} className="text-white"/>
                   </div>
                   <h2 className="text-4xl font-bold text-white drop-shadow-lg">POS System</h2>
                </div>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM */}
        <div className="w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center p-6 bg-white relative z-10">
          <div className="w-full max-w-md space-y-8">
            {/* Enhanced Professional Header */}
            <div className="text-center lg:text-left space-y-3">
              <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <Lock className="text-white drop-shadow-md" size={24}/>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
                    Welcome Back!
                  </h1>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium tracking-wide">Sign in to access your account securely</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className={`block text-sm font-bold mb-2.5 transition-colors ${
                  errors.loginId ? "text-red-600" : "text-gray-700"
                }`}>
                  Login ID
                </label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                    errors.loginId ? "text-red-400" : "text-gray-400 group-focus-within:text-purple-500"
                  }`}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl transition-all duration-300 shadow-sm ${
                      errors.loginId
                        ? "bg-red-50 border-2 border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-400 shadow-red-100"
                        : "bg-gray-50 border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white hover:bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    placeholder="Enter your Login ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </div>
                {errors.loginId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{errors.loginId}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-bold mb-2.5 transition-colors ${
                  errors.password ? "text-red-600" : "text-gray-700"
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                    errors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-purple-500"
                  }`}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl transition-all duration-300 shadow-sm ${
                      errors.password
                        ? "bg-red-50 border-2 border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-400 shadow-red-100"
                        : "bg-gray-50 border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:bg-white hover:bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all duration-300 ${
                      errors.password 
                        ? "text-red-400 hover:text-red-600 hover:bg-red-50" 
                        : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}