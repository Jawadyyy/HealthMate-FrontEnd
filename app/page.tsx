import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white font-sans overflow-hidden text-green-900">
  {/* Background decorative elements in pharmacy theme */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/40 rounded-full blur-3xl opacity-50"></div>
    <div className="absolute top-1/3 -left-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl opacity-40"></div>
    <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-lime-200/30 rounded-full blur-3xl opacity-40"></div>
  </div>

      {/* GRID PATTERN OVERLAY */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MGI5OTMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wIDhoLTJ2LTJoMnYyem0wLTZoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')]" />
      </div>

      <main className="relative z-10 flex min-h-screen w-full max-w-6xl mx-auto flex-col items-center justify-between py-16 px-6 sm:px-8 md:px-12">

     {/* HEADER */}
<header className="w-full fixed top-0 left-0 flex flex-col md:flex-row justify-between items-center gap-8 px-8 py-6 bg-green-700 shadow-lg z-50">
  {/* Optional decorative overlay */}
  <div className="absolute inset-0 bg-green-800/30 blur-xl pointer-events-none"></div>

  <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
    <div className="relative">
      <div className="absolute inset-0 bg-green-600 rounded-2xl blur-md opacity-40"></div>
      <Image
        src="/logo.png"
        alt="Pharmacy Logo"
        width={80}
        height={80}
        className="relative rounded-2xl shadow-lg border-2 border-white/40"
      />
    </div>

    <div className="flex flex-col items-center sm:items-start gap-2">
      <h1 className="text-4xl sm:text-5xl font-bold text-white">
        HealthMate Digital Platform
      </h1>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <p className="text-sm font-medium text-white tracking-wide">
          Trusted Online Platform
        </p>
      </div>
    </div>
  </div>

  <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-sm relative z-10">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span className="text-sm font-medium text-white">Open & Serving</span>
    </div>
  </div>
</header>



        {/* HERO SECTION */}
<div className="flex flex-col items-center text-center max-w-4xl mx-auto mt-20 bg-white">
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/60 rounded-full border border-green-200 mb-6">
    <span className="text-sm font-medium text-green-800">💊 Certified Platform • 24/7 Support</span>
  </div>

  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-green-900 mb-6">
    Your Health,
    <span className="block bg-gradient-to-r from-green-700 to-lime-500 bg-clip-text text-transparent mt-2">
      Our First Priority
    </span>
  </h2>

  <p className="text-lg md:text-xl text-green-800 max-w-3xl leading-relaxed mb-8">
    A unified healthcare platform connecting patients, doctors, and administrators
          with seamless access to medical records, appointments, and analytics — all protected
          with enterprise grade security.
  </p>

  <a
    href="/"
    className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-green-700 to-lime-600 hover:from-green-800 hover:to-lime-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
  >
    Explore Services
  </a>
</div>


        {/* PORTALS SECTION */}
<div className="w-full max-w-5xl mt-16 mx-auto">
  <div className="text-center mb-10">
    <h3 className="text-2xl sm:text-3xl font-bold text-green-900 mb-3">Access Your Area</h3>
    <p className="text-green-700">Choose your portal to continue</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Patient Portal */}
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-800 to-green-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative p-8 rounded-3xl bg-green-900/80 backdrop-blur-xl border border-green-800/40 shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-green-800/40 rounded-2xl"><span className="text-2xl">🧪</span></div>
          <div className="text-xs font-medium px-3 py-1 bg-green-700/40 text-white rounded-full">For Customers</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Customer Portal</h3>
        <p className="text-white/80 mb-6 leading-relaxed">Check your orders, prescriptions, and wellness recommendations.</p>
        <div className="flex items-center justify-between">
          <a href="patient/login" className="px-6 py-3 bg-green-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:bg-green-800">Enter Portal</a>
          <span className="text-xs text-white/70">Secure Login →</span>
        </div>
      </div>
    </div>

    {/* Doctor Portal */}
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative p-8 rounded-3xl bg-emerald-900/80 backdrop-blur-xl border border-emerald-800/40 shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-emerald-800/40 rounded-2xl"><span className="text-2xl">🩺</span></div>
          <div className="text-xs font-medium px-3 py-1 bg-emerald-700/40 text-white rounded-full">For Providers</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Doctor Portal</h3>
        <p className="text-white/80 mb-6 leading-relaxed">Manage prescriptions and patient interactions efficiently.</p>
        <div className="flex items-center justify-between">
          <a href="doctor/login" className="px-6 py-3 bg-emerald-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:bg-emerald-800">Enter Portal</a>
          <span className="text-xs text-white/70">Professional Access →</span>
        </div>
      </div>
    </div>

    {/* Admin Portal */}
    <div className="md:col-span-2 group relative mt-4">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-700 to-lime-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative p-8 rounded-3xl bg-green-900/80 backdrop-blur-xl border border-green-800/40 shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-800/40 rounded-2xl"><span className="text-2xl">⚙️</span></div>
              <div className="text-xs font-medium px-3 py-1 bg-green-700/40 text-white rounded-full">Administration</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Admin Portal</h3>
            <p className="text-white/80 leading-relaxed">Manage system settings, inventory, branches, and billing.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/auth/login/admin" className="px-8 py-3 bg-gradient-to-r from-green-700 to-lime-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-green-800">Administrative Access</a>
            <span className="text-xs text-white/70 hidden md:block">Restricted 🔒</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* FEATURES */}
<div className="w-full max-w-4xl mt-20 mx-auto">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { icon: "💊", label: "Genuine Medicines" },
      { icon: "🚚", label: "Fast Delivery" },
      { icon: "📦", label: "Secure Packaging" },
      { icon: "⭐", label: "Trusted Service" }
    ].map((feature, index) => (
      <div 
        key={index} 
        className="flex flex-col items-center p-6 bg-green-900/80 backdrop-blur-sm rounded-2xl border border-green-800/40 shadow-lg"
      >
        <span className="text-3xl mb-2">{feature.icon}</span>
        <span className="text-sm font-medium text-white text-center">{feature.label}</span>
      </div>
    ))}
  </div>
</div>

{/* FOOTER */}
 <footer className="w-full mt-24 bg-green-700 text-white rounded-3xl p-8">
  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
    <div>
     <p className="font-bold text-lg">HealthMate </p>
     <p className="text-sm text-green-200">Trusted Healthcare Partner</p>
    </div>
  <div className="text-center text-sm text-green-200">
 © {new Date().getFullYear()} HealthMate. All rights reserved.
  </div>
   <div className="flex gap-4 text-sm">
    <button className="hover:text-green-200">Privacy Policy</button>
    <button className="hover:text-green-200">Terms of Service</button>
  </div>
 </div>
</footer> 

      </main>
    </div>
  );
}