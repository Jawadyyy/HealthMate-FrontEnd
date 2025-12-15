"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../auth.module.css";
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
    <>
      {/* Left: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>System Control Panel</h1>
        <p>
          This area is reserved for system administrators.
          All actions are logged and monitored.
        </p>
        <p style={{ opacity: 0.85, fontSize: "13px", marginTop: "20px" }}>
          Unauthorized access is prohibited.
        </p>
      </div>

      {/* Right: Admin Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formLogo}>
          <h2>HealthMate</h2>
          <p>Admin Portal</p>
        </div>
        
        <h1>Admin Login</h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
          Restricted access. Authorized personnel only.
        </p>

        {error && <p className={styles.error}>{error}</p>}

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
    </>
  );
}