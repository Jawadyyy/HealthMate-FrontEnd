"use client";

import { useState } from "react";
import styles from "../../auth.module.css";

export default function PatientProfileSetup() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    medicalConditions: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white px-4 py-8 ${styles.themePatient}`}>
      
      {/* Centered Container */}
      <div className="w-full max-w-xl flex flex-col items-center justify-center">
        
        {/* Form Card - Centered */}
        <div className="bg-white w-full rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Fixed Header */}
          <div className="p-8 border-b border-gray-100 bg-white text-center">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
              Patient Profile Setup
            </h2>
            <p className="text-sm text-gray-500">
              Complete your personal and medical information
            </p>
          </div>

          {/* Scrollable Form Content */}
          <div className="max-h-[60vh] overflow-y-auto px-8 py-6">
            <form onSubmit={handleSubmit}>
              {/* Age */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  placeholder="Street, City, Country"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Emergency Contact Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyName"
                  placeholder="Ali Khan"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Emergency Contact Phone */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Medical Conditions */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <textarea
                  name="medicalConditions"
                  rows={3}
                  placeholder="Diabetes, Blood Pressure, Asthma (if any)"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#f7f7f7',
                    borderColor: '#ddd'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p className="text-xs text-gray-400 mt-2">
                  You can add multiple conditions separated by commas
                </p>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 bg-white pt-6 pb-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(to right, var(--primary), var(--primary-dark))'
                  }}
                >
                  Save Profile & Continue
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Optional: Additional centered content below the form */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All information is kept confidential and secure</p>
        </div>
        
      </div>
    </div>
  );
}