import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveToLocalStorage, getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import { PlusIcon, PhoneIcon, EnvelopeIcon, AcademicCapIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Faculty {
  id: string;
  subject: string;
  name: string;
  phone: string;
  email: string;
}

const Faculty: React.FC = () => {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState<Faculty[]>(() => {
    return user ? getFromLocalStorage(getStorageKey(user.id.toString(), 'faculty')) || [] : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    name: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFaculty: Faculty = {
      id: Date.now().toString(),
      ...formData
    };
    setFacultyList(prev => {
      const updated = [...prev, newFaculty];
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'faculty'), updated);
      return updated;
    });
    setFormData({ subject: '', name: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setFormData({ subject: '', name: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setFacultyList(prev => {
      const updated = prev.filter(faculty => faculty.id !== id);
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'faculty'), updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
          <p className="text-base text-gray-600">Manage your faculty contacts</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Add Faculty Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-white to-primary-50 rounded-lg shadow-card border border-primary-200 p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Faculty</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter subject"
                  required
                />
              </div>
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter faculty name"
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Add Faculty
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty List */}
      <div className="space-y-4">
        {facultyList.length === 0 ? (
          <div className="bg-gradient-to-br from-primary-50 to-mint-50 rounded-lg shadow-card border border-primary-200 p-3 text-center py-8">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty added yet</h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first faculty member to keep track of their contact information.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Faculty
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyList.map((faculty) => (
              <div key={faculty.id} className="bg-gradient-to-br from-white to-cream-50 rounded-lg shadow-card border border-cream-200 p-3 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="text-sm font-medium text-primary-600">{faculty.subject}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faculty.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        <a href={`tel:${faculty.phone}`} className="hover:text-primary-600">
                          {faculty.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        <a href={`mailto:${faculty.email}`} className="hover:text-primary-600">
                          {faculty.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(faculty.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                    title="Delete faculty"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Faculty;