"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">HealthMate Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <DashboardCard title="Total Patients" value="245" />
        <DashboardCard title="Total Doctors" value="38" />
        <DashboardCard title="Appointments Today" value="19" />
        <DashboardCard title="Pending Approvals" value="7" />

      </main>

      {/* Management Section */}
      <section className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        <ActionCard title="Manage Doctors" desc="Approve, remove or update doctor profiles" />
        <ActionCard title="Manage Patients" desc="View and manage patient records" />
        <ActionCard title="View Reports" desc="System usage & health statistics" />

      </section>

    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold text-green-700 mt-2">{value}</p>
    </div>
  );
}

function ActionCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-green-700">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{desc}</p>
      <button className="mt-4 text-green-600 font-semibold hover:underline">
        Open →
      </button>
    </div>
  );
}
