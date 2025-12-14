"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignup = pathname.includes("signup");

  return (
    <>
      {/* HEADER */}
      <header className="w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-xl blur-sm"></div>
                <Image
                  src="/logo.png"
                  alt="HealthMate Logo"
                  width={60}
                  height={60}
                  className="relative rounded-xl shadow-sm z-10"
                  priority
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthMate</h1>
                <p className="text-sm text-gray-600">Digital Health Platform</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                24/7 Available
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>HealthMate</div>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      {/* Slider */}
      <main className={styles.page}>
        <div className={styles.card}>
          <div
            className={`${styles.container} ${
              isSignup ? styles.signup : styles.login
            }`}
          >
            <div className={styles.panel}>
              {!isSignup && children}
            </div>

            <div className={styles.panel}>
              {isSignup && children}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
