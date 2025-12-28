"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../patient.module.css";
import { loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (axiosError.response) {
        setError(
          axiosError.response.data?.message || "Invalid email or password"
        );
      } else if (axiosError.request) {
        setError("Unable to connect to server. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      // Replace this with your actual forgot password API call
      // const response = await forgotPasswordPatient(resetEmail);

      // Simulating API call
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

  const goToSignup = () => {
    router.push("/auth/patient/signup");
  };

  return (
    <>
      {/* Left: Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formLogo}>
          <h2>HealthMate</h2>
          <p>For Patients</p>
        </div>

        <h1>Patient Sign In</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <div className={styles.forgotPasswordContainer}>
            <button
              type="button"
              className={styles.forgotPasswordLink}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.availability}>24/7 Available</div>
      </div>

      {/* Right: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>Hello, Friend!</h1>
        <p>
          Enter your personal details and start your journey with us
        </p>
        <button onClick={goToSignup}>
          SIGN UP
        </button>
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
    </>
  );
}