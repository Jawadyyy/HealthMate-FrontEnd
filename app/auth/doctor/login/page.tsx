"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "../doctor.module.css";
import { loginDoctor } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function DoctorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginDoctor(email, password);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "doctor");
        localStorage.setItem("isLoggedIn", "true");
        router.push("/doctor/dashboard");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
        "Invalid doctor credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.doctorPage}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <div className={styles.doctorCard}>
        {/* Home Button - Redesigned */}
        <Link href="/" className={styles.homeButton}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Return to Home
        </Link>

        {/* Left: Info Panel - Medical Focus */}
        <div className={styles.infoPanel}>
          <div className={styles.medicalIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div className={styles.badge}>HIPAA COMPLIANT</div>
          <h1>Secure Medical Portal</h1>
          <p>Access confidential patient data with enterprise-grade security.</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>End-to-end encrypted</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Audit trail logging</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Two-factor authentication ready</span>
            </div>
          </div>
          <div className={styles.disclaimer}>
            <span className={styles.lockIcon}>🔒</span>
            <span>All access is logged and monitored</span>
          </div>
        </div>

        {/* Right: Login Form - Clean and Professional */}
        <div className={styles.loginPanel}>
          <div className={styles.loginHeader}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className={styles.logoText}>
                <h2>HealthMate</h2>
                <p>Medical Professional Access</p>
              </div>
            </div>
          </div>

          <div className={styles.welcomeSection}>
            <h1>Welcome Back, Doctor</h1>
            <p>Please enter your credentials to continue</p>
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <span className={styles.errorIcon}>⚠</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Professional Email</label>
              <div className={styles.inputWithIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWithIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.loginButton}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Secure Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>

            <div className={styles.helperLinks}>
              <Link href="/doctor/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
              <Link href="/doctor/register" className={styles.registerLink}>
                Request access
              </Link>
            </div>
          </form>

          <div className={styles.securityNote}>
            <span className={styles.shieldIcon}>🛡️</span>
            <span>This system is monitored 24/7 for security compliance</span>
          </div>
        </div>
      </div>
    </main>
  );
}