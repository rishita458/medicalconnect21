const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  notes: String,
  fileUrl: String // stub field for uploaded files
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
