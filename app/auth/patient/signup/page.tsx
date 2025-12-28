"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../patient.module.css";
import { registerPatient, loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function PatientSignupPage() {
  const router = useRouter();

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
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const registerResponse = await registerPatient(name, email, password);
      const loginResponse = await loginPatient(email, password);

      if (loginResponse.data.token) {
        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", email);
        localStorage.setItem("name", name);

        router.push("/patient/profile-setup");
      } else {
        setError("Registration successful! Please log in with your credentials.");
        router.push("/auth/patient/login");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;

      if (axiosError.response) {
        setError(
          axiosError.response.data?.message || "Registration failed. Please try again."
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

  const goToLogin = () => {
    router.push("/auth/patient/login");
  };

  return (
    <>
      <div className={styles.ctaPanel}>
        <h1>Welcome Back!</h1>
        <p>To keep connected with us please login</p>
        <button onClick={goToLogin}>SIGN IN</button>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formLogo}></div>

        <h1>Create Account</h1>
        <p>Enter your basic information to get started</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up & Continue"}
          </button>
        </form>

        <p className={styles.loginRedirect}>
          Already have an account?{" "}
          <button onClick={goToLogin} className={styles.linkButton}>
            Sign In
          </button>
        </p>
      </div>
    </>
  );
}