"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const goToSignup = () => {
    router.push("/auth/patient/signup");
  };

  return (
    <>
      {/* Left: Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formLogo}>
          
        </div>
        
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

        <p className={styles.availability}>
          24/7 Available
        </p>
      </div>

      {/* Right: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>Hello, Friend!</h1>
        <p>Enter your personal details and start your journey</p>
        <button onClick={goToSignup}>
          SIGN UP
        </button>
      </div>
    </>
  );
}