const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();
router.use(auth);

// Doctor creates prescription (can be linked to completed appointment)
router.post('/', requireRole('doctor'), [
  body('patient').isString(),
  body('medications').isArray().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  // Validate medications array
  const { patient, medications, appointmentId } = req.body;
  if (!medications || medications.length === 0) {
    return res.status(400).json({ message: 'At least one medication is required' });
  }
  
  // Validate each medication has required fields
  for (const med of medications) {
    if (!med.name || !med.dosage) {
      return res.status(400).json({ message: 'Each medication must have name and dosage' });
    }
  }
  
  const pres = new Prescription({ 
    doctor: req.user._id, 
    patient,
    medications,
    status: 'pending' // Starts as pending, pharmacist will process
  });
  await pres.save();
  const populated = await Prescription.findById(pres._id).populate('doctor patient', 'name email');
  res.json(populated);
});

// Get all prescriptions (role-based access)
router.get('/', async (req, res) => {
  const q = {};
  if (req.user.role === 'patient') {
    q.patient = req.user._id;
  } else if (req.user.role === 'doctor') {
    q.doctor = req.user._id;
  } else if (req.user.role === 'pharmacist') {
    // Pharmacist sees pending and ready prescriptions
    q.status = { $in: ['pending', 'ready'] };
  }
  // Admin sees all
  const list = await Prescription.find(q).populate('doctor patient', 'name email');
  res.json(list);
});

// Get prescriptions for a specific patient (accessible to doctor, pharmacist, patient, admin)
router.get('/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const list = await Prescription.find({ patient: patientId }).populate('doctor', 'name email');
  res.json(list);
});

router.get('/id/:id', async (req, res) => {
  const pres = await Prescription.findById(req.params.id).populate('doctor patient', 'name email');
  if (!pres) return res.status(404).json({ message: 'Not found' });
  res.json(pres);
});

module.exports = router;
