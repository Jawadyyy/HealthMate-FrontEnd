"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../auth.module.css";
import { registerDoctor, createDoctorProfile, loginDoctor } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function DoctorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields
  const [specialization, setSpecialization] = useState("");
  const [degrees, setDegrees] = useState("");
  const [phone, setPhone] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStep1Submit = (e: React.FormEvent) => {
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

    // Move to step 2
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Register doctor
      const registerResponse = await registerDoctor(name, email, password);

      // Step 2: Since registration doesn't return a token, log the user in
      const loginResponse = await loginDoctor(email, password);

      if (loginResponse.data.token) {
        // Store token immediately for auto-login
        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("role", "doctor");
        localStorage.setItem("isLoggedIn", "true");

        try {
          // Step 3: Create doctor profile
          const profileData = {
            fullName: name,
            specialization,
            degrees,
            phone,
            hospitalName,
            experienceYears: parseInt(experienceYears),
            availableSlots: availableSlots
              ? availableSlots.split(",").map((slot) => slot.trim())
              : [],
          };

          await createDoctorProfile(profileData);
        } catch (profileErr) {
          console.error("Profile creation error:", profileErr);
          // Continue to dashboard even if profile creation fails
        }

        // Redirect to doctor dashboard (user is logged in)
        router.push("/doctor/dashboard");
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
    router.push("/auth/doctor/login");
  };

  const goBackToStep1 = () => {
    setStep(1);
    setError("");
  };

  return (
    <>
      {/* Left: CTA Panel */}
      <div className={styles.ctaPanel}>
        <h1>Welcome Back!</h1>
        <p>To access your doctor portal please login</p>
        <button onClick={goToLogin}>SIGN IN</button>
      </div>

      {/* Right: Signup Form */}
      <div className={`${styles.formPanel} ${styles.signupForm}`}>
        <div className={styles.formLogo}></div>

        <h1>Doctor Registration</h1>
        <p className={styles.stepIndicator}>Step {step} of 2</p>

        {error && <p className={styles.error}>{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
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
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit}>
            <input
              placeholder="Specialization (e.g., Cardiology)"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              disabled={loading}
            />

            <input
              placeholder="Degrees (e.g., MBBS, FCPS)"
              value={degrees}
              onChange={(e) => setDegrees(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />

            <input
              placeholder="Hospital Name"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="number"
              placeholder="Years of Experience"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              required
              disabled={loading}
              min="0"
              max="60"
            />

            <textarea
              placeholder="Available Slots (comma-separated, e.g., 09:00 - 11:00, 14:00 - 17:00)"
              value={availableSlots}
              onChange={(e) => setAvailableSlots(e.target.value)}
              required
              disabled={loading}
              className={styles.textarea}
            />

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={goBackToStep1}
                disabled={loading}
                className={styles.backButton}
              >
                Back
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}