"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "../../auth.module.css";
import { loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function LoginPage() {
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

 
    return (
  <div className={`${styles.panelInner} ${styles.themePatient}`}>

      {/* LEFT: LOGIN */}
      <div className={styles.form}>
        <h1>Sign In</h1>

        {error && <p className={styles.error}>{error}</p>}

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

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* RIGHT: CTA */}
      <div className={styles.red}>
        <h1>Hello, Friend!</h1>
        <p>Enter your personal details and start your journey</p>
        <Link href="/auth/patient/signup">
          <button>SIGN UP</button>
        </Link>
      </div>
    </div>
  );
}
