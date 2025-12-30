"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../patient.module.css";
import axios, { AxiosError } from "axios";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!token) {
            setError("Invalid reset token");
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
                {
                    resetToken: token,
                    newPassword,
                }
            );

            // Add slide-out animation
            document.querySelector(`.${styles.loginPanel}`)?.classList.add(styles.slideOutLeft);

            // Show success and redirect
            setTimeout(() => {
                router.push("/auth/patient/login?reset=success");
            }, 300);
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            setError(
                axiosError.response?.data?.message ||
                "Failed to reset password. Token may be expired."
            );
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

                    <h1>Reset Password</h1>
                    <p>Enter your new password</p>

                    {error && <p className={styles.patientError}>{error}</p>}

                    <form onSubmit={handleResetPassword}>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading || isTransitioning}
                            required
                            minLength={6}
                        />

                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading || isTransitioning}
                            required
                            minLength={6}
                        />

                        <button
                            type="submit"
                            disabled={loading || isTransitioning}
                            className={isTransitioning ? styles.disabled : ''}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
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
                    <h1>Create New Password</h1>
                    <p>Your new password must be different from previously used passwords.</p>
                    <div className={styles.infoIcon}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M9 12l2 2 4-4"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </main>
    );
}