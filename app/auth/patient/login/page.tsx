"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientLogin() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Fake login for demo / semester project
    localStorage.setItem("role", "patient");
    localStorage.setItem("isLoggedIn", "true");

    // Redirect to patient dashboard
    router.push("/patient/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg"
      >

        {/* Header */}
        <h2 className="text-2xl font-bold text-green-700 mb-1">
          Patient Login
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Access your HealthMate account
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="patient@email.com"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Login
        </button>

        {/* Signup Link */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link
            href="/auth/patient/signup"
            className="text-green-600 font-medium hover:underline"
          >
            Create Account
          </Link>
        </p>

      </form>
    </div>
  );
}
