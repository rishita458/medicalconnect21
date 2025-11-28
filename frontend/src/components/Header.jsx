import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Header() {  // Remove user prop since we're using localStorage
  const nav = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    nav('/auth');
  };

  return (
    <header className="header fixed w-full top-0 left-0 z-30">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="logo text-xl">MedConnect</div>
        </Link>
        
        <nav className="flex items-center gap-6">
          {!userRole ? (
            <>
              <Link to="/" className="text-white/80 hover:text-cyan-400 transition-colors">Home</Link>
              <Link to="/auth" className="text-white/80 hover:text-cyan-400 transition-colors">Sign In</Link>
              <Link to="/auth" className="btn-neon">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={`/dashboard/${userRole}`} className="text-white/80 hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-3 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <span className="text-cyan-400 text-sm font-medium">
                  {userName || 'User'}
                </span>
                <span className="text-gray-400 text-xs">
                  ({userRole})
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-white/80 hover:text-white hover:bg-red-500/10 rounded transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
