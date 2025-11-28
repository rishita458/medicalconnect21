const express = require('express');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();
router.use(auth);
router.use(requireRole(['pharmacist','admin']));

// Get all prescriptions (pending and ready for pharmacist)
router.get('/prescriptions', async (req, res) => {
  const q = { status: { $in: ['pending', 'ready'] } };
  const prescriptions = await Prescription.find(q).populate('doctor patient', 'name email');
  res.json(prescriptions);
});

// Get pending prescriptions
router.get('/prescriptions/pending', async (req, res) => {
  const pending = await Prescription.find({ status: 'pending' }).populate('doctor patient', 'name email');
  res.json(pending);
});

// Update prescription status (pending -> ready -> dispensed)
router.patch('/prescriptions/:id/status', [
  require('express-validator').body('status').isIn(['pending', 'ready', 'dispensed', 'cancelled'])
], async (req, res) => {
  const { status } = req.body;
  const pres = await Prescription.findById(req.params.id);
  if (!pres) return res.status(404).json({ message: 'Not found' });
  
  // Validate status transition
  if (pres.status === 'dispensed' && status !== 'cancelled') {
    return res.status(400).json({ message: 'Cannot change status of dispensed prescription' });
  }
  
  pres.status = status;
  await pres.save();
  const populated = await Prescription.findById(pres._id).populate('doctor patient', 'name email');
  res.json(populated);
});

module.exports = router;
