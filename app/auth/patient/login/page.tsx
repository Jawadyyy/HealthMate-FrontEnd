"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../patient.module.css";
import { loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function PatientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginPatient(email, password);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        router.push("/patient/dashboard");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
        "Invalid patient credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Add slide-out animation
    document.querySelector(`.${styles.loginPanel}`)?.classList.add(styles.slideOutLeft);

    // Navigate after animation
    setTimeout(() => {
      router.push("/auth/patient/signup");
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

        {/* Left: Login Form (WHITE) with animation */}
        <div className={`${styles.loginPanel} ${styles.slideInRight}`}>
          <div className={styles.patientLogo}>
            <h2>HealthMate</h2>
            <p>Patient Portal</p>
          </div>

          <h1>Patient Login</h1>
          <p>Sign in to access your healthcare dashboard</p>

          {resetSuccess && (
            <p className={styles.successMessage}>
              Password reset successful! Please login with your new password.
            </p>
          )}

          {error && <p className={styles.patientError}>{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Patient Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || isTransitioning}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || isTransitioning}
              required
            />

            <div className={styles.forgotPasswordContainer}>
              <Link
                href="/auth/patient/forgot-password"
                className={styles.forgotPasswordLink}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || isTransitioning}
              className={isTransitioning ? styles.disabled : ''}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className={styles.loginRedirect}>
            Don't have an account?{" "}
            <button
              onClick={handleSignupClick}
              className={styles.linkButton}
              disabled={isTransitioning}
            >
              Sign Up
            </button>
          </p>

          <p className={styles.availability}>24/7 Available</p>
        </div>

        {/* Right: Info Panel (BLUE) */}
        <div className={`${styles.infoPanel} ${styles.slideInLeft}`}>
          <h1>Hello, Friend!</h1>
          <p>Enter your personal details and start your journey with us</p>
          <button
            onClick={handleSignupClick}
            disabled={isTransitioning}
            className={isTransitioning ? styles.disabled : ''}
          >
            SIGN UP
          </button>
        </div>
      </div>
    </main>
  );
}