"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { loginPatient } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function PatientLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginPatient(email, password);
      
      // Store JWT token and role from backend response
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "patient");
        localStorage.setItem("isLoggedIn", "true");
        
        // Redirect to patient dashboard
        router.push("/patient/dashboard");
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      
      // Handle different error scenarios
      if (error.response) {
        setError(error.response.data?.message || "Invalid email or password");
      } else if (error.request) {
        setError("Unable to connect to server. Please try again.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="patient@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup Link */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{" "}
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