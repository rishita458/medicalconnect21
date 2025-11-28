import React, { useState, useEffect } from 'react';
import api, { getPharmacyPrescriptions, updatePrescriptionStatus } from '../services/api';
import SearchBar from '../components/SearchBar';

export default function DashboardPharmacist() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, ready
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPharmacyPrescriptions();
      setPrescriptions(res.data || []);
    } catch (err) {
      setError('Failed to load prescriptions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (prescriptionId, newStatus) => {
    try {
      await updatePrescriptionStatus(prescriptionId, newStatus);
      setError('');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update prescription status');
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesSearch = !searchTerm || 
      p.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medications?.some(med => med.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="pt-24 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <p className="text-cyan-400">Loading pharmacist dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    ready: prescriptions.filter(p => p.status === 'ready').length,
    dispensed: prescriptions.filter(p => p.status === 'dispensed').length
  };

  return (
    <div className="pt-24 px-6 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Pharmacist Dashboard</h1>
        <p className="text-gray-400 mb-6">Manage prescriptions and medication orders</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-4 hover-lift">
            <div className="text-cyan-400 text-sm mb-1">Total</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4 hover-lift">
            <div className="text-yellow-400 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 hover-lift">
            <div className="text-blue-400 text-sm mb-1">Ready</div>
            <div className="text-3xl font-bold text-white">{stats.ready}</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-4 hover-lift">
            <div className="text-green-400 text-sm mb-1">Dispensed</div>
            <div className="text-3xl font-bold text-white">{stats.dispensed}</div>
          </div>
        </div>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Filter Tabs and Search */}
        <div className="mb-6 space-y-4">
          <SearchBar 
            placeholder="Search by patient, doctor, or medication..."
            onSearch={setSearchTerm}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                  : 'bg-gray-700 text-white/70 hover:bg-gray-600'
              }`}
            >
              All ({prescriptions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'pending' 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
                  : 'bg-gray-700 text-white/70 hover:bg-gray-600'
              }`}
            >
              Pending ({prescriptions.filter(p => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'ready' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'bg-gray-700 text-white/70 hover:bg-gray-600'
              }`}
            >
              Ready ({prescriptions.filter(p => p.status === 'ready').length})
            </button>
          </div>
        </div>

        {/* Prescriptions Section */}
        <section className="bg-[#09101A] p-6 rounded">
          <h2 className="uppercase text-sm text-white/70 mb-4">Prescriptions</h2>
          {filteredPrescriptions.length === 0 ? (
            <p className="text-white/60">No prescriptions found</p>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map(pres => (
                <div key={pres._id} className="bg-[#0B0E14] p-4 rounded">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-cyan-400 font-semibold">
                        Patient: {pres.patient?.name || 'Unknown'}
                      </p>
                      <p className="text-white/60 text-sm">
                        Prescribed by: Dr. {pres.doctor?.name || 'Unknown'}
                      </p>
                      <p className="text-white/50 text-xs">
                        {new Date(pres.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      pres.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      pres.status === 'ready' ? 'bg-blue-900/30 text-blue-400' :
                      pres.status === 'dispensed' ? 'bg-green-900/30 text-green-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {pres.status}
                    </span>
                  </div>

                  {/* Medications List */}
                  <div className="mb-3">
                    <h4 className="text-white/70 text-sm mb-2">Medications:</h4>
                    <div className="space-y-1">
                      {pres.medications?.map((med, index) => (
                        <div key={index} className="bg-[#0E1520] p-2 rounded text-sm">
                          <p className="text-white/80">
                            <span className="font-semibold">{med.name}</span> - {med.dosage}
                          </p>
                          {med.notes && (
                            <p className="text-white/60 text-xs mt-1">{med.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {pres.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(pres._id, 'ready')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          Mark Ready
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(pres._id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {pres.status === 'ready' && (
                      <button
                        onClick={() => handleStatusUpdate(pres._id, 'dispensed')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      >
                        Mark as Dispensed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

