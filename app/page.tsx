import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 font-sans overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-cyan-100 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-sky-100 dark:bg-sky-900/20 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4NmI3ZjEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wIDhoLTJ2LTJoMnYyem0wLTZoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 dark:opacity-10"></div>

      <main className="relative z-10 flex min-h-screen w-full max-w-6xl mx-auto flex-col items-center justify-between py-16 px-6 sm:px-8 md:px-12">

        {/* HEADER SECTION */}
        <header className="w-full flex flex-col md:flex-row justify-between items-center gap-8 pt-8">
          {/* Logo + Title */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-md opacity-50"></div>
              <Image
                src="/logo.png"
                alt="HealthMate Logo"
                width={80}
                height={80}
                className="relative rounded-2xl shadow-lg border-2 border-white/50"
              />
            </div>
            <div className="flex flex-col items-center sm:items-start gap-2">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                HealthMate
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide">
                  Secure Healthcare Platform
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                System Operational
              </span>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 mb-6">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              🔐 HIPAA Compliant • End-to-End Encrypted
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white mb-6">
            Your Health Data,
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mt-2">
              Securely Connected
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed mb-8">
            A unified healthcare platform connecting patients, doctors, and administrators with 
            seamless access to medical records, appointments, and analytics — all protected with 
            enterprise-grade security.
          </p>
        </div>

        {/* PORTALS SECTION */}
        <div className="w-full max-w-5xl mt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
              Access Your Portal
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select your role to continue to the secure login
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Portal */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    For Patients
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Patient Portal
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Access your medical history, upcoming appointments, prescriptions, 
                  and lab results in one secure dashboard.
                </p>
                <div className="flex items-center justify-between">
                  <a
                    href="/auth/login/patient"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Enter Portal
                  </a>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Secure Login →
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Portal */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl">
                    <span className="text-2xl">🩺</span>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                    For Healthcare Providers
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Doctor Portal
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Manage patient consultations, update medical records, 
                  prescribe medications, and view schedules efficiently.
                </p>
                <div className="flex items-center justify-between">
                  <a
                    href="/auth/login/doctor"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Enter Portal
                  </a>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Professional Access →
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Portal - Full Width */}
            <div className="md:col-span-2 group relative mt-4">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-2xl">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <div className="text-xs font-medium px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                        System Administration
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Admin Portal
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Comprehensive system management, user administration, 
                      hospital analytics, billing oversight, and security configuration.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href="/auth/login/admin"
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      Administrative Access
                    </a>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                      Restricted Access 🔒
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES BAR */}
        <div className="w-full max-w-4xl mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🔒", label: "End-to-End Encryption" },
              { icon: "📊", label: "Real-time Analytics" },
              { icon: "🤝", label: "HIPAA Compliant" },
              { icon: "⚡", label: "Instant Sync" }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <span className="text-2xl mb-2">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full mt-20 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl"></div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">HealthMate</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Digital Health Record System
                </p>
              </div>
            </div>
            
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p className="text-sm">
                © {new Date().getFullYear()} HealthMate Technologies. All rights reserved.
              </p>
              <p className="text-xs mt-2">
                Built with privacy and security at our core
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Privacy Policy
              </button>
              <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Terms of Service
              </button>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}