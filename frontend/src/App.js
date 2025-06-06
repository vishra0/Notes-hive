import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Home from './components/Home';
import './App.css';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <AuthProvider>
      <div className="App">
        <Navbar 
          onShowAuth={() => setShowAuth(true)}
          onShowUpload={() => setShowUpload(true)}
        />
        
        {showAuth && (
          <Auth onClose={() => setShowAuth(false)} />
        )}
        
        <Home 
          showUpload={showUpload}
          onHideUpload={() => setShowUpload(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;