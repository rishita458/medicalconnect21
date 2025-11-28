import React, { useState } from 'react';
import api, { setToken } from '../services/api'; // Check that setToken is exported from api.js
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed and Router is set up

export default function LoginSignup() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', profile: {} });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function validateForm() {
    if (!form.email || !form.email.includes('@')) {
      setErr('Please enter a valid email');
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setErr('Password must be at least 6 characters');
      return false;
    }
    if (mode === 'signup' && !form.name) {
      setErr('Name is required');
      return false;
    }
    return true;
  }

  function onChange(e) {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, profile: { ...f.profile, [key]: value } }));
    } else setForm(f => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const payload = mode === 'signup' ? form : {
        email: form.email,
        password: form.password,
        role: form.role
      };
      
      const res = await api.post(endpoint, payload);
      const { token, user } = res.data;
      
      // Store both token and role
      setToken(token, user.role, user);
      
      // Redirect based on role
      const dashboardRoutes = {
        patient: '/dashboard/patient',
        doctor: '/dashboard/doctor',
        pharmacist: '/dashboard/pharmacist',
        admin: '/dashboard/admin'
      };
      
      const redirectPath = dashboardRoutes[user.role] || '/dashboard/patient';
      nav(redirectPath, { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || 
        'Login failed. Please check your credentials.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0B0E14] via-[#09101A] to-[#0B0E14]">
      <div className="w-full max-w-md bg-[#09101A] border border-cyan-500/20 p-8 rounded-xl shadow-2xl shadow-cyan-500/10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 gradient-text">MedConnect</h2>
          <p className="text-gray-400 text-sm">Your healthcare management platform</p>
        </div>
        <div className="mb-6 flex gap-2 bg-[#0B0E14] p-1 rounded-lg">
          <button 
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
              mode === 'login' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`} 
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all ${
              mode === 'signup' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`} 
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode==='signup' && (
            <>
              <input name="name" value={form.name} onChange={onChange} placeholder="Full name" className="w-full p-3 rounded-lg bg-[#0B0E14] border border-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"/>
            </>
          )}
          <select name="role" value={form.role} onChange={onChange} className="w-full p-3 rounded-lg bg-[#0B0E14] border border-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">Admin</option>
          </select>

          {form.role === 'doctor' && mode === 'signup' && (
            <>
              <input name="profile.specialty" value={form.profile.specialty||''} onChange={onChange} placeholder="Specialty" className="w-full p-3 rounded-lg bg-[#0B0E14] border border-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"/>
              <input name="profile.licenseNumber" value={form.profile.licenseNumber||''} onChange={onChange} placeholder="License #" className="w-full p-3 rounded-lg bg-[#0B0E14] border border-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"/>
            </>
          )}

          <input name="email" value={form.email} onChange={onChange} placeholder="Email" className="w-full p-3 rounded-lg bg-[#0B0E14] border border-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"/>
          <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password" className="w-full p-3 rounded-lg bg-[#0B0E14] border border-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"/>
          {err && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-sm">
              {err}
            </div>
          )}
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`btn-neon ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
