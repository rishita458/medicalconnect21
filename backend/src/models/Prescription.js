const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medications: [{ name: String, dosage: String, notes: String }],
  status: { type: String, enum: ['pending','ready','dispensed','cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
