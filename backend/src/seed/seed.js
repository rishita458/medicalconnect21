require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();
  await User.deleteMany({});
  await Appointment.deleteMany({});
  await Prescription.deleteMany({});

  const users = [
    { name: 'Alice Patient', email: 'alice@patient.test', password: 'password1', role: 'patient' },
    { name: 'Dr. Bob', email: 'bob@doctor.test', password: 'password1', role: 'doctor', profile: { specialty: 'Cardiology' } },
    { name: 'Pharma Phil', email: 'phil@pharmacy.test', password: 'password1', role: 'pharmacist' },
    { name: 'Admin Amy', email: 'amy@admin.test', password: 'password1', role: 'admin' }
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await new User({ ...u, password: hashed }).save();
  }

  const alice = await User.findOne({ email: 'alice@patient.test' });
  const drbob = await User.findOne({ email: 'bob@doctor.test' });

  await new Appointment({ patient: alice._id, doctor: drbob._id, datetime: new Date(Date.now() + 86400000), reason: 'Checkup' }).save();

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
