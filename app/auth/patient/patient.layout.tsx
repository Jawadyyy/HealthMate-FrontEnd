// app/auth/patient/layout.tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import styles from "../patient.module.css";

export default function PatientAuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className={styles.patientAuthPage}>
            <div className={styles.patientAuthCard}>
                {/* Home Button */}
                <Link href="/" className={styles.homeButton}>
                    <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Home
                </Link>

                {children}
            </div>
        </main>
    );
}