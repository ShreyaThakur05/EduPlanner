import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { saveToLocalStorage, getFromLocalStorage, getStorageKey } from '../utils/localStorage';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Note {
  id: number;
  title: string;
  content: string;
  file_url: string;
  file_type: string;
  tags: string[];
  course_name: string;
  course_code: string;
  course_color: string;
  created_at: string;
}

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(() => {
    return user ? getFromLocalStorage(getStorageKey(user.id.toString(), 'notes')) || [] : [];
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course_name: '',
    tags: '',
    file: null as File | null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesResponse, tagsResponse, coursesResponse] = await Promise.all([
          apiService.get('/notes', {
            params: {
              search: searchTerm || undefined,
              tags: selectedTags.length > 0 ? selectedTags : undefined,
              courseId: selectedCourse === 'all' ? undefined : selectedCourse,
            },
          }),
          apiService.get('/notes/tags'),
          apiService.get('/courses'),
        ]);
        
        setNotes(notesResponse.data);
        setAllTags(tagsResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Failed to fetch notes data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedTags, selectedCourse]);

  const handleDownload = async (noteId: number, title: string) => {
    try {
      await apiService.downloadFile(`/notes/${noteId}/download`, `${title}.pdf`);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📊';
    return '📄';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Note = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      course_name: formData.course_name,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      course_code: 'NEW',
      course_color: '#3B82F6',
      file_url: formData.file ? URL.createObjectURL(formData.file) : '',
      file_type: formData.file?.type || '',
      created_at: new Date().toISOString()
    };
    setNotes(prev => {
      const updated = [...prev, newNote];
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'notes'), updated);
      return updated;
    });
    setFormData({ title: '', content: '', course_name: '', tags: '', file: null });
    setShowAddForm(false);
  };

  const deleteNote = (id: number) => {
    setNotes(prev => {
      const updated = prev.filter(note => note.id !== id);
      if (user) saveToLocalStorage(getStorageKey(user.id.toString(), 'notes'), updated);
      return updated;
    });
  };

  const getFilteredNotes = () => {
    let filtered = notes;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.some(selectedTag => note.tags.includes(selectedTag))
      );
    }
    
    return filtered;
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
          <h1 className="text-2xl font-bold text-gray-900">Notes Repository</h1>
          <p className="text-gray-600">Organize and manage your study materials</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Note</h2>
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
            </div>
            <div>
              <label className="form-label">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-input"
                rows={4}
                placeholder="Enter your note content..."
              />
            </div>
            <div>
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="form-input"
                placeholder="study, important, exam"
              />
            </div>
            <div>
              <label className="form-label">Attach File (optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="form-input"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, PPT, Images up to 50MB</p>
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
                Add Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-end space-x-4 text-sm text-gray-500">
            <span>{getFilteredNotes().length} of {notes.length} notes</span>
            <span>{allTags.length} tags</span>
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredNotes().length > 0 ? (
          getFilteredNotes().map((note) => (
            <div key={note.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Course Badge */}
              <div className="flex items-center mb-3">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: note.course_color }}
                ></div>
                <span className="text-xs font-medium text-gray-500">
                  {note.course_code}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                {note.title}
              </h3>

              {/* Content Preview */}
              {note.content && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {note.content}
                </p>
              )}

              {/* File Info */}
              {note.file_url && (
                <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg mr-2">{getFileIcon(note.file_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Attached File
                    </p>
                    <p className="text-xs text-gray-500">
                      {note.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(note.id, note.title)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Download file"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1"
                    title="Delete note"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              {searchTerm || selectedTags.length > 0 ? (
                <>
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTags([]);
                    }}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start building your notes repository by adding your first note.
                  </p>
                  <button onClick={() => setShowAddForm(true)} className="btn-primary">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Note
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {notes.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {notes.length}
              </div>
              <div className="text-sm text-gray-500">Total Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {notes.filter(n => n.file_url).length}
              </div>
              <div className="text-sm text-gray-500">With Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">
                {allTags.length}
              </div>
              <div className="text-sm text-gray-500">Unique Tags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(notes.map(n => n.course_code)).size}
              </div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;