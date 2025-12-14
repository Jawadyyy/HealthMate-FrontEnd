"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Dummy admin credentials
  const dummyAdmin = {
    email: "admin@healthmate.com",
    password: "admin123",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check against dummy credentials
    if (email === dummyAdmin.email && password === dummyAdmin.password) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid email or password");
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          required
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-green-500"
        />

        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-green-500"
        />

        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
          Login
        </button>
      </form>
    </div>
  );
}
