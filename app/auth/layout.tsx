"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";

// Import pages
import PatientLoginPage from "./patient/login/page";
import PatientSignupPage from "./patient/signup/page";
import DoctorLoginPage from "./doctor/login/page";
import AdminLoginPage from "./admin/login/page";

type Role = "patient" | "doctor" | "admin";
type View = "login" | "signup";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("login");
  const [currentRole, setCurrentRole] = useState<Role>("patient");

  useEffect(() => {
    if (pathname.includes("/admin")) {
      setCurrentRole("admin");
    } else if (pathname.includes("/doctor")) {
      setCurrentRole("doctor");
    } else {
      setCurrentRole("patient");
    }

    setCurrentView(pathname.includes("signup") ? "signup" : "login");
    setLoading(false);
  }, [pathname]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div style={{ opacity: 0.5 }}>Loading...</div>
        </div>
      </main>
    );
  }

  // Admin login page
  if (currentRole === "admin") return <AdminLoginPage />;

  // Detect profile setup pages (example: "/patient/profile" or "/doctor/profile")
  if (pathname.includes("/profile")) {
    return <main className={styles.page}>
      <div className={styles.card}>{children}</div>
    </main>;
  }

  // Panels for patient/doctor login/signup
  const panels =
    currentRole === "patient"
      ? [<PatientLoginPage key="login" />, <PatientSignupPage key="signup" />]
      : [<DoctorLoginPage key="login" />];

  const sliderStyle: React.CSSProperties = {
    transform: currentView === "signup" ? "translateX(-50%)" : "translateX(0%)"
  };

  const themeClass = currentRole === "doctor" ? styles.themeDoctor : styles.themePatient;

  return (
    <main className={`${styles.page} ${themeClass}`}>
      <div className={styles.card}>
        {/* Home Button */}
        <Link href="/" className={styles.homeButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </Link>

        {/* Render slider */}
        <div className={styles.sliderContainer} style={sliderStyle}>
          {panels.map((panel, idx) => (
            <div key={idx} className={styles.panel}>
              {panel}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
