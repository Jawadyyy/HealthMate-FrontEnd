"use client";

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-green-700 text-white px-8 py-5">
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        <p className="text-sm text-green-100">
          Manage your health, appointments & records
        </p>
      </header>

      {/* Main Content */}
      <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Appointments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            My Appointments
          </h2>
          <p className="text-gray-600 text-sm">
            View upcoming & past appointments.
          </p>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View Appointments
          </button>
        </div>

        {/* Medical Records */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            Medical Records
          </h2>
          <p className="text-gray-600 text-sm">
            Access prescriptions & reports.
          </p>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            View Records
          </button>
        </div>

        {/* Profile */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            My Profile
          </h2>
          <p className="text-gray-600 text-sm">
            Update personal & medical details.
          </p>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Edit Profile
          </button>
        </div>

      </main>
    </div>
  );
}
