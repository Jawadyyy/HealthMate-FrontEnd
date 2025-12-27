"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  GraduationCap, 
  Phone, 
  Building, 
  Calendar, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Upload,
  MapPin,
  FileText,
  Languages,
  Award,
  BriefcaseMedical,
  Shield
} from "lucide-react";
import api from "@/lib/api/api";

interface DoctorProfile {
  _id?: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  phone: string;
  address: string;
  hospitalName: string;
  bio: string;
  languages: string[];
  certifications: string[];
  availableDays: string[];
  availableSlots: string[];
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LANGUAGES = ["English", "Urdu", "Arabic", "Spanish", "French", "German", "Chinese", "Other"];
const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
  "Neurology", "Oncology", "Ophthalmology", "Orthopedics", 
  "Pediatrics", "Psychiatry", "Radiology", "Surgery",
  "General Medicine", "Emergency Medicine", "Family Medicine"
];

export default function DoctorProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [profile, setProfile] = useState<DoctorProfile>({
    userId: "",
    specialization: "",
    qualification: "",
    experience: 0,
    consultationFee: 0,
    phone: "",
    address: "",
    hospitalName: "",
    bio: "",
    languages: [],
    certifications: [],
    availableDays: [],
    availableSlots: []
  });

  const [currentCertification, setCurrentCertification] = useState("");
  const [availableSlotsInput, setAvailableSlotsInput] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data.data || userResponse.data;
      
      setProfile(prev => ({
        ...prev,
        userId: userData._id
      }));

      // Check if profile already exists
      try {
        const profileResponse = await api.get('/doctors/me');
        const existingProfile = profileResponse.data.data || profileResponse.data;
        
        if (existingProfile) {
          setProfile({
            userId: existingProfile.userId || userData._id,
            specialization: existingProfile.specialization || "",
            qualification: existingProfile.qualification || "",
            experience: existingProfile.experience || 0,
            consultationFee: existingProfile.consultationFee || 0,
            phone: existingProfile.phone || "",
            address: existingProfile.address || "",
            hospitalName: existingProfile.hospitalName || "",
            bio: existingProfile.bio || "",
            languages: existingProfile.languages || [],
            certifications: existingProfile.certifications || [],
            availableDays: existingProfile.availableDays || [],
            availableSlots: existingProfile.availableSlots || [],
            profileImage: existingProfile.profileImage
          });
          
          // Set slots input
          if (existingProfile.availableSlots) {
            setAvailableSlotsInput(existingProfile.availableSlots.join(", "));
          }
        }
      } catch (error) {
        console.log("No existing profile found, creating new one");
      }
    } catch (error) {
      setError("Failed to load user data");
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DoctorProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleDay = (day: string) => {
    setProfile(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const toggleLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const addCertification = () => {
    if (currentCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, currentCertification.trim()]
      }));
      setCurrentCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSlotsInput = (value: string) => {
    setAvailableSlotsInput(value);
    const slots = value.split(",")
      .map(slot => slot.trim())
      .filter(slot => slot !== "");
    handleInputChange("availableSlots", slots);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("File size should be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const fileUrl = response.data.url || response.data._id;
      setProfile(prev => ({
        ...prev,
        profileImage: fileUrl
      }));
      setSuccess("Profile image uploaded successfully");
    } catch (error) {
      setError("Failed to upload image");
      console.error("Upload error:", error);
    }
  };

  const validateProfile = () => {
    if (!profile.specialization.trim()) {
      return "Specialization is required";
    }
    if (!profile.qualification.trim()) {
      return "Qualification is required";
    }
    if (profile.experience <= 0) {
      return "Please enter valid experience years";
    }
    if (profile.consultationFee <= 0) {
      return "Please enter valid consultation fee";
    }
    if (!profile.phone.trim()) {
      return "Phone number is required";
    }
    if (!profile.hospitalName.trim()) {
      return "Hospital name is required";
    }
    if (!profile.address.trim()) {
      return "Address is required";
    }
    if (profile.availableDays.length === 0) {
      return "Please select at least one available day";
    }
    if (profile.availableSlots.length === 0) {
      return "Please enter available time slots";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const profileData = {
        specialization: profile.specialization,
        qualification: profile.qualification,
        experience: profile.experience,
        consultationFee: profile.consultationFee,
        phone: profile.phone,
        address: profile.address,
        hospitalName: profile.hospitalName,
        bio: profile.bio,
        languages: profile.languages,
        certifications: profile.certifications,
        availableDays: profile.availableDays,
        availableSlots: profile.availableSlots,
        profileImage: profile.profileImage
      };

      let response;
      if (profile._id) {
        // Update existing profile
        response = await api.patch(`/doctors/update`, profileData);
        setSuccess("Profile updated successfully!");
      } else {
        // Create new profile
        response = await api.post(`/doctors/create`, profileData);
        setSuccess("Profile created successfully!");
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/doctor/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Profile submission error:", error);
      setError(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSubmitting(false);
    }
  };

  const skipSetup = () => {
    router.push("/doctor/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {profile._id ? "Complete Your Profile" : "Setup Your Doctor Profile"}
          </h1>
          <p className="text-gray-600">
            {profile._id 
              ? "Update your professional information and practice details"
              : "Complete your profile to start accepting appointments and managing patients"
            }
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Profile Setup Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {profile.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-green-600" />
                    )}
                  </div>
                  <label 
                    htmlFor="profile-upload"
                    className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gray-600" />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">Upload a professional profile photo</p>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <BriefcaseMedical className="w-4 h-4" />
                    <span>Specialization *</span>
                  </label>
                  <select
                    value={profile.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                    required
                  >
                    <option value="">Select your specialization</option>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Qualification */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Qualification *</span>
                  </label>
                  <input
                    type="text"
                    value={profile.qualification}
                    onChange={(e) => handleInputChange("qualification", e.target.value)}
                    placeholder="e.g., MBBS, MD, MS"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Experience (Years) *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profile.experience || ""}
                    onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Consultation Fee ($) *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.consultationFee || ""}
                    onChange={(e) => handleInputChange("consultationFee", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Hospital Name */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4" />
                    <span>Hospital/Clinic Name *</span>
                  </label>
                  <input
                    type="text"
                    value={profile.hospitalName}
                    onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                    placeholder="Your medical practice name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Practice Address *</span>
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Full address of your practice"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 resize-none"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Professional Bio</span>
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell patients about your expertise, experience, and approach..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                  <Languages className="w-4 h-4" />
                  <span>Languages Spoken</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {LANGUAGES.map(language => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => toggleLanguage(language)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${profile.languages.includes(language)
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4" />
                  <span>Certifications</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={currentCertification}
                      onChange={(e) => setCurrentCertification(e.target.value)}
                      placeholder="e.g., Board Certified, ACLS, etc."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCertification();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {profile.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                        >
                          <span>{cert}</span>
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Available Days */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Available Days *</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-200 ${profile.availableDays.includes(day)
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Time Slots */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Available Time Slots *</span>
                </label>
                <textarea
                  value={availableSlotsInput}
                  onChange={(e) => handleSlotsInput(e.target.value)}
                  placeholder="e.g., 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200 resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter time slots separated by commas (e.g., "9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM")
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={skipSetup}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 w-full sm:w-auto"
                >
                  Skip for Now
                </button>
                
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 w-full sm:w-auto"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </span>
                    ) : profile._id ? "Update Profile" : "Complete Setup"}
                  </button>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Your Information is Secure</p>
                    <p className="text-sm text-blue-700 mt-1">
                      All your professional information is stored securely and will only be used for 
                      patient appointments and medical records management.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${stepNum === 1 ? 'bg-green-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}