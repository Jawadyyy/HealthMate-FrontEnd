"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <>
      {/* Left: Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formLogo}>

        </div>

        <h1>Doctor Sign In</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Doctor Email"
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

        </p>
      </div>

      {/* Right: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>Hello, Doctor!</h1>
        <p>Join our network and start helping patients</p>
      </div>
    </>
  );
}