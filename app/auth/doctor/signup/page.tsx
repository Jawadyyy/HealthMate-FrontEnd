"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../auth.module.css";

export default function DoctorSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
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

    if (!licenseNumber) {
      setError("License number is required");
      return;
    }

    setLoading(true);
    // TODO: Implement actual doctor signup logic here
    setTimeout(() => {
      router.push("/auth/doctor/login");
    }, 1000);
  };

  const goToLogin = () => {
    router.push("/auth/doctor/login");
  };

  return (
    <>
      {/* Left: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>Welcome Back!</h1>
        <p>To access your doctor portal please login</p>
        <button onClick={goToLogin}>
          SIGN IN
        </button>
      </div>

      {/* Right: Signup Form with doctor-specific fields */}
      <div className={`${styles.formPanel} ${styles.signupForm}`}>
        <div className={styles.formLogo}>
          
        </div>
        
        <h1>Doctor Registration</h1>

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
            placeholder="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
            disabled={loading}
          />

          <input
            placeholder="Medical License Number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </>
  );
}