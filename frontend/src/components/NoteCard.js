import React from 'react';
import axios from 'axios';

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

const NoteCard = ({ note }) => {
  const handleDownload = async () => {
    try {
      console.log('Downloading note:', note._id);
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');

      const response = await api.get(`/api/notes/download/${note._id}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Download response received:', response.status);
      
      // Check if the response is actually a PDF
      if (response.data.type !== 'application/pdf') {
        throw new Error('Invalid file type received');
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', note.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Download failed: ' + (error.response?.data?.message || 'Please try again.'));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="note-card">
      <div className="note-header">
        <h3>{note.title}</h3>
        <span className="note-subject">{note.subject}</span>
      </div>
      
      <div className="note-details">
        <p><strong>University:</strong> {note.university}</p>
        <p><strong>Degree:</strong> {note.degree}</p>
        <p><strong>Semester:</strong> {note.semester}</p>
        {note.description && <p><strong>Description:</strong> {note.description}</p>}
      </div>
      
      <div className="note-meta">
        <span className="file-info">
          📄 {note.fileName} ({formatFileSize(note.fileSize)})
        </span>
        <span className="download-count">⬇️ {note.downloads} downloads</span>
      </div>
      
      <div className="note-footer">
        <span className="uploaded-by">
          Uploaded by {note.uploadedBy.name}
        </span>
        <button className="download-btn" onClick={handleDownload}>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default NoteCard;