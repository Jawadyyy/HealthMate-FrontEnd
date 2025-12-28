// app/auth/patient/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../patient.module.css";
import { registerPatient, loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function PatientSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Add slide-in animation on mount
    document.querySelector(`.${styles.signupPanel}`)?.classList.add(styles.slideInRight);
    document.querySelector(`.${styles.infoPanel}`)?.classList.add(styles.slideInLeft);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const registerResponse = await registerPatient(name, email, password);
      const loginResponse = await loginPatient(email, password);

      if (loginResponse.data.token) {
        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", email);
        localStorage.setItem("name", name);

        router.push("/patient/profile-setup");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Add slide-out animation
    document.querySelector(`.${styles.signupPanel}`)?.classList.add(styles.slideOutLeft);
    document.querySelector(`.${styles.infoPanel}`)?.classList.add(styles.slideOutRight);

    // Navigate after animation
    setTimeout(() => {
      router.push("/auth/patient/login");
    }, 300);
  };

  return (
    <main className={styles.patientPage}>
      <div className={styles.patientCard}>

        {/* Home Button */}
        <Link href="/" className={styles.homeButton}>
          <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </Link>

        {/* Left: Signup Form (WHITE) with animation */}
        <div className={styles.signupPanel}>
          <div className={styles.patientLogo}>
            <h2>HealthMate</h2>
            <p>Patient Portal</p>
          </div>

          <h1>Create Account</h1>
          <p>Enter your details to get started</p>

          {error && <p className={styles.patientError}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || isTransitioning}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || isTransitioning}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || isTransitioning}
              minLength={6}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || isTransitioning}
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading || isTransitioning}
              className={isTransitioning ? styles.disabled : ''}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className={styles.loginRedirect}>
            Already have an account?{" "}
            <button
              onClick={handleLoginClick}
              className={styles.linkButton}
              disabled={isTransitioning}
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Right: Info Panel (BLUE) with animation */}
        <div className={styles.infoPanel}>
          <h1>Welcome Back!</h1>
          <p>To keep connected with us please login with your personal info</p>
          <button
            onClick={handleLoginClick}
            disabled={isTransitioning}
            className={isTransitioning ? styles.disabled : ''}
          >
            SIGN IN
          </button>
        </div>
      </div>
    </main>
  );
}