// app/auth/patient/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../patient.module.css";
import { registerPatient, loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";
import axios from "axios";

export default function PatientSignupPage() {
  const router = useRouter();

  // Step management
  const [step, setStep] = useState(1);

  // Step 1: Account Creation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Profile Details
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Add slide-in animation on mount
    document.querySelector(`.${styles.signupPanel}`)?.classList.add(styles.slideInRight);
    document.querySelector(`.${styles.infoPanel}`)?.classList.add(styles.slideInLeft);
  }, []);

  const handleStep1Submit = async (e: React.FormEvent) => {
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
      // Register the patient
      await registerPatient(name, email, password);

      // Auto-login to get token
      const loginResponse = await loginPatient(email, password);

      if (loginResponse.data.token) {
        const authToken = loginResponse.data.token;
        setToken(authToken);

        // Store in localStorage
        localStorage.setItem("token", authToken);
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", email);
        localStorage.setItem("name", name);

        // Transition to Step 2
        setStep(2);
      } else {
        throw new Error("Login failed after registration");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      // Prepare medical conditions array
      const medicalConditionsArray = medicalConditions
        .split(",")
        .map(condition => condition.trim())
        .filter(condition => condition.length > 0);

      // Call the /patients/create API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/create`,
        {
          age: parseInt(age),
          gender,
          bloodGroup,
          phone,
          address,
          emergencyContactName,
          emergencyContactPhone,
          medicalConditions: medicalConditionsArray.length > 0 ? medicalConditionsArray : []
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 201) {
        // Profile created successfully, redirect to dashboard
        router.push("/patient/dashboard");
      }
    } catch (err: any) {
      console.error("Profile setup error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to create profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Add slide-out animation
    document.querySelector(`.${styles.signupPanel}`)?.classList.add(styles.slideOutLeft);
    document.querySelector(`.${styles.infoPanel}`)?.classList.add(styles.slideOutRight);

    // Navigate after animation
    setTimeout(() => {
      router.push("/auth/patient/login");
    }, 300);
  };

  return (
    <main className={styles.patientPage}>
      <div className={styles.patientCard}>

        {/* Home Button */}
        <Link href="/" className={styles.homeButton}>
          <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </Link>

        {/* Left: Form Panel (WHITE) */}
        <div className={styles.signupPanel}>
          <div className={styles.patientLogo}>
            <h2>HealthMate</h2>
            <p>Patient Portal</p>
          </div>

          {/* Progress Indicator */}
          <div className={styles.progressIndicator}>
            <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <span>Account</span>
            </div>
            <div className={styles.progressLine}></div>
            <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <span>Profile</span>
            </div>
          </div>

          {/* Step 1: Account Creation */}
          {step === 1 && (
            <>
              <h1>Create Account</h1>
              <p>Enter your details to get started</p>

              {error && <p className={styles.patientError}>{error}</p>}

              <form onSubmit={handleStep1Submit}>
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || isTransitioning}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || isTransitioning}
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || isTransitioning}
                  minLength={6}
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || isTransitioning}
                  minLength={6}
                />

                <button
                  type="submit"
                  disabled={loading || isTransitioning}
                  className={isTransitioning ? styles.disabled : ''}
                >
                  {loading ? "Creating Account..." : "Next Step"}
                </button>
              </form>

              <p className={styles.loginRedirect}>
                Already have an account?{" "}
                <button
                  onClick={handleLoginClick}
                  className={styles.linkButton}
                  disabled={isTransitioning}
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <>
              <h1>Complete Your Profile</h1>
              <p>Enter your medical and contact details</p>

              {error && <p className={styles.patientError}>{error}</p>}

              <form onSubmit={handleStep2Submit} className={styles.profileForm}>
                <div className={styles.formRow}>
                  <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="0"
                    max="150"
                    disabled={loading}
                  />

                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Blood Group</option>
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
                </div>

                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={loading}
                />

                <input
                  type="text"
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
                  rows={3}
                />

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Completing Setup..." : "Complete Setup"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right: Info Panel (BLUE) */}
        <div className={styles.infoPanel}>
          {step === 1 ? (
            <>
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button
                onClick={handleLoginClick}
                disabled={isTransitioning}
                className={isTransitioning ? styles.disabled : ''}
              >
                SIGN IN
              </button>
            </>
          ) : (
            <>
              <h1>Almost There!</h1>
              <p>Complete your profile to access all features and book appointments</p>
              <div className={styles.infoIcon}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}