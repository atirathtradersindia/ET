// SignIn.jsx - FIXED with proper admin redirection
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, DEFAULT_ADMIN } from "../firebase";

const SignIn = ({ navigateToPage, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleAdminLogin = () => {
    setEmail(DEFAULT_ADMIN.email);
    setPassword(DEFAULT_ADMIN.password);
    setShowAdminLogin(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ SIGN IN SUCCESS - User email:", user.email);
      console.log("✅ SIGN IN SUCCESS - User UID:", user.uid);

      // Check if this is admin
      const isAdmin = user.email === DEFAULT_ADMIN.email;
      console.log("✅ Is admin?", isAdmin);

      if (onAuthSuccess) {
        console.log("✅ Calling onAuthSuccess callback");
        onAuthSuccess();
      }

      console.log("✅ Navigating to:", isAdmin ? "admin" : "home");
      navigateToPage(isAdmin ? "admin" : "home");

    } catch (err) {
      console.error("❌ Sign in error:", err.code, err.message);

      switch (err.code) {
        case 'auth/user-not-found':
          setError("No account found. Please sign up first.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Try again later.");
          break;
        default:
          setError("Login failed: " + (err.message || "Please check your credentials."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen pt-24 px-4 bg-dark">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-4 text-shadow-neon">
            Sign In
          </h1>
          <p className="text-light">Welcome back to Exclusive Trader</p>
        </div>

        {/* Admin Login Button */}
        <div className="mb-6 text-center">
          <button
            type="button"
            onClick={handleAdminLogin}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-crown mr-2"></i>
            Login as Admin
          </button>
          {/* <p className="text-xs text-gray-400 mt-2">
            Email: {DEFAULT_ADMIN.email}
          </p> */}
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/50 p-8 rounded-lg border border-secondary shadow-neon" autoComplete="off">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span>{error}</span>
              </div>
            </div>
          )}

          {showAdminLogin && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg">
              <div className="flex items-center text-purple-300">
                <i className="fas fa-user-shield mr-2"></i>
                <span className="font-medium">Admin Login Active</span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Will redirect to Admin Panel
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-light mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
              placeholder="Enter your email"
              required
              autoComplete="off"
            />
          </div>

          <div className="mb-6">
            <label className="block text-light mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light focus:border-secondary focus:outline-none transition-colors"
              placeholder="Enter your password"
              required
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-dark font-bold py-3 px-4 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {showAdminLogin ? "Logging in as Admin..." : "Signing In..."}
              </>
            ) : (
              showAdminLogin ? 'Login as Admin' : 'Sign In'
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-light">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigateToPage("signup")}
                className="text-secondary hover:text-accent transition-colors font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigateToPage("home")}
              className="text-light hover:text-secondary transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Home
            </button>
          </div>
        </form>

        {/* Debug info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Debug Info:</h3>
            <div className="space-y-1 text-xs">
              <div className="flex">
                <span className="text-gray-400 w-24">Current Email:</span>
                <span className="text-gray-300">{email || "(empty)"}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-24">Admin Email:</span>
                <span className="text-gray-300">{DEFAULT_ADMIN.email}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-24">Will redirect to:</span>
                <span className="text-gray-300">
                  {email === DEFAULT_ADMIN.email ? "Admin Panel" : "Home Page"}
                </span>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default SignIn;