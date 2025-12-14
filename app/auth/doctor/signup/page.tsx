"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "../../auth.module.css";
import { loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

   
  router.push("/auth/patient/login");
}

  return (
   <div className={`${styles.page} ${styles.themeDoctor}`}>

      {/* LEFT PANEL */}
      <div className={styles.red}>
        <h1>Welcome Back! Doctor</h1>
        <p>Access your dashboard and manage patients</p>
        <Link href="/auth/doctor/login">
          <button>SIGN IN</button>
        </Link>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.form}>
        <h1>Create Account</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSignup}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
