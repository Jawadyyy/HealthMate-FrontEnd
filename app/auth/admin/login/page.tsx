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
      <div className={styles.adminCard}>
       

        {/* Left: Info Panel */}
        <div className={styles.infoPanel}>
          <h1>System Control Panel</h1>
          <p>This area is reserved for system administrators.</p>
          <p>All actions are logged and monitored.</p>
          <p className={styles.warning}>Unauthorized access is prohibited.</p>
        </div>

        {/* Right: Login Form */}
        <div className={styles.loginPanel}>
          <div className={styles.adminLogo}>
            <h2>HealthMate</h2>
            <p>Admin Portal</p>
          </div>

          <h1>Admin Login</h1>
          <p>Restricted access. Authorized personnel only.</p>

          {error && <p className={styles.adminError}>{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Admin Email"
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

            <button type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}