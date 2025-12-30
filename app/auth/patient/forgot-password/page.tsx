"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../patient.module.css";
import axios, { AxiosError } from "axios";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
                { email }
            );

            // Get the reset token from response
            if (response.data.resetToken) {
                const resetToken = response.data.resetToken;

                // Add slide-out animation
                document.querySelector(`.${styles.loginPanel}`)?.classList.add(styles.slideOutLeft);

                // Navigate to reset password page with token
                setTimeout(() => {
                    router.push(`/auth/patient/reset-password?token=${resetToken}`);
                }, 300);
            } else {
                // If no token returned, email not found
                setError("Email not found. Please check and try again.");
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;

            // Check for specific error messages
            if (axiosError.response?.status === 404 ||
                axiosError.response?.data?.message?.includes("not found") ||
                axiosError.response?.data?.message?.includes("does not exist")) {
                setError("This email is not registered. Please check and try again.");
            } else {
                setError(
                    axiosError.response?.data?.message ||
                    "Email verification failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        // Add slide-out animation
        document.querySelector(`.${styles.loginPanel}`)?.classList.add(styles.slideOutLeft);

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

                {/* Left: Form Panel (WHITE) with animation */}
                <div className={`${styles.loginPanel} ${styles.slideInRight}`}>
                    <div className={styles.patientLogo}>
                        <h2>HealthMate</h2>
                        <p>Patient Portal</p>
                    </div>

                    <h1>Forgot Password?</h1>
                    <p>Enter your email to verify your account</p>

                    {error && <p className={styles.patientError}>{error}</p>}

                    <form onSubmit={handleRequestReset}>
                        <input
                            type="email"
                            placeholder="Patient Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || isTransitioning}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading || isTransitioning}
                            className={isTransitioning ? styles.disabled : ''}
                        >
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                    </form>

                    <p className={styles.loginRedirect}>
                        Remember your password?{" "}
                        <button
                            onClick={handleBackToLogin}
                            className={styles.linkButton}
                            disabled={isTransitioning}
                        >
                            Sign In
                        </button>
                    </p>

                    <p className={styles.availability}>24/7 Available</p>
                </div>

                {/* Right: Info Panel (BLUE) */}
                <div className={`${styles.infoPanel} ${styles.slideInLeft}`}>
                    <h1>Verify Your Account</h1>
                    <p>Enter your registered email address and we'll verify if it exists in our system.</p>
                    <div className={styles.infoIcon}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </main>
    );
}
