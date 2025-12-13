"use client";

import Link from "next/link";

export default function DoctorSignup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <form className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        {/* Header */}
        <h2 className="text-2xl font-bold text-green-700 mb-1">
          Create Doctor Account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Step 1 of 2 – Account Information
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Dr. Sarah Khan"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="doctor@email.com"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="********"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Create Account
        </button>

        {/* Login Link */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Already registered?{" "}
          <Link href="/doctor/login" className="text-green-600 font-medium hover:underline">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}
