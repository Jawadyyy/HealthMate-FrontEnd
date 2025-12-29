// app/auth/patient/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../patient.module.css";
import { loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function PatientLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail("");
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setResetError(
        axiosError.response?.data?.message ||
        "Failed to send reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess(false);
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
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={() => setShowForgotPassword(true)}
                disabled={isTransitioning}
              >
                Forgot Password?
              </button>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className={styles.modalOverlay} onClick={closeForgotPasswordModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={closeForgotPasswordModal}
            >
              ×
            </button>

            <h2 className={styles.modalTitle}>Reset Password</h2>
            <p className={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetSuccess ? (
              <div className={styles.successMessage}>
                Password reset link sent! Check your email.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                {resetError && (
                  <div className={styles.error}>{resetError}</div>
                )}

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                  required
                />

                <button
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}