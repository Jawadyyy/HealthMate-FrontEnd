"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./auth.module.css";
import PatientLoginPage from "./patient/login/page";
import PatientSignupPage from "./patient/signup/page";
import DoctorLoginPage from "./doctor/login/page";
import DoctorSignupPage from "./doctor/signup/page";
import AdminLoginPage from "./admin/login/page";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const [currentRole, setCurrentRole] = useState<'patient' | 'doctor' | 'admin'>('patient');

  // Determine theme and role based on route
  const getThemeClass = () => {
    if (pathname.includes('/admin')) return styles.themeAdmin;
    if (pathname.includes('/doctor')) return styles.themeDoctor;
    return styles.themePatient;
  };

  // Update current view based on route
  useEffect(() => {
    const isSignupPage = pathname.includes("signup");
    setCurrentView(isSignupPage ? 'signup' : 'login');

    // Determine role
    if (pathname.includes('/admin')) setCurrentRole('admin');
    else if (pathname.includes('/doctor')) setCurrentRole('doctor');
    else setCurrentRole('patient');
  }, [pathname]);

  const sliderClass = currentView === 'signup' ? styles.showSignup : styles.showLogin;
  const themeClass = getThemeClass();

  // Render appropriate component based on role and view
  const renderComponent = () => {
    if (currentRole === 'patient') {
      return currentView === 'login' ? <PatientLoginPage /> : <PatientSignupPage />;
    } else if (currentRole === 'doctor') {
      return currentView === 'login' ? <DoctorLoginPage /> : <DoctorSignupPage />;
    } else {
      return <AdminLoginPage />; // Admin only has login
    }
  };

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

        <div className={`${styles.sliderContainer} ${sliderClass}`}>
          {/* Login Panel (Always first in DOM) */}
          <div className={styles.panel}>
            {currentRole === 'patient' ? <PatientLoginPage /> :
              currentRole === 'doctor' ? <DoctorLoginPage /> :
                <AdminLoginPage />}
          </div>

          {/* Signup Panel (Always second in DOM) - Only for patient and doctor */}
          <div className={styles.panel}>
            {currentRole === 'patient' ? <PatientSignupPage /> :
              currentRole === 'doctor' ? <DoctorSignupPage /> :
                <AdminLoginPage />}
          </div>
        </div>
      </div>
    </main>
  );
}