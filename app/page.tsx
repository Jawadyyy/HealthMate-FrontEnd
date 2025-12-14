import Image from 'next/image';
import logoImage from '@/assets/logos/h-logo.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 overflow-x-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-40 -left-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-40"></div>
      </div>

      {/* Main content */}
      <main className="relative z-10">
        {/* HEADER */}
        <header className="w-full fixed top-0 left-0 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-xl blur-sm"></div>
                  <Image
                    src={logoImage}
                    alt="HealthMate Logo"
                    width={60}
                    height={60}
                    className="relative rounded-xl shadow-sm z-10" // Added z-10
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">HealthMate</h1>
                  <p className="text-sm text-gray-600">Digital Health Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">24/7 Available</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 mb-8">
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transforming Healthcare
              <span className="block text-green-700 mt-2">Through Digital Innovation</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              A unified platform connecting patients, healthcare providers, and administrators
              with secure access to medical records, appointments, and analytics — all designed
              for modern healthcare needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#portals"
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </a>
            </div>
          </div>
        </section>

        {/* PORTALS SECTION */}
        <section id="portals" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Access Your Portal</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Select your role to access the dedicated healthcare platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Patient Portal */}
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                  <span className="text-2xl">🧑‍💼</span>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">For Patients</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Portal</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Access your medical records, view prescriptions, schedule appointments, and track your health journey.
                </p>
                <a
                  href="auth/patient/login"
                  className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-center transition-colors duration-300"
                >
                  Enter Patient Portal
                </a>
              </div>
            </div>

            {/* Doctor Portal */}
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-6">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">For Doctors</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Doctor Portal</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Manage patient records, write prescriptions, schedule consultations, and access medical resources.
                </p>
                <a
                  href="auth/doctor/login"
                  className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-center transition-colors duration-300"
                >
                  Enter Doctor Portal
                </a>
              </div>
            </div>

            {/* Admin Portal */}
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-6">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">Administration</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin Portal</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Manage system operations, inventory, user accounts, billing, and platform analytics.
                </p>
                <a
                  href="auth/admin/login"
                  className="block w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-center transition-colors duration-300"
                >
                  Enter Admin Portal
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Health, Our Priority</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Immediate healthcare solutions when you need them most</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 24/7 Support Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Support</h3>
                <p className="text-gray-600 mb-6">Round-the-clock access to healthcare professionals. Get answers to your medical questions anytime, day or night.</p>
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  <span className="mr-2">Available now</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              {/* Book Appointment Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Book Appointment Today</h3>
                <p className="text-gray-600 mb-6">Schedule consultations with specialists in minutes. Same-day appointments available for urgent care needs.</p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <span className="mr-2">Schedule instantly</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>

              {/* Diagnose Issue Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Diagnose Issue Today</h3>
                <p className="text-gray-600 mb-6">AI-powered symptom checker and virtual consultations help identify potential conditions quickly and accurately.</p>
                <div className="flex items-center text-sm text-purple-600 font-medium">
                  <span className="mr-2">Get started now</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-center lg:text-left max-w-md">
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl blur-md opacity-60"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Image
                          src={logoImage} 
                          alt="HealthMate Logo"
                          width={55} 
                          height={55}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        HealthMate
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Digital Health Platform</p>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed mt-4">
                    A unified healthcare platform connecting patients, doctors, and administrators with
                    secure, seamless access to medical services and data analytics.
                  </p>

                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-300">Book Appointment Today</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-300">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-8">
                <div className="text-center lg:text-right">
                  <h4 className="text-lg font-semibold mb-4 text-white">Get in Touch</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center lg:justify-end gap-3">
                      <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">📧</span>
                      </div>
                      <span className="text-gray-300">healthmateofc@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-end gap-3">
                      <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">📞</span>
                      </div>
                      <span className="text-gray-300">+92 315 726 3823</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔒</span>
                      <span className="text-sm font-medium text-gray-300">SSL Secure</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏥</span>
                      <span className="text-sm font-medium text-gray-300">Certified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-16 mb-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800/50"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-6 bg-gray-900">
                  <span className="text-gray-500 text-sm">HEALTHCARE EXCELLENCE</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}