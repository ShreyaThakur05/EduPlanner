import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { saveToLocalStorage, getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import { PlusIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WeeklySchedule {
  [key: string]: any[];
}

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(() => {
    return user ? getFromLocalStorage(getStorageKey(user.id.toString(), 'schedule')) || {} : {};
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    day: 'Monday',
    start_time: '',
    end_time: '',
    location: ''
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 8; // Start from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await apiService.get('/dashboard/weekly-schedule');
        setWeeklySchedule(response.data);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCurrentDay = () => {
    return dayNames[new Date().getDay()];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass = {
      ...formData,
      color: '#3B82F6'
    };
    setWeeklySchedule(prev => {
      const updated = {
        ...prev,
        [formData.day]: [...(prev[formData.day] || []), newClass]
      };
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'schedule'), updated);
      return updated;
    });
    setFormData({ course_name: '', course_code: '', day: 'Monday', start_time: '', end_time: '', location: '' });
    setShowAddForm(false);
  };

  const deleteCourse = (day: string, index: number) => {
    setWeeklySchedule(prev => {
      const updated = {
        ...prev,
        [day]: prev[day].filter((_: any, i: number) => i !== index)
      };
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'schedule'), updated);
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600">Manage your weekly class timetable</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Course
        </button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Course Code</label>
                <input
                  type="text"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Day</label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {dayNames.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Room/Building"
                />
              </div>
              <div>
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Classes Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Classes ({getCurrentDay()})
        </h2>
        {weeklySchedule[getCurrentDay()] && weeklySchedule[getCurrentDay()].length > 0 ? (
          <div className="space-y-3">
            {weeklySchedule[getCurrentDay()]
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((classItem, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full mr-4"
                    style={{ backgroundColor: classItem.color }}
                  ></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{classItem.course_name}</h3>
                    <p className="text-sm text-gray-500">{classItem.course_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                    </p>
                    {classItem.location && (
                      <p className="text-sm text-gray-500">{classItem.location}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        )}
      </div>

      {/* Weekly Schedule Grid */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Schedule</h2>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-gray-500 p-2">Time</div>
              {dayNames.map((day) => (
                <div
                  key={day}
                  className={`text-sm font-medium p-2 text-center rounded-lg ${
                    day === getCurrentDay()
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-gray-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Schedule Grid */}
            <div className="space-y-1">
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 gap-2">
                  <div className="text-xs text-gray-500 p-2 font-medium">
                    {formatTime(timeSlot)}
                  </div>
                  {dayNames.map((day) => {
                    const dayClasses = weeklySchedule[day] || [];
                    const classAtTime = dayClasses.find((cls) => {
                      const classStart = cls.start_time;
                      const classEnd = cls.end_time;
                      return timeSlot >= classStart && timeSlot < classEnd;
                    });

                    return (
                      <div key={`${day}-${timeSlot}`} className="p-1">
                        {classAtTime ? (
                          <div
                            className="p-2 rounded text-xs text-white font-medium relative group"
                            style={{ backgroundColor: classAtTime.color }}
                          >
                            <div className="truncate">{classAtTime.course_code}</div>
                            {classAtTime.location && (
                              <div className="truncate opacity-75">
                                {classAtTime.location}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                const classIndex = dayClasses.findIndex(cls => cls === classAtTime);
                                deleteCourse(day, classIndex);
                              }}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-opacity duration-200"
                              title="Delete course"
                            >
                              <TrashIcon className="h-2 w-2 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-12 border border-gray-100 rounded"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(weeklySchedule).map(([day, classes]) =>
          classes.map((classItem, index) => (
            <div key={`${day}-${index}`} className="card p-4">
              <div className="flex items-center mb-3">
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: classItem.color }}
                ></div>
                <h3 className="font-medium text-gray-900">{classItem.course_name}</h3>
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Code:</span> {classItem.course_code}</p>
                  <p><span className="font-medium">Day:</span> {day}</p>
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                  </p>
                  {classItem.location && (
                    <p><span className="font-medium">Location:</span> {classItem.location}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteCourse(day, index)}
                  className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                  title="Delete course"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;