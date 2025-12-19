// SignUp.jsx - Block admin email signup + Phone Number
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { ref, set } from "firebase/database";

const SignUp = ({ navigateToPage, onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // BLOCK admin email from being used for signup
      if (email === "admin@exclusivetrader.com") {
        throw new Error(
          "This email is reserved for system administrators. Please use a different email."
        );
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Store regular user data in database
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        email: user.email,
        displayName: displayName || "",
        phoneNumber: phoneNumber || "",
        role: "user",
        isAdmin: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      });

      console.log("✅ Regular user created with phone number");

      if (onAuthSuccess) onAuthSuccess();
      navigateToPage("home");
    } catch (err) {
      console.error("❌ Sign up error:", err.code);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email already in use. Please sign in instead.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError(err.message || "Sign up failed. Please try again.");
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
            Create Account
          </h1>
          <p className="text-light">Join Exclusive Trader community</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-primary/50 p-8 rounded-lg border border-secondary shadow-neon"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-light mb-2">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light"
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-light mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-light mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-light mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-light"
              placeholder="Create a password"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-dark font-bold py-3 rounded-lg hover:bg-accent disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="text-center mt-4 text-light">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigateToPage("signin")}
              className="text-secondary font-medium"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
