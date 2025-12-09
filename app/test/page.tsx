"use client";
import useUser from "@/lib/hooks/useUser";
import api from "@/lib/api/api";
import { useEffect, useState } from "react";

export default function TestPatientPage() {
  const { user } = useUser();     // to check authentication
  const [patientData, setPatientData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get("/patients/me");
        setPatientData(res.data);
      } catch (err: any) {
        setError("Could not fetch patient data. Maybe not logged in?");
      }
    };
    fetchPatient();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Patient API Test</h1>

      {!user && <p className="text-red-500">⚠ You are not logged in</p>}

      {error && <p className="text-red-600">{error}</p>}

      {patientData ? (
        <pre className="bg-gray-100 p-5 rounded">{JSON.stringify(patientData, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
