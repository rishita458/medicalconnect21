import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  // In a real app you would decode token or fetch /me
  const role = 'patient'; // placeholder; ideally read from api/me
  return (
    <div className="pt-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to your dashboard</h1>
        <p className="text-[color:var(--text-secondary)] mb-6">Role: {role}</p>

        <section className="bg-[#09101A] p-6 rounded mb-6">
          <h2 className="uppercase text-sm text-white/70 mb-2">Appointments</h2>
          <p className="text-white/80">Book an appointment or view upcoming sessions (UI stub).</p>
          <button className="btn-neon mt-4">Book Appointment</button>
        </section>

        <section className="bg-[#09101A] p-6 rounded">
          <h2 className="uppercase text-sm text-white/70 mb-2">Prescriptions</h2>
          <p className="text-white/80">View prescriptions assigned to you (UI stub).</p>
        </section>
      </div>
    </div>
  );
}
