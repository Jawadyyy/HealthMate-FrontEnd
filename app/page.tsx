import Image from 'next/image';
import logoImage from '@/assets/logos/h-logo.png';
import heroImage from '@/assets/images/hospital.jpg';
import workingImage from '@/assets/images/working.jpg';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-white to-emerald-50/20"></div>
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230a7ea4' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '300px'
        }}></div>
      </div>

      <main className="relative z-10">
        <header className="w-full fixed top-0 left-0 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl blur-md opacity-60 group-hover:blur-lg transition-all duration-300"></div>
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 border border-blue-100/50">
                    <Image
                      src={logoImage}
                      alt="HealthMate Logo"
                      width={64}
                      height={64}
                      className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-emerald-800 bg-clip-text text-transparent">HealthMate</h1>
                  <p className="text-sm text-gray-600 font-medium mt-1">Digital Health Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 backdrop-blur-sm rounded-full border border-blue-100/50 shadow-sm">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-700 to-emerald-700 bg-clip-text text-transparent">24/7 Available</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="pt-40 pb-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-full border border-blue-200/50 mb-8 shadow-sm">
                  <span className="text-xl">🏥</span>
                  <span className="text-sm font-semibold text-gray-700">Premium Healthcare Solutions</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-[1.1]">
                  <span className="block">Transforming</span>
                  <span className="block mt-4 bg-gradient-to-r from-blue-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    Healthcare Delivery
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed mb-12 font-light max-w-2xl">
                  A unified healthcare platform connecting patients, doctors, and administrators with secure, seamless access to medical services and advanced analytics.
                </p>

                <div className="flex flex-col sm:flex-row gap-5">
                  <a
                    href="#portals"
                    className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      Get Started
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10"></div>
                  <Image
                    src={heroImage}
                    alt="Modern Hospital Facility"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="portals" className="py-24 px-6 bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Access Your Healthcare Portal</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">Secure, role-based access to our comprehensive healthcare platform</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl">👨‍⚕️</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-blue-100/90 backdrop-blur-sm text-blue-700 text-sm font-semibold rounded-full flex items-center gap-2">
                      <span className="text-base">🩺</span>
                      For Patients
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">📱</span>
                    Patient Portal
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Access your medical records, view prescriptions, schedule appointments with doctors, and track your health journey seamlessly.
                  </p>
                  <a
                    href="auth/patient/login"
                    className="block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl text-center transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group-hover:shadow-2xl"
                  >
                    <span className="flex items-center justify-center gap-3">
                      Enter Patient Portal
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl">👨‍⚕️</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-emerald-100/90 backdrop-blur-sm text-emerald-700 text-sm font-semibold rounded-full flex items-center gap-2">
                      <span className="text-base">⚕️</span>
                      For Doctors
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">💼</span>
                    Doctor Portal
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Manage patient records, write e-prescriptions, schedule consultations, and access medical research resources.
                  </p>
                  <a
                    href="auth/doctor/login"
                    className="block w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium rounded-xl text-center transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group-hover:shadow-2xl"
                  >
                    <span className="flex items-center justify-center gap-3">
                      Enter Doctor Portal
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl">👨‍💼</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-purple-100/90 backdrop-blur-sm text-purple-700 text-sm font-semibold rounded-full flex items-center gap-2">
                      <span className="text-base">🔧</span>
                      Administration
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    Admin Portal
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Manage hospital operations, medical inventory, user accounts, billing systems, and platform analytics.
                  </p>
                  <a
                    href="auth/admin/login"
                    className="block w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium rounded-xl text-center transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group-hover:shadow-2xl"
                  >
                    <span className="flex items-center justify-center gap-3">
                      Enter Admin Portal
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Comprehensive Healthcare Solutions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">Advanced features designed for modern healthcare delivery</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl">🌙</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-blue-100/90 backdrop-blur-sm text-blue-700 text-xs font-semibold rounded-full flex items-center gap-2">
                      <span className="text-sm">⏰</span>
                      Always Available
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🏥</span>
                    24/7 Medical Support
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Round-the-clock access to healthcare professionals and emergency support teams for immediate medical assistance.
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                    <span className="mr-3 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      Available now
                    </span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-green-500/30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl">📅</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-emerald-100/90 backdrop-blur-sm text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-2">
                      <span className="text-sm">⚡</span>
                      Quick Booking
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🗓️</span>
                    Instant Appointment Booking
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Schedule consultations with top specialists in minutes. Real-time availability and same-day appointments for urgent needs.
                  </p>
                  <div className="flex items-center text-emerald-600 font-semibold group-hover:text-emerald-700 transition-colors duration-300">
                    <span className="mr-3 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      Book instantly
                    </span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-violet-500/30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl">🩺</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-purple-100/90 backdrop-blur-sm text-purple-700 text-xs font-semibold rounded-full flex items-center gap-2">
                      <span className="text-sm">🔬</span>
                      Advanced Tools
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">💊</span>
                    Disease Diagnosis
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Comprehensive diagnostic tools and symptom analysis to help healthcare professionals provide accurate assessments and treatment plans.
                  </p>
                  <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-300">
                    <span className="mr-3 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      Learn more
                    </span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-4">
                <span className="text-5xl">🏥</span>
                Our Hospital Network
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">Connected with leading healthcare institutions nationwide</p>
            </div>

            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-16 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 z-10"></div>
              <Image
                src={workingImage}
                alt="Modern Hospital Network"
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'City General Hospital', emoji: '🏥' },
                { name: 'MediCare Center', emoji: '⚕️' },
                { name: 'University Medical', emoji: '🎓' },
                { name: 'Wellness Clinic', emoji: '💚' }
              ].map((hospital, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">{hospital.emoji}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{hospital.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-base">✓</span>
                    Partner Hospital
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
              <div className="max-w-lg">
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-emerald-600/40 rounded-2xl blur-xl"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Image
                        src={logoImage}
                        alt="HealthMate Logo"
                        width={56}
                        height={56}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">HealthMate</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Digital Health Platform</p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg font-light mb-8">
                  A comprehensive healthcare platform connecting patients, doctors, and administrators with secure, seamless access to medical services and advanced analytics.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 px-5 py-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-300 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      Easy to Use
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-300 flex items-center gap-2">
                      <span className="text-lg">🌙</span>
                      24/7 Support
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  Contact Information
                </h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-800/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-700/50 mt-1">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Email</p>
                      <p className="text-gray-300 font-semibold">healthmateofc@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-800/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-700/50 mt-1">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Phone</p>
                      <p className="text-gray-300 font-semibold">+92 315 726 3823</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-800/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-700/50 mt-1">
                      <span className="text-xl">🏥</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Headquarters</p>
                      <p className="text-gray-300 font-semibold">E9, Islamabad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-20 mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-8 bg-gray-900">
                  <span className="text-gray-500 text-sm font-medium tracking-wider flex items-center gap-2">
                    <span className="text-base">💚</span>
                    DIGITAL HEALTH RECORD SYSTEM
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p className="flex items-center justify-center gap-2">
                <span>©</span>
                <span>{new Date().getFullYear()}</span>
                <span>HealthMate Digital Health Platform. All rights reserved.</span>
                <span className="text-base">🏥</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}