"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../auth.module.css";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    // TODO: Implement actual signup logic here
    setTimeout(() => {
      router.push("/auth/patient/login");
    }, 1000);
  };

  const goToLogin = () => {
    router.push("/auth/patient/login");
  };

  return (
    <>
      {/* Left: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>Welcome Back!</h1>
        <p>To keep connected with us please login</p>
        <button onClick={goToLogin}>
          SIGN IN
        </button>
      </div>

      {/* Right: Signup Form */}
      <div className={`${styles.formPanel} ${styles.signupForm}`}>
        <div className={styles.formLogo}>
         
        </div>
        
        <h1>Create Account</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSignup}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </>
  );
}