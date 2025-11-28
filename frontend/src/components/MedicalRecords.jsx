import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function MedicalRecords({ patientId, canCreate = false }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', notes: '' });

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/records/${patientId}`);
      setRecords(res.data || []);
    } catch (err) {
      setError('Failed to load medical records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('notes', formData.notes);
      
      await api.post(`/records/${patientId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowCreateForm(false);
      setFormData({ title: '', notes: '' });
      await loadRecords();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Medical Records</h3>
        {canCreate && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-neon text-sm"
          >
            {showCreateForm ? 'Cancel' : '+ Add Record'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-[#09101A] p-6 rounded space-y-4">
          <input
            type="text"
            placeholder="Record Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 rounded bg-[#0B0E14] border border-gray-800"
            required
          />
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-3 rounded bg-[#0B0E14] border border-gray-800"
            rows="4"
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="submit" className="btn-neon">
              Create Record
            </button>
          </div>
        </form>
      )}

      {records.length === 0 ? (
        <div className="bg-[#09101A] p-8 rounded text-center text-gray-400">
          No medical records found
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <div key={record._id} className="bg-[#09101A] border border-gray-800 rounded-lg p-4 hover:border-cyan-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-white">{record.title}</h4>
                <span className="text-xs text-gray-400">
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{record.notes}</p>
              {record.createdBy && (
                <p className="text-xs text-gray-500">
                  Created by: {record.createdBy?.name || 'Unknown'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

