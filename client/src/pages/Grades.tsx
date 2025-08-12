import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { saveToLocalStorage, getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import { PlusIcon, AcademicCapIcon, TrophyIcon, ChartBarIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Grade {
  id: number;
  title: string;
  score: number;
  max_score: number;
  percentage: number;
  course_name: string;
  course_code: string;
  course_color: string;
  grade_date: string;
  weight: number;
}

interface GradeStats {
  courses: any[];
  overall: {
    total_courses: number;
    total_credits: number;
    gpa_4_scale: number;
    gpa_10_scale: number;
  };
}

const Grades: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>(() => {
    return user ? getFromLocalStorage(getStorageKey(user.id.toString(), 'grades')) || [] : [];
  });
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    course_name: '',
    score: '',
    max_score: '',
    weight: '1'
  });

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const [gradesResponse, statsResponse] = await Promise.all([
          apiService.get('/grades', {
            params: {
              courseId: selectedCourse === 'all' ? undefined : selectedCourse,
            },
          }),
          apiService.get('/grades/stats'),
        ]);
        
        setGrades(gradesResponse.data);
        setGradeStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to fetch grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [selectedCourse]);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success-600 bg-success-100';
    if (percentage >= 80) return 'text-primary-600 bg-primary-100';
    if (percentage >= 70) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGrade) {
      const updatedGrade: Grade = {
        ...editingGrade,
        title: formData.title,
        course_name: formData.course_name,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        weight: parseFloat(formData.weight),
        percentage: Math.round((parseFloat(formData.score) / parseFloat(formData.max_score)) * 100)
      };
      
      setGrades(prev => {
        const updated = prev.map(grade => 
          grade.id === editingGrade.id ? updatedGrade : grade
        );
        if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'grades'), updated);
        return updated;
      });
    } else {
      const newGrade: Grade = {
        id: Date.now(),
        ...formData,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        weight: parseFloat(formData.weight),
        percentage: Math.round((parseFloat(formData.score) / parseFloat(formData.max_score)) * 100),
        course_code: 'NEW',
        course_color: '#3B82F6',
        grade_date: new Date().toISOString()
      };
      
      setGrades(prev => {
        const updated = [...prev, newGrade];
        if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'grades'), updated);
        return updated;
      });
    }
    
    setFormData({ title: '', course_name: '', score: '', max_score: '', weight: '1' });
    setEditingGrade(null);
    setShowAddForm(false);
  };

  const deleteGrade = (id: number) => {
    setGrades(prev => {
      const updated = prev.filter(grade => grade.id !== id);
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'grades'), updated);
      return updated;
    });
  };

  const editGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      title: grade.title,
      course_name: grade.course_name,
      score: grade.score.toString(),
      max_score: grade.max_score.toString(),
      weight: grade.weight.toString()
    });
    setShowAddForm(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600">Track your academic performance</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Grade
        </button>
      </div>

      {/* Add Grade Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingGrade ? 'Edit Grade' : 'Add New Grade'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Assignment/Test Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
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
                <label className="form-label">Score Obtained</label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  className="form-input"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="form-label">Maximum Score</label>
                <input
                  type="number"
                  name="max_score"
                  value={formData.max_score}
                  onChange={handleInputChange}
                  className="form-input"
                  step="0.1"
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
                {editingGrade ? 'Update Grade' : 'Add Grade'}
              </button>
            </div>
          </form>
        </div>
      )}





      {/* Grades Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">All Grades</h2>
      </div>

      {/* Grades Table */}
      <div className="card overflow-hidden">
        {grades.length > 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{grade.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: grade.course_color }}
                        ></div>
                        <div className="text-sm text-gray-900">{grade.course_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.score}/{grade.max_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.percentage)}`}>
                        {grade.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(grade.percentage)}`}>
                        {getLetterGrade(grade.percentage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(grade.weight * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grade.grade_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editGrade(grade)}
                          className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1"
                          title="Edit grade"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteGrade(grade.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                          title="Delete grade"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
            <p className="text-gray-500 mb-4">
              {selectedCourse === 'all' 
                ? "You don't have any grades recorded yet." 
                : "No grades found for the selected course."}
            </p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Grade
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;