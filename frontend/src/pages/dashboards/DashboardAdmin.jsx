import React, { useState, useEffect } from 'react';
import api, { approveAppointment } from '../../services/api';

export default function DashboardAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, appointmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/appointments')
      ]);
      const usersData = usersRes.data || [];
      const appointmentsData = appointmentsRes.data || [];
      
      setUsers(usersData);
      setAppointments(appointmentsData);
      
      setStats({
        totalUsers: usersData.length,
        totalAppointments: appointmentsData.length,
        totalDoctors: usersData.filter(u => u.role === 'doctor').length,
        totalPatients: usersData.filter(u => u.role === 'patient').length
      });
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <p className="text-cyan-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Admin Dashboard</h1>
        <p className="text-gray-400 mb-6">Manage users, appointments, and system overview</p>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-6 hover-lift">
            <h3 className="text-sm text-cyan-400 mb-2 font-semibold">Total Users</h3>
            <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-6 hover-lift">
            <h3 className="text-sm text-blue-400 mb-2 font-semibold">Appointments</h3>
            <p className="text-4xl font-bold text-white">{stats.totalAppointments}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-6 hover-lift">
            <h3 className="text-sm text-green-400 mb-2 font-semibold">Doctors</h3>
            <p className="text-4xl font-bold text-white">{stats.totalDoctors}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-6 hover-lift">
            <h3 className="text-sm text-purple-400 mb-2 font-semibold">Patients</h3>
            <p className="text-4xl font-bold text-white">{stats.totalPatients}</p>
          </div>
        </div>

        {/* Users Section */}
        <section className="bg-[#09101A] p-6 rounded mb-6">
          <h2 className="uppercase text-sm text-white/70 mb-4">All Users</h2>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user._id || user.id} className="bg-[#0B0E14] p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-cyan-400 font-semibold">{user.name}</p>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                  <span className="px-3 py-1 rounded bg-cyan-900/30 text-cyan-400 text-sm uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Appointments Section */}
        <section className="bg-[#09101A] p-6 rounded">
          <h2 className="uppercase text-sm text-white/70 mb-4">All Appointments</h2>
          <div className="space-y-2">
            {appointments.length === 0 ? (
              <p className="text-white/60">No appointments</p>
            ) : (
              appointments.map(apt => (
                <div key={apt._id} className="bg-[#0B0E14] p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white/80">
                        <span className="text-cyan-400">{apt.patient?.name || 'Unknown Patient'}</span>
                        {' with '}
                        <span className="text-cyan-400">{apt.doctor?.name || 'Unknown Doctor'}</span>
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(apt.datetime).toLocaleString()}
                      </p>
                      <p className="text-white/60 text-sm">{apt.reason}</p>
                      {apt.approvedBy && (
                        <p className="text-white/50 text-xs mt-1">
                          Approved by: {apt.approvedBy?.name || 'Admin/Doctor'}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      apt.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      apt.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                      apt.status === 'completed' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  {apt.status === 'pending' && (
                    <button
                      onClick={async () => {
                        setError('');
                        try {
                          const response = await approveAppointment(apt._id);
                          if (response.data) {
                            await loadData();
                          }
                        } catch (err) {
                          const errorMsg = err?.response?.data?.message || err?.message || 'Failed to approve appointment';
                          setError(errorMsg);
                          console.error('Approval error:', err);
                        }
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm mt-2"
                    >
                      Approve Appointment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

