"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { loginAdmin } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function AdminLoginPage() {
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
      const response = await loginAdmin(email, password);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("isLoggedIn", "true");
        router.push("/admin/dashboard");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
        "Invalid admin credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.adminPage}>
      {/* Animated background elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      <div className={styles.adminCard}>
        {/* Home Button */}
        <Link href="/" className={styles.homeButton}>
          <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </Link>

        {/* Left: Login Form */}
        <div className={styles.loginPanel}>
          <div className={styles.adminLogo}>
            <div className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7c3aed" />
                <path d="M2 17L12 22L22 17" stroke="#7c3aed" strokeWidth="2" />
                <path d="M2 12L12 17L22 12" stroke="#7c3aed" strokeWidth="2" />
              </svg>
            </div>
            <h2>HealthMate</h2>
            <p>Admin Portal</p>
          </div>

          <div className={styles.formHeader}>
            <h1>Secure Admin Login</h1>
            <p>Restricted access for authorized personnel only</p>
          </div>

          {error && (
            <div className={styles.adminError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Admin Email</label>
              <input
                id="email"
                type="email"
                placeholder="admin@healthmate.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className={styles.securityBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.loginButton}>
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              )}
            </button>
          </form>

          <div className={styles.formFooter}>
            <div className={styles.securityNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>All actions are encrypted and logged</span>
            </div>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.panelContent}>
            <div className={styles.panelIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>

            <h1>System Control Panel</h1>
            <p>Manage users, monitor system health, and configure application settings from this secure interface.</p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span>User Management</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span>Analytics Dashboard</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                <span>System Configuration</span>
              </div>
            </div>

            <div className={styles.warningBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>
                <strong>Security Notice</strong>
                <p>Unauthorized access attempts are monitored and will be reported.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}