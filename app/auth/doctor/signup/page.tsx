"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../auth.module.css";
import {
  registerDoctor,
  createDoctorProfile,
  loginDoctor,
} from "@/lib/auth/auth";
import { AxiosError } from "axios";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function DoctorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2
  const [specialization, setSpecialization] = useState("");
  const [degrees, setDegrees] = useState("");
  const [phone, setPhone] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [fee, setFee] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day],
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerDoctor(name, email, password);
      const loginRes = await loginDoctor(email, password);

      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("role", "doctor");
      localStorage.setItem("isLoggedIn", "true");

      await createDoctorProfile({
        fullName: name,
        specialization,
        degrees,
        phone,
        hospitalName,
        experienceYears: Number(experienceYears),
        fee: Number(fee),
        availableDays,
        availableSlots: availableSlots
          .split(",")
          .map((s) => s.trim()),
      });

      router.push("/doctor/dashboard");
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
        <p>Step {step} of 2</p>

        {error && <p className={styles.error}>{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
            <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button>Next</button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit}>
            <input placeholder="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            <input placeholder="Degrees" value={degrees} onChange={(e) => setDegrees(e.target.value)} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="Hospital Name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
            <input type="number" placeholder="Experience Years" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
            <input type="number" placeholder="Consultation Fee (PKR)" value={fee} onChange={(e) => setFee(e.target.value)} />

            {/* Available Days */}
            <div className={styles.days}>
              {DAYS.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={availableDays.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Available Slots (comma-separated)"
              value={availableSlots}
              onChange={(e) => setAvailableSlots(e.target.value)}
            />

            <button type="submit">Register</button>
          </form>
        )}
      </div>
    </>
  );
}
