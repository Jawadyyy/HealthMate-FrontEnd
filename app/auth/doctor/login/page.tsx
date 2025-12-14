"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "../../auth.module.css";
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
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.page} ${styles.themeDoctor}`}>
      <div className={styles.card}>
        <div className={`${styles.container} ${styles.login}`}>
          <div className={styles.panel}>
            <div className={styles.panelInner}>

              {/* LEFT: LOGIN */}
              <div className={styles.form}>
                <h1>Doctor Sign In</h1>

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
                <h1>Hello, Doctor!</h1>
                <p>Login to manage your patients</p>
                <Link href="/auth/doctor/signup">
                  <button>SIGN UP</button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
