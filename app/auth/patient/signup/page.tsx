"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientSignup() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // Signup successful → go to profile setup
    router.push("/patient/profile-setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <form
        onSubmit={handleSignup}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg"
      >

        <h2 className="text-2xl font-bold text-green-700 mb-1">
          Create Patient Account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Step 1 of 2 – Account Information
        </p>

        <input
          required
          className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Full Name"
        />
        <input
          required
          type="email"
          className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Email"
        />
        <input
          required
          type="password"
          className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Password"
        />
        <input
          required
          type="password"
          className="w-full p-3 mb-5 border rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Confirm Password"
        />

        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
          Continue
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/patient/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}
