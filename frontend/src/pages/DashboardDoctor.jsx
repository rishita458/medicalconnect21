import React, { useState, useEffect } from 'react';
import api, { approveAppointment, completeAppointment, createPrescription } from '../services/api';
import MedicalRecords from '../components/MedicalRecords';
import SearchBar from '../components/SearchBar';

export default function DashboardDoctor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [{ name: '', dosage: '', notes: '' }]
  });
  
  const stats = {
    totalAppointments: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    totalPatients: patients.length,
    totalPrescriptions: prescriptions.length
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }
      
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }
      
      console.log('Loading doctor data for userId:', userId);
      
      // Fetch data sequentially with better error handling
      let apptsRes, patientsRes, presRes;
      
      try {
        apptsRes = await api.get('/appointments', { params: { doctor: userId } });
        console.log('Appointments loaded:', apptsRes.data?.length || 0);
      } catch (err) {
        console.error('Error loading appointments:', err);
        apptsRes = { data: [] };
      }
      
      try {
        patientsRes = await api.get('/users', { params: { role: 'patient' } });
        console.log('Patients loaded:', patientsRes.data?.length || 0);
      } catch (err) {
        console.error('Error loading patients:', err);
        const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load patients';
        setError(`Failed to load patients: ${errorMsg}`);
        patientsRes = { data: [] };
      }
      
      try {
        presRes = await api.get('/prescriptions');
        console.log('Prescriptions loaded:', presRes.data?.length || 0);
      } catch (err) {
        console.error('Error loading prescriptions:', err);
        presRes = { data: [] };
      }
      
      setAppointments(apptsRes.data || []);
      setPatients(patientsRes.data || []);
      setPrescriptions(presRes.data || []);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load data. Please try again.';
      setError(errorMsg);
      console.error('Error loading doctor data:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    setError('');
    if (!appointmentId) {
      setError('Invalid appointment ID');
      return;
    }
    console.log('Approving appointment:', appointmentId);
    try {
      const response = await approveAppointment(appointmentId);
      console.log('Approval response:', response);
      if (response && response.data) {
        await loadData();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to approve appointment';
      setError(errorMsg);
      console.error('Approval error:', err);
      console.error('Error details:', err?.response?.data);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await completeAppointment(appointmentId);
      setError('');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate medications
    const validMedications = prescriptionForm.medications.filter(
      med => med.name && med.dosage
    );
    
    if (validMedications.length === 0) {
      setError('Please add at least one medication with name and dosage');
      return;
    }

    try {
      await createPrescription({
        patient: selectedAppointment.patient._id || selectedAppointment.patient,
        medications: validMedications
      });
      setError('');
      setShowPrescriptionForm(false);
      setSelectedAppointment(null);
      setPrescriptionForm({ medications: [{ name: '', dosage: '', notes: '' }] });
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create prescription');
    }
  };

  const addMedication = () => {
    setPrescriptionForm({
      medications: [...prescriptionForm.medications, { name: '', dosage: '', notes: '' }]
    });
  };

  const removeMedication = (index) => {
    setPrescriptionForm({
      medications: prescriptionForm.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index, field, value) => {
    const updated = [...prescriptionForm.medications];
    updated[index][field] = value;
    setPrescriptionForm({ medications: updated });
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

  return (
    <div className="pt-24 px-6 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Doctor Dashboard</h1>
        <p className="text-gray-400 mb-6">Manage your appointments, patients, and prescriptions</p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-4 hover-lift">
            <div className="text-cyan-400 text-sm mb-1">Total Appointments</div>
            <div className="text-3xl font-bold text-white">{stats.totalAppointments}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4 hover-lift">
            <div className="text-yellow-400 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-4 hover-lift">
            <div className="text-green-400 text-sm mb-1">Confirmed</div>
            <div className="text-3xl font-bold text-white">{stats.confirmed}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 hover-lift">
            <div className="text-blue-400 text-sm mb-1">Completed</div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
          </div>
        </div>
        
        {/* Appointments Section */}
        <section className="bg-[#09101A] p-6 rounded mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="uppercase text-sm text-white/70">Booked Appointments</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <SearchBar 
                placeholder="Search appointments..."
                onSearch={setSearchTerm}
                className="flex-1 md:w-64"
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
          </div>
          
          {appointments.length === 0 ? (
            <p className="text-white/60">No appointments scheduled</p>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter(apt => {
                  const matchesSearch = !searchTerm || 
                    apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map(apt => (
                <div key={apt._id} className="bg-[#0B0E14] p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-cyan-400 font-semibold">Patient: {apt.patient?.name}</p>
                      <p className="text-white/80">{new Date(apt.datetime).toLocaleString()}</p>
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
                  <div className="flex gap-2 mt-3">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(apt._id || apt.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(apt._id || apt.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                    {apt.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowPrescriptionForm(true);
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
                      >
                        Create Prescription
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Patient Records Section */}
        <section className="bg-[#09101A] p-6 rounded mb-6">
          <h2 className="uppercase text-sm text-white/70 mb-4">Patient Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.slice(0, 4).map(patient => (
              <div key={patient._id || patient.id} className="bg-[#0B0E14] p-4 rounded border border-gray-800 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-cyan-400 font-semibold">{patient.name}</h3>
                    <p className="text-gray-400 text-sm">{patient.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(patient._id || patient.id)}
                    className="text-xs px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded hover:bg-cyan-600/30"
                  >
                    View Records
                  </button>
                </div>
              </div>
            ))}
          </div>
          {selectedPatient && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-sm text-gray-400 hover:text-white mb-4"
              >
                ← Back to Patients
              </button>
              <MedicalRecords patientId={selectedPatient} canCreate={true} />
            </div>
          )}
        </section>

        {/* Prescription Form Modal */}
        {showPrescriptionForm && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#09101A] p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Prescription for {selectedAppointment.patient?.name}</h2>
              <form onSubmit={handleCreatePrescription} className="space-y-4">
                {prescriptionForm.medications.map((med, index) => (
                  <div key={index} className="bg-[#0B0E14] p-4 rounded space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white/70">Medication {index + 1}</h3>
                      {prescriptionForm.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Medication Name"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full p-2 rounded bg-[#0E1520] border border-gray-800 text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 500mg twice daily)"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="w-full p-2 rounded bg-[#0E1520] border border-gray-800 text-white"
                      required
                    />
                    <textarea
                      placeholder="Notes (optional)"
                      value={med.notes}
                      onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                      className="w-full p-2 rounded bg-[#0E1520] border border-gray-800 text-white"
                      rows="2"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedication}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Add Another Medication
                </button>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrescriptionForm(false);
                      setSelectedAppointment(null);
                      setPrescriptionForm({ medications: [{ name: '', dosage: '', notes: '' }] });
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                  >
                    Create Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
