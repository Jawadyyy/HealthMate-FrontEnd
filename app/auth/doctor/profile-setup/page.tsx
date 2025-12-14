"use client";

export default function DoctorProfileSetup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <form className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-lg">
        
        {/* Header */}
        <h2 className="text-2xl font-bold text-green-700 mb-1">
          Doctor Profile Setup
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Complete your professional information
        </p>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Dr. John Doe"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Specialization */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialization
          </label>
          <input
            type="text"
            placeholder="Cardiologist"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Degrees */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Degrees
          </label>
          <input
            type="text"
            placeholder="MBBS, FCPS"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="+92 3XX XXXXXXX"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Hospital Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hospital / Clinic Name
          </label>
          <input
            type="text"
            placeholder="Shifa International Hospital"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Experience */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            placeholder="5"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Available Slots */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Time Slots
          </label>
          <textarea
            rows={3}
            placeholder="Mon–Fri: 5pm – 9pm&#10;Sat: 10am – 2pm"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            You can write multiple slots
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Save Profile & Continue
        </button>
      </form>
    </div>
  );
}
