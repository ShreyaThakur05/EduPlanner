import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import {
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardData {
  todayClasses: any[];
  attendanceStats: any;
  upcomingAssignments: any[];
  recentGrades: any[];
  assignmentStats: any;
}

interface CurrentClass {
  course_name: string;
  course_code: string;
  color: string;
  start_time: string;
  end_time: string;
  location: string;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentClass, setCurrentClass] = useState<CurrentClass | null>(null);
  const [nextClass, setNextClass] = useState<CurrentClass | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [localData, setLocalData] = useState({
    assignments: [] as any[],
    grades: [] as any[],
    notes: [] as any[],
    schedule: {} as any,
    faculty: [] as any[]
  });

  useEffect(() => {
    const loadLocalData = () => {
      if (!user) return;
      
      const assignments = getFromLocalStorage(getStorageKey(user.id.toString(), 'assignments')) || [];
      const grades = getFromLocalStorage(getStorageKey(user.id.toString(), 'grades')) || [];
      const notes = getFromLocalStorage(getStorageKey(user.id.toString(), 'notes')) || [];
      const schedule = getFromLocalStorage(getStorageKey(user.id.toString(), 'schedule')) || {};
      const faculty = getFromLocalStorage(getStorageKey(user.id.toString(), 'faculty')) || [];
      
      setLocalData({ assignments, grades, notes, schedule, faculty });
      
      // Create dashboard data from local data
      const mockDashboardData: DashboardData = {
        todayClasses: getTodayClasses(schedule),
        upcomingAssignments: assignments.filter((a: any) => a.status !== 'completed').slice(0, 5),
        recentGrades: grades.slice(-3),
        attendanceStats: {
          total_courses: Object.keys(schedule).length,
          overall_attendance: 85
        },
        assignmentStats: {
          total_assignments: assignments.length,
          completed_assignments: assignments.filter((a: any) => a.status === 'completed').length,
          overdue_assignments: assignments.filter((a: any) => a.status === 'overdue').length
        }
      };
      
      setDashboardData(mockDashboardData);
      setLoading(false);
    };

    loadLocalData();
  }, [user]);
  
  const getTodayClasses = (schedule: any) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return schedule[today] || [];
  };
  
  const getCurrentClass = () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const todayClasses = getTodayClasses(localData.schedule);
    
    return todayClasses.find((cls: any) => {
      return currentTime >= cls.start_time && currentTime <= cls.end_time;
    });
  };
  
  const getNextClass = () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const todayClasses = getTodayClasses(localData.schedule);
    
    return todayClasses.find((cls: any) => {
      return currentTime < cls.start_time;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 80) return { color: 'success', text: 'Good' };
    if (percentage >= 75) return { color: 'warning', text: 'Warning' };
    return { color: 'danger', text: 'Critical' };
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntilDeadline = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffInHours = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h remaining`;
    } else {
      const days = Math.ceil(diffInHours / 24);
      return `${days}d remaining`;
    }
  };

  return (
    <div className="space-y-4 py-3">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-mint-600 rounded-lg p-4 text-white mb-4">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'Student'}!</h1>

        <p className="text-base text-mint-100">Here's what's happening with your studies today.</p>
      </div>

      {/* Current/Next Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Current Class */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Class</h2>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>
          {getCurrentClass() ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: getCurrentClass()?.color || '#3B82F6' }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">{getCurrentClass()?.course_name}</p>
                  <p className="text-sm text-gray-500">{getCurrentClass()?.course_code}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Time: {getCurrentClass()?.start_time} - {getCurrentClass()?.end_time}</p>
                {getCurrentClass()?.location && <p>Location: {getCurrentClass()?.location}</p>}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No class currently in session</p>
          )}
        </div>

        {/* Next Class */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Next Class</h2>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          {getNextClass() ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: getNextClass()?.color || '#3B82F6' }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">{getNextClass()?.course_name}</p>
                  <p className="text-sm text-gray-500">{getNextClass()?.course_code}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Time: {getNextClass()?.start_time} - {getNextClass()?.end_time}</p>
                {getNextClass()?.location && <p>Location: {getNextClass()?.location}</p>}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming classes today</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* Attendance */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{localData.assignments.length}</p>
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-mint-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Grades</p>
              <p className="text-2xl font-semibold text-gray-900">{localData.grades.length}</p>
            </div>
          </div>
        </div>

        {/* Completed Assignments */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-mint-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Notes</p>
              <p className="text-2xl font-semibold text-gray-900">{localData.notes.length}</p>
            </div>
          </div>
        </div>

        {/* Overdue Assignments */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Faculty Contacts</p>
              <p className="text-2xl font-semibold text-gray-900">{localData.faculty.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes & Upcoming Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Classes</h2>
          {dashboardData?.todayClasses && dashboardData.todayClasses.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.todayClasses.map((classItem, index) => (
                <div key={index} className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-primary-50 rounded-lg">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: classItem.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{classItem.course_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      {classItem.location && ` • ${classItem.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg text-gray-500">No classes scheduled for today</p>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
          {dashboardData?.upcomingAssignments && dashboardData.upcomingAssignments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-mint-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-sm text-gray-500">{assignment.course_name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      assignment.hours_remaining < 24 ? 'text-danger-600' : 
                      assignment.hours_remaining < 72 ? 'text-warning-600' : 'text-gray-600'
                    }`}>
                      {getTimeUntilDeadline(assignment.due_date)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium priority-${assignment.priority}`}>
                      {assignment.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg text-gray-500">No upcoming assignments</p>
          )}
        </div>
      </div>

      {/* Recent Grades */}
      {dashboardData?.recentGrades && dashboardData.recentGrades.length > 0 && (
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Grades</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.course_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.score}/{grade.max_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        grade.percentage >= 90 ? 'bg-success-100 text-success-800' :
                        grade.percentage >= 80 ? 'bg-primary-100 text-primary-800' :
                        grade.percentage >= 70 ? 'bg-warning-100 text-warning-800' :
                        'bg-danger-100 text-danger-800'
                      }`}>
                        {grade.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;