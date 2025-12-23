"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { loginAdmin } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function AdminLoginPage() {
  const router = useRouter();
  
  // Check if already logged in (frontend-only check)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (token && role === "admin" && isLoggedIn === "true") {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Basic frontend validation
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    const errors = {
      email: "",
      password: "",
      general: ""
    };
    
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Frontend-only rate limiting
    if (attempts >= MAX_ATTEMPTS) {
      errors.general = "Too many failed attempts. Please try again later.";
      isValid = false;
      
      // Frontend lockout (temporary, will be cleared on refresh)
      setTimeout(() => {
        setAttempts(0);
      }, 15 * 60 * 1000);
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFormErrors(prev => ({ ...prev, general: "" }));

    try {
      const response = await loginAdmin(formData.email, formData.password);

      if (response.data?.token) {
        // Store authentication data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("isLoggedIn", "true");
        
        // Reset attempts on successful login
        setAttempts(0);
        
        // Add a small delay for better UX
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 500);
      } else {
        // Handle unexpected response format
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      
      // Track failed attempts (frontend-only)
      setAttempts(prev => prev + 1);
      
      // Determine appropriate error message
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        setFormErrors(prev => ({
          ...prev,
          general: "Invalid admin credentials. Please check your email and password."
        }));
      } else if (axiosError.response?.status === 429) {
        setFormErrors(prev => ({
          ...prev,
          general: "Too many login attempts. Please wait a few minutes."
        }));
      } else if (axiosError.message === "Network Error") {
        setFormErrors(prev => ({
          ...prev,
          general: "Network error. Please check your connection."
        }));
      } else {
        // Generic error message that works with any backend response
        const errorMessage = 
          axiosError.response?.data?.message ||
          "Login failed. Please check your credentials and try again.";
        
        setFormErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
      
      // Clear password field for security (optional)
      if (attempts >= 2) { // After 2 failed attempts
        setFormData(prev => ({
          ...prev,
          password: ""
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const remainingAttempts = MAX_ATTEMPTS - attempts;

  return (
    <main className={styles.adminPage}>
      {/* Home Button */}
      <Link href="/" className={styles.homeButton}>
        ← Back to Home
      </Link>

      <div className={styles.adminCard}>
        {/* Left: Info Panel */}
        <div className={styles.infoPanel}>
          <h1>System Control Panel</h1>
          <p>This area is reserved for system administrators.</p>
          <p>All actions are logged and monitored.</p>
          <p className={styles.warning}>Unauthorized access is prohibited.</p>
          
          {/* Frontend-only security info */}
          {attempts > 0 && remainingAttempts > 0 && (
            <div className={styles.securityInfo}>
              <p>Failed attempts: {attempts}</p>
              <p className={styles.attemptWarning}>
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}
          
          {attempts >= MAX_ATTEMPTS && (
            <div className={styles.securityInfo}>
              <p className={styles.lockedMessage}>
                ⚠️ Access temporarily locked
              </p>
              <p className={styles.lockedSubtext}>
                Please wait 15 minutes or contact system administrator
              </p>
            </div>
          )}
        </div>

        {/* Right: Login Form */}
        <div className={styles.loginPanel}>
          <div className={styles.adminLogo}>
            <h2>HealthMate</h2>
            <p>Admin Portal</p>
          </div>

          <h1>Admin Login</h1>
          <p>Restricted access. Authorized personnel only.</p>

          {/* General Error Message */}
          {formErrors.general && (
            <div className={styles.adminError}>
              <p>{formErrors.general}</p>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email Field */}
            <div className={styles.formGroup}>
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading || attempts >= MAX_ATTEMPTS}
                required
                autoComplete="username"
                className={formErrors.email ? styles.inputError : ""}
              />
              {formErrors.email && (
                <span className={styles.fieldError}>{formErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading || attempts >= MAX_ATTEMPTS}
                required
                autoComplete="current-password"
                className={formErrors.password ? styles.inputError : ""}
              />
              {formErrors.password && (
                <span className={styles.fieldError}>{formErrors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || attempts >= MAX_ATTEMPTS}
              className={loading ? styles.loadingButton : ""}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Authenticating...
                </>
              ) : attempts >= MAX_ATTEMPTS ? (
                "Access Locked"
              ) : (
                "Sign In"
              )}
            </button>

            {/* Security Notice */}
            <div className={styles.securityNotice}>
              <p>For security reasons, multiple failed attempts will temporarily restrict access.</p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}