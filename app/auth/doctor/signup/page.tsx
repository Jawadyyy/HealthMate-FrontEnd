"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../auth.module.css";
import { registerDoctor, loginDoctor } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function DoctorSignupPage() {
  const router = useRouter();

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      // Register doctor
      await registerDoctor(name, email, password);

      // Login doctor
      const loginRes = await loginDoctor(email, password);

      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("role", "doctor");
      localStorage.setItem("isLoggedIn", "true");

      // Redirect to profile setup page
      router.push("/doctor/profile-setup");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.ctaPanel}>
        <h1>Welcome Back!</h1>
        <button onClick={() => router.push("/auth/doctor/login")}>
          SIGN IN
        </button>
      </div>

      <div className={`${styles.formPanel} ${styles.signupForm}`}>
        <h1>Doctor Registration</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Next: Profile Setup"}
          </button>
        </form>
      </div>
    </>
  );
}
