"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAdmin } from "@/lib/auth/auth";
import { AxiosError } from "axios";

export default function AdminLogin() {
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
      const response = await loginAdmin(email, password);
      
      // Store JWT token and role from backend response
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("isLoggedIn", "true");
        
        // Redirect to admin dashboard
        router.push("/admin/dashboard");
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        setError(error.response.data?.message || "Invalid email or password");
      } else if (error.request) {
        // Request was made but no response received
        setError("Unable to connect to server. Please try again.");
      } else {
        // Something else happened
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
        <h2 className="text-2xl font-bold text-green-700 mb-2">Admin Login</h2>
        <p className="text-sm text-gray-500 mb-6">HealthMate Administration Panel</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <input
          required
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}