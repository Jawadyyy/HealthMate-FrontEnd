# HealthMate – Frontend

HealthMate is a modern digital health record and healthcare management platform.
This repository contains the **frontend application**, responsible for delivering
a secure, responsive, and user-friendly interface for patients, doctors, and administrators.

---

## 🚀 Features

- 🔐 Secure authentication (Patient / Doctor / Admin)
- 📋 Digital health records management
- 🩺 Doctor profiles & patient medical history
- 📅 Appointment scheduling & management
- 💊 Prescriptions & medical reports
- 📊 Dashboard with health insights
- 📱 Responsive UI (mobile & desktop)

---

## 🛠 Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Bootstrap / React-Bootstrap
- **State Management:** React Context & Server Components
- **API Communication:** REST APIs
- **Authentication:** JWT-based authentication

---

## 📁 Project Structure
```
app/
├── admin/            # Admin panel
│   ├── dashboard
│   ├── doctors
│   ├── patients
│   └── billing
│
├── auth/             # Authentication flows
│   ├── admin
│   ├── doctor
│   └── patient
│
├── doctor/           # Doctor dashboard
│   ├── appointments
│   ├── patients
│   ├── prescriptions
│   ├── records
│   └── profile
│
├── patient/          # Patient dashboard
│   ├── appointments
│   ├── med-records
│   ├── prescriptions
│   └── profile
│
├── layout.tsx        # Root layout
└── page.tsx          # Landing page

components/           # Shared UI components
assets/               # Images & static assets

lib/                  # Core logic
├── api               # API calls
├── auth              # Auth helpers
├── hooks             # Custom hooks
└── utils             # Utility functions

```

---

## ⚙️ Environment Variables

Create a \`.env.local\` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_AUTH_TOKEN_KEY=healthmate_token
```

---

## 📦 Installation & Setup

# Clone the repository
git clone https://github.com/Jawadyyy/HealthMate-FrontEnd

# Navigate to project folder
cd healthmate-frontend

# Install dependencies
npm install

# Run development server
npm run dev

---

## 🧪 Scripts
```
npm run dev       # Start development server
```
```
npm run build     # Build for production
```
```
npm run start     # Start production server
```

---

## 🔗 Backend

# Backend repository:  
git clone https://github.com/Jawadyyy/HealthMate-BackEnd
