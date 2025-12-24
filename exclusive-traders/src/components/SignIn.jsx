// SignIn.jsx - Creates Firebase Auth account and updates existing user data
import { useState, useEffect, useRef } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, DEFAULT_ADMIN } from "../firebase";
import { ref, get, set, remove } from "firebase/database";

const SignIn = ({ navigateToPage, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPendingUser, setIsPendingUser] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    // Clear any saved credentials from localStorage
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    
    // Clear any pending user data from localStorage to ensure empty fields
    localStorage.removeItem('pending_user_email');
    localStorage.removeItem('pending_user_id');
    
    // Clear form fields on initial load
    setEmail("");
    setPassword("");
    setRememberMe(false);
    setIsPendingUser(false);
    
    // Focus on email field on initial load
    setTimeout(() => {
      if (emailRef.current) {
        emailRef.current.focus();
      }
    }, 100);
  }, []);

  // Check if email exists in users collection with pending status
  useEffect(() => {
    const checkIfPendingUser = async () => {
      if (email.trim()) {
        try {
          const usersRef = ref(db, 'users');
          const snapshot = await get(usersRef);
          
          if (snapshot.exists()) {
            const users = snapshot.val();
            
            // Find user with this email and pending status
            const foundUser = Object.entries(users).find(([userId, userData]) => 
              userData.email.toLowerCase() === email.toLowerCase().trim() && 
              userData.accountStatus === "pending"
            );
            
            setIsPendingUser(!!foundUser);
          } else {
            setIsPendingUser(false);
          }
        } catch (error) {
          console.error("Error checking users:", error);
          setIsPendingUser(false);
        }
      } else {
        setIsPendingUser(false);
      }
    };
    
    const timeoutId = setTimeout(checkIfPendingUser, 300);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Please enter email address");
      setLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setError("Please enter password");
      setLoading(false);
      return;
    }

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', trimmedEmail);
      localStorage.setItem('rememberedPassword', trimmedPassword);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }

    try {
      // First, try to sign in (for existing Firebase Auth users)
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        const user = userCredential.user;
        
        console.log("✅ Existing user signed in:", user.email);
        
        // Update last login
        try {
          const userRef = ref(db, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            await set(ref(db, `users/${user.uid}/lastLogin`), new Date().toISOString());
            console.log("✅ Last login updated");
          }
        } catch (dbError) {
          console.warn("Could not update last login:", dbError);
        }
        
        // Check if this is admin
        const isAdmin = user.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();
        console.log("✅ Is admin?", isAdmin);
        
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        
        navigateToPage(isAdmin ? "admin" : "home");
        return;
        
      } catch (signInError) {
        // If sign in fails, check if this is a pending user
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          
          // Look for pending user data in users collection
          let pendingUserData = null;
          let pendingUserId = null;
          
          try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
              const users = snapshot.val();
              
              // Find pending user with this email
              for (const [userId, userData] of Object.entries(users)) {
                if (userData.email.toLowerCase() === trimmedEmail && 
                    userData.accountStatus === "pending") {
                  pendingUserId = userId;
                  pendingUserData = userData;
                  break;
                }
              }
            }
          } catch (dbError) {
            console.error("Error checking users:", dbError);
          }
          
          if (pendingUserData && pendingUserId) {
            // Verify the password matches
            if (pendingUserData.password !== trimmedPassword) {
              throw new Error("Incorrect password. Please use the password you set during signup.");
            }
            
            // Create Firebase Auth account for pending user
            console.log("🔄 Creating Firebase Auth account for pending user...");
            
            const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
            const firebaseUser = userCredential.user;
            
            console.log("✅ Firebase Auth account created:", firebaseUser.email);
            
            // Update display name
            if (pendingUserData.displayName) {
              await updateProfile(firebaseUser, { displayName: pendingUserData.displayName });
            }
            
            // Move user data from pending location to permanent Firebase UID location
            const newUserRef = ref(db, `users/${firebaseUser.uid}`);
            
            // Create the new user record with Firebase UID
            await set(newUserRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: pendingUserData.displayName || "",
              phoneNumber: pendingUserData.phoneNumber || {},
              role: "user",
              isAdmin: false,
              isVerified: false,
              isActive: true,
              accountStatus: "active", // Now active
              createdAt: pendingUserData.createdAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              signupCompleted: true,
              createdFromPending: true
            });
            
            console.log("✅ User data moved to Firebase UID location");
            
            // Remove the old pending user data
            await remove(ref(db, `users/${pendingUserId}`));
            
            console.log("✅ Pending user data removed");
            
            // Clear localStorage
            localStorage.removeItem('pending_user_email');
            localStorage.removeItem('pending_user_id');
            
            if (onAuthSuccess) {
              onAuthSuccess();
            }
            
            // Clear form
            setTimeout(() => {
              setEmail("");
              setPassword("");
              setRememberMe(false);
              setIsPendingUser(false);
            }, 100);
            
            navigateToPage("home");
            return;
          } else {
            throw new Error("No account found. Please sign up first.");
          }
        } else if (signInError.code === 'auth/wrong-password') {
          throw new Error("Incorrect password. Please try again.");
        } else {
          throw signInError;
        }
      }
      
    } catch (err) {
      console.error("❌ Authentication error:", err.code, err.message);

      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            setError("No account found with this email. Please sign up first.");
            break;
          case 'auth/wrong-password':
            setError("Incorrect password. Please try again.");
            break;
          case 'auth/invalid-email':
            setError("Invalid email address format.");
            break;
          case 'auth/too-many-requests':
            setError("Too many failed attempts. Please try again later.");
            break;
          case 'auth/network-request-failed':
            setError("Network error. Please check your connection.");
            break;
          default:
            setError(err.message || "Login failed. Please check your credentials.");
        }
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigateToPage("forgot-password");
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setRememberMe(false);
    setError("");
    setIsPendingUser(false);
    localStorage.removeItem('pending_user_email');
    localStorage.removeItem('pending_user_id');
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
  };

  return (
    <section className="min-h-screen pt-24 px-4 bg-dark">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-4 text-shadow-neon">
            Sign In
          </h1>
          <p className="text-light">Welcome to Exclusive Trader</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="bg-dark/80 p-8 rounded-lg border border-secondary shadow-neon backdrop-blur-sm"
          autoComplete="off"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-lg mr-3"></i>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Email - Empty by default */}
          <div className="mb-6">
            <label className="block text-light mb-3 font-medium">
              Email Address
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light placeholder-gray-400 focus:border-secondary focus:outline-none transition-colors"
              placeholder="Enter your email"
              required
              autoComplete="email"
              id="signin-email"
            />
          </div>

          {/* Password - Empty by default */}
          <div className="mb-6">
            <label className="block text-light mb-3 font-medium">
              Password
            </label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light placeholder-gray-400 focus:border-secondary focus:outline-none transition-colors"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              id="signin-password"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-secondary bg-dark border-gray-600 rounded focus:ring-secondary focus:ring-2"
              />
              <label htmlFor="remember-me" className="ml-2 text-light text-sm cursor-pointer">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-secondary hover:text-accent text-sm transition-colors"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className={`w-full bg-secondary text-dark font-bold py-4 rounded-lg transition-all duration-300 text-lg ${
              loading || !email.trim() || !password.trim()
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-accent hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <i className="fas fa-spinner fa-spin"></i>
                {isPendingUser ? "Creating Account..." : "Signing In..."}
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center mb-4">
              <p className="text-light">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    navigateToPage("signup");
                  }}
                  className="text-secondary hover:text-accent transition-colors font-bold"
                  disabled={loading}
                >
                  Sign Up
                </button>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigateToPage("home")}
                className="text-light hover:text-secondary transition-colors flex items-center justify-center gap-2 mx-auto"
                disabled={loading}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Homepage
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;