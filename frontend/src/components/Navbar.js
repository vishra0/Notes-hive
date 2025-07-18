import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onShowAuth, onShowUpload }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo"> ⬢⬡⬢⬡ NOTES HIVE ⬢⬡⬢⬡</h1>
        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <span className="nav-user">Welcome, {user.name}</span>
              <button className="nav-btn" onClick={onShowUpload}>
                Upload Notes
              </button>
              <button className="nav-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={onShowAuth}>
              Login / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;