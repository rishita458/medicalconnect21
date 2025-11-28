const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  datetime: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Track who approved
  completedAt: { type: Date } // Track when appointment was completed
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
