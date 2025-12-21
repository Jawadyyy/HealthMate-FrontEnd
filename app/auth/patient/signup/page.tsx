"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../auth.module.css";
import { registerPatient, createPatientProfile, loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function PatientSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

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
    console.log("🚀 Step 2 form submitted");
    setError("");
    setLoading(true);

    try {
      console.log("📝 Calling registerPatient API with:", { name, email });
      // Step 1: Register patient
      const registerResponse = await registerPatient(name, email, password);
      console.log("✅ Registration successful:", registerResponse.data);

      // Step 2: Since registration doesn't return a token, log the user in
      console.log("🔐 Logging in user after registration...");
      const loginResponse = await loginPatient(email, password);
      console.log("✅ Login response:", loginResponse.data);

      if (loginResponse.data.token) {
        console.log("🔑 Token received:", loginResponse.data.token);
        // Store token for auto-login
        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        console.log("✅ Token stored successfully");

        try {
          // Step 3: Create patient profile
          const profileData = {
            age: parseInt(age),
            gender,
            bloodGroup,
            phone,
            address,
            emergencyContactName,
            emergencyContactPhone,
            medicalConditions: medicalConditions
              ? medicalConditions.split(",").map((c) => c.trim())
              : [],
          };

          console.log("📝 Creating patient profile with data:", profileData);
          await createPatientProfile(profileData);
          console.log("✅ Profile created successfully");
        } catch (profileErr) {
          console.error("❌ Profile creation error:", profileErr);
          // Continue to dashboard even if profile creation fails
        }

        // Redirect to patient dashboard (user is logged in)
        console.log("🔄 Redirecting to /patient/dashboard");
        router.push("/patient/dashboard");
      } else {
        console.error("❌ Login failed after registration");
        setError("Registration successful! Please log in with your credentials.");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response) {
        console.error("Server error response:", axiosError.response.data);
        setError(
          axiosError.response.data?.message || "Registration failed. Please try again."
        );
      } else if (axiosError.request) {
        console.error("Network error - no response received");
        setError("Unable to connect to server. Please try again.");
      } else {
        console.error("Unexpected error:", axiosError.message);
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      console.log("✅ Form submission complete, loading set to false");
    }
  };

  const goToLogin = () => {
    router.push("/auth/patient/login");
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
        <p>To keep connected with us please login</p>
        <button onClick={goToLogin}>SIGN IN</button>
      </div>

      {/* Right: Signup Form */}
      <div className={`${styles.formPanel} ${styles.signupForm}`}>
        <div className={styles.formLogo}></div>

        <h1>Create Account</h1>
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
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              disabled={loading}
              min="1"
              max="120"
            />

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />

            <input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />

            <input
              placeholder="Emergency Contact Name"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="tel"
              placeholder="Emergency Contact Phone"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              required
              disabled={loading}
            />

            <textarea
              placeholder="Medical Conditions (comma-separated, optional)"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
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
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}