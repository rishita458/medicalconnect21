const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  specialty: String,
  licenseNumber: String,
  pharmacyDetails: String,
  // add role-specific optional fields
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient','doctor','pharmacist','admin'], required: true },
  profile: { type: ProfileSchema, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
