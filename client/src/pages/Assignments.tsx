import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { saveToLocalStorage, getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import { PlusIcon, ClockIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  course_name: string;
  course_code: string;
  course_color: string;
  hours_remaining?: number;
}

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    return user ? getFromLocalStorage(getStorageKey(user.id.toString(), 'assignments')) || [] : [];
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('due_date');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    course_name: '',
    course_code: ''
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await apiService.get('/assignments', {
          params: {
            status: filter === 'all' ? undefined : filter,
            sortBy,
            sortOrder: 'ASC',
          },
        });
        setAssignments(response.data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [filter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      case 'overdue':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger-100 text-danger-800';
      case 'medium':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 0) {
      return 'Overdue';
    } else if (diffInHours < 24) {
      return `${diffInHours}h remaining`;
    } else {
      const days = Math.ceil(diffInHours / 24);
      return `${days}d remaining`;
    }
  };

  const updateAssignmentStatus = (id: number, status: Assignment['status']) => {
    setAssignments(prev => {
      const updated = prev.map(assignment => {
        if (assignment.id === id) {
          // Check if assignment should be overdue
          const dueDate = new Date(assignment.due_date);
          const now = new Date();
          let newStatus = status;
          
          if (status !== 'completed' && dueDate < now) {
            newStatus = 'overdue';
          }
          
          return { ...assignment, status: newStatus };
        }
        return assignment;
      });
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'assignments'), updated);
      return updated;
    });
  };

  const deleteAssignment = (id: number) => {
    setAssignments(prev => {
      const updated = prev.filter(assignment => assignment.id !== id);
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'assignments'), updated);
      return updated;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = new Date(formData.due_date);
    const now = new Date();
    let status: Assignment['status'] = 'pending';
    
    // Auto-set status to overdue if due date has passed
    if (dueDate < now) {
      status = 'overdue';
    }
    
    const newAssignment: Assignment = {
      id: Date.now(),
      ...formData,
      status,
      course_color: '#3B82F6',
      hours_remaining: Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    };
    setAssignments(prev => {
      const updated = [...prev, newAssignment];
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'assignments'), updated);
      return updated;
    });
    setFormData({ title: '', description: '', due_date: '', priority: 'medium', course_name: '', course_code: '' });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getFilteredAndSortedAssignments = () => {
    let filtered = assignments;
    
    // Apply filter
    if (filter !== 'all') {
      if (filter === 'overdue') {
        filtered = assignments.filter(assignment => {
          const dueDate = new Date(assignment.due_date);
          const now = new Date();
          return dueDate < now && assignment.status !== 'completed';
        });
      } else {
        filtered = assignments.filter(assignment => assignment.status === filter);
      }
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);

        default:
          return 0;
      }
    });
    
    return sorted;
  };
  
  const filteredAssignments = getFilteredAndSortedAssignments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-base text-gray-600">Track and manage your homework and projects</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-success-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-warning-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assignments.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {assignments.filter(a => a.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Assignment Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Assignment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Title</label>
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
                <label className="form-label">Course</label>
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
                <label className="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                rows={3}
              />
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
                Add Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: assignment.course_color }}
                    ></div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {assignment.title}
                    </h3>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {assignment.course_name} ({assignment.course_code})
                  </p>
                  
                  {assignment.description && (
                    <p className="text-sm text-gray-700 mb-3">{assignment.description}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span className={assignment.status === 'overdue' ? 'text-danger-600 font-medium' : ''}>
                      Due: {new Date(assignment.due_date).toLocaleDateString()} - {formatDueDate(assignment.due_date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status.replace('_', ' ')}
                  </span>
                  
                  <select
                    value={assignment.status}
                    onChange={(e) => updateAssignmentStatus(assignment.id, e.target.value as Assignment['status'])}
                    className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                    title="Delete assignment"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="bg-gradient-to-br from-primary-50 to-mint-50 rounded-lg p-6 text-center">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-lg text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You don't have any assignments yet. Get started by creating your first assignment to track your homework and projects." 
                  : `No ${filter.replace('_', ' ')} assignments found.`}
              </p>
              <button onClick={() => setShowAddForm(true)} className="btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;