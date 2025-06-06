import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoteCard from './NoteCard';
import { useAuth } from '../context/AuthContext';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Home = ({ showUpload, onHideUpload }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    degree: '',
    semester: '',
    subject: '',
    search: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    universities: [],
    degrees: [],
    semesters: [],
    subjects: []
  });
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    university: '',
    degree: '',
    semester: '',
    subject: '',
    file: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchNotes();
    fetchFilterOptions();
  }, [filters]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/api/notes?${params}`);
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
    setLoading(false);
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/api/notes/filters');
      setFilterOptions(response.data.filters);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleUploadChange = (e) => {
    if (e.target.name === 'file') {
      setUploadData({
        ...uploadData,
        file: e.target.files[0]
      });
    } else {
      setUploadData({
        ...uploadData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    const formData = new FormData();
    Object.keys(uploadData).forEach(key => {
      if (uploadData[key]) {
        formData.append(key, uploadData[key]);
      }
    });

    try {
      console.log('Uploading file:', uploadData.file);
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await api.post('/api/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Upload response:', response.data);
      alert('Note uploaded successfully!');
      setUploadData({
        title: '',
        description: '',
        university: '',
        degree: '',
        semester: '',
        subject: '',
        file: null
      });
      onHideUpload();
      fetchNotes();
      fetchFilterOptions();
    } catch (error) {
      console.error('Upload error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      alert('Upload failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
    
    setUploadLoading(false);
  };

  const clearFilters = () => {
    setFilters({
      university: '',
      degree: '',
      semester: '',
      subject: '',
      search: ''
    });
  };

  return (
    <div className="home-container">
      {showUpload && isAuthenticated && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="upload-header">
              <h2>Upload Notes</h2>
              <button className="close-btn" onClick={onHideUpload}>×</button>
            </div>
            
            <form onSubmit={handleUpload}>
              <input
                type="text"
                name="title"
                placeholder="Note Title"
                value={uploadData.title}
                onChange={handleUploadChange}
                required
              />
              
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={uploadData.description}
                onChange={handleUploadChange}
              />
              
              <input
                type="text"
                name="university"
                placeholder="University"
                value={uploadData.university}
                onChange={handleUploadChange}
                required
              />
              
              <input
                type="text"
                name="degree"
                placeholder="Degree"
                value={uploadData.degree}
                onChange={handleUploadChange}
                required
              />
              
              <input
                type="text"
                name="semester"
                placeholder="Semester"
                value={uploadData.semester}
                onChange={handleUploadChange}
                required
              />
              
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={uploadData.subject}
                onChange={handleUploadChange}
                required
              />
              
              <input
                type="file"
                name="file"
                accept=".pdf"
                onChange={handleUploadChange}
                required
              />
              
              <button type="submit" disabled={uploadLoading}>
                {uploadLoading ? 'Uploading...' : 'Upload Note'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="filters-section">
        <h2>Search Academic Notes</h2>
        <div className="filters-grid">
          <input
            type="text"
            name="search"
            placeholder="Search notes..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          
          <select name="university" value={filters.university} onChange={handleFilterChange}>
            <option value="">All Universities</option>
            {filterOptions.universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          
          <select name="degree" value={filters.degree} onChange={handleFilterChange}>
            <option value="">All Degrees</option>
            {filterOptions.degrees.map(deg => (
              <option key={deg} value={deg}>{deg}</option>
            ))}
          </select>
          
          <select name="semester" value={filters.semester} onChange={handleFilterChange}>
            <option value="">All Semesters</option>
            {filterOptions.semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
          
          <select name="subject" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            {filterOptions.subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="notes-section">
        {loading ? (
          <div className="loading">Loading notes...</div>
        ) : (
          <>
            <div className="notes-header">
              <h3>Available Notes ({notes.length})</h3>
            </div>
            
            {notes.length === 0 ? (
              <div className="no-notes">
                No notes found. Try adjusting your filters or be the first to upload!
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map(note => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;