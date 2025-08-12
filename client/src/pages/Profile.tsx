import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveToLocalStorage, getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import { CameraIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState(() => {
    if (user) {
      const saved = getFromLocalStorage(getStorageKey(user.id.toString(), 'profile'));
      return saved || {
        pronouns: '',
        phone: '',
        linkedin: '',
        github: '',
        website: '',
        collegeName: '',
        courseMajor: '',
        studentId: ''
      };
    }
    return {
    pronouns: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    collegeName: '',
    courseMajor: '',
      studentId: ''
    };
  });
  
  useEffect(() => {
    if (user) {
      const savedProfile = getFromLocalStorage(getStorageKey(user.id.toString(), 'profile'));
      const savedImage = getFromLocalStorage(getStorageKey(user.id.toString(), 'profileImage'));
      if (savedProfile) setProfileData(savedProfile);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = {
      ...profileData,
      [name]: value
    };
    setProfileData(updated);
    if (user) {
      saveToLocalStorage(getStorageKey(user.id.toString(), 'profile'), updated);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setProfileImage(imageData);
        if (user) {
          saveToLocalStorage(getStorageKey(user.id.toString(), 'profileImage'), imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (user) {
      saveToLocalStorage(getStorageKey(user.id.toString(), 'profile'), profileData);
      if (profileImage) {
        saveToLocalStorage(getStorageKey(user.id.toString(), 'profileImage'), profileImage);
      }
      alert('Profile saved successfully!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-base text-gray-600">Manage your account information and preferences</p>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : user?.firstName ? (
                <span className="text-2xl font-semibold text-gray-600">
                  {user.firstName.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              ) : (
                <CameraIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 cursor-pointer">
              <CameraIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <label className="btn-primary text-sm cursor-pointer">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={user?.firstName || ''}
              disabled
              className="form-input bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="form-label">Last Name</label>
            <input
              type="text"
              value={user?.lastName || ''}
              disabled
              className="form-input bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="form-label">Pronouns</label>
            <select
              name="pronouns"
              value={profileData.pronouns}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select pronouns</option>
              <option value="he/him">He/Him</option>
              <option value="she/her">She/Her</option>
              <option value="they/them">They/Them</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={profileData.linkedin}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="form-label">GitHub</label>
            <input
              type="url"
              name="github"
              value={profileData.github}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://github.com/username"
            />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Personal Website</label>
            <input
              type="url"
              name="website"
              value={profileData.website}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">College Name</label>
            <input
              type="text"
              name="collegeName"
              value={profileData.collegeName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter college name"
            />
          </div>
          <div>
            <label className="form-label">Course/Major</label>
            <input
              type="text"
              name="courseMajor"
              value={profileData.courseMajor}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter course or major"
            />
          </div>
          <div>
            <label className="form-label">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={profileData.studentId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter student ID"
            />
          </div>
        </div>
      </div>



      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;