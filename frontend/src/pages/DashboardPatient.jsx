import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MedicalRecords from '../components/MedicalRecords';
import SearchBar from '../components/SearchBar';

export default function DashboardPatient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      const [doctorsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        api.get('/users', { params: { role: 'doctor' } }),
        api.get('/appointments', { params: { patient: userId } }),
        userId ? api.get(`/prescriptions/${userId}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);
      setDoctors(doctorsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load patient data
  useEffect(() => {
    loadData();
  }, []);

  const bookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/appointments', {
        doctor: bookingForm.doctorId,
        datetime: `${bookingForm.date}T${bookingForm.time}`,
        reason: bookingForm.reason
      });
      setShowBooking(false);
      setBookingForm({ doctorId: '', date: '', time: '', reason: '' });
      // Reload appointments after booking
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <p className="text-cyan-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalAppointments: appointments.length,
    upcoming: appointments.filter(a => new Date(a.datetime) > new Date() && a.status !== 'cancelled').length,
    prescriptions: prescriptions.length,
    pendingPrescriptions: prescriptions.filter(p => p.status === 'pending' || p.status === 'ready').length
  };

  return (
    <div className="pt-24 px-6 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Patient Dashboard</h1>
        <p className="text-gray-400 mb-6">Manage your healthcare appointments and prescriptions</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-4 hover-lift">
            <div className="text-cyan-400 text-sm mb-1">Total Appointments</div>
            <div className="text-3xl font-bold text-white">{stats.totalAppointments}</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-4 hover-lift">
            <div className="text-green-400 text-sm mb-1">Upcoming</div>
            <div className="text-3xl font-bold text-white">{stats.upcoming}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 hover-lift">
            <div className="text-blue-400 text-sm mb-1">Prescriptions</div>
            <div className="text-3xl font-bold text-white">{stats.prescriptions}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4 hover-lift">
            <div className="text-yellow-400 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-white">{stats.pendingPrescriptions}</div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Appointments Section */}
        <section className="bg-[#09101A] p-6 rounded mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="uppercase text-sm text-white/70">My Appointments</h2>
            <button 
              onClick={() => setShowBooking(true)}
              className="btn-neon w-full md:w-auto"
            >
              Book New Appointment
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <SearchBar 
              placeholder="Search appointments..."
              onSearch={setSearchTerm}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#0B0E14] border border-gray-800 text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {appointments.length === 0 ? (
            <p className="text-white/60">No appointments scheduled</p>
          ) : (
            <div className="space-y-2">
              {appointments
                .filter(apt => {
                  const matchesSearch = !searchTerm || 
                    apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map(apt => (
                <div key={apt._id} className="bg-[#0B0E14] p-4 rounded">
                  <p className="text-cyan-400 font-semibold">Dr. {apt.doctor?.name || 'Unknown Doctor'}</p>
                  <p className="text-white/80">{new Date(apt.datetime).toLocaleString()}</p>
                  <p className="text-white/60 text-sm">{apt.reason}</p>
                  <span className={`text-sm mt-2 inline-block px-2 py-1 rounded ${
                    apt.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                    apt.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Booking Form */}
        {showBooking && (
          <div className="bg-[#09101A] p-6 rounded mb-6">
            <h2 className="uppercase text-sm text-white/70 mb-4">Book Appointment</h2>
            <form onSubmit={bookAppointment} className="space-y-4">
              <select
                value={bookingForm.doctorId}
                onChange={e => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                className="w-full p-2 rounded bg-[#0B0E14] border border-gray-800 text-white"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc._id || doc.id} value={doc._id || doc.id}>
                    Dr. {doc.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={bookingForm.date}
                onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                className="w-full p-2 rounded bg-[#0B0E14] border border-gray-800 text-white"
                required
              />
              <input
                type="time"
                value={bookingForm.time}
                onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                className="w-full p-2 rounded bg-[#0B0E14] border border-gray-800 text-white"
                required
              />
              <textarea
                value={bookingForm.reason}
                onChange={e => setBookingForm({ ...bookingForm, reason: e.target.value })}
                placeholder="Reason for appointment"
                className="w-full p-2 rounded bg-[#0B0E14] border border-gray-800 text-white"
                rows="3"
                required
              />
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBooking(false);
                    setBookingForm({ doctorId: '', date: '', time: '', reason: '' });
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-neon"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Medical Records Section */}
        <section className="bg-[#09101A] p-6 rounded mb-6">
          <MedicalRecords patientId={localStorage.getItem('userId')} canCreate={false} />
        </section>

        {/* Prescriptions Section */}
        <section className="bg-[#09101A] p-6 rounded">
          <h2 className="uppercase text-sm text-white/70 mb-4">My Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p className="text-white/60">No prescriptions available</p>
          ) : (
            <div className="space-y-2">
              {prescriptions.map(pres => (
                <div key={pres._id} className="bg-[#0B0E14] p-4 rounded">
                  <p className="text-cyan-400 font-semibold">Dr. {pres.doctor?.name || 'Unknown Doctor'}</p>
                  <p className="text-white/60 text-sm">{new Date(pres.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 space-y-1">
                    {pres.medications?.map((med, i) => (
                      <div key={i} className="text-white/80 text-sm">
                        • {med.name} - {med.dosage} {med.notes && `(${med.notes})`}
                      </div>
                    ))}
                  </div>
                  <span className={`text-sm mt-2 inline-block px-2 py-1 rounded ${
                    pres.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                    pres.status === 'filled' ? 'bg-green-900/30 text-green-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {pres.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
