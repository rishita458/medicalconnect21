const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();
router.use(auth);

// Create appointment (patient)
router.post('/', requireRole('patient'), [
  body('doctor').isString(),
  body('datetime').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { doctor, datetime, reason } = req.body;
  const appt = new Appointment({ patient: req.user._id, doctor, datetime, reason });
  await appt.save();
  res.json(appt);
});

// List appointments (role-based)
router.get('/', async (req, res) => {
  const q = {};
  // Allow query params for patient/doctor filtering
  if (req.query.patient) {
    // Only allow if user is the patient, a doctor viewing their appointments, or admin
    if (req.user.role === 'admin' || req.user.role === 'doctor' || req.query.patient === req.user._id.toString()) {
      q.patient = req.query.patient;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  if (req.query.doctor) {
    // Only allow if user is the doctor, a patient viewing their appointments, or admin
    if (req.user.role === 'admin' || req.user.role === 'patient' || req.query.doctor === req.user._id.toString()) {
      q.doctor = req.query.doctor;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  // If no query params, filter by role
  if (!req.query.patient && !req.query.doctor) {
    if (req.user.role === 'patient') q.patient = req.user._id;
    if (req.user.role === 'doctor') q.doctor = req.user._id;
    // admins and pharmacists can see all (no filter)
  }
  const list = await Appointment.find(q).populate('patient doctor approvedBy', 'name email role');
  res.json(list);
});

// Approve appointment (admin or doctor) - MUST come before /:id route to avoid route matching issues
router.patch('/approve/:id', requireRole(['admin', 'doctor']), async (req, res) => {
  try {
    console.log('[Approve] Request received:', req.params.id, 'User:', req.user.role);
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      console.log('[Approve] Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    console.log('[Approve] Appointment found:', appt._id, 'Status:', appt.status);
    
    // Doctor can only approve their own appointments
    if (req.user.role === 'doctor') {
      const doctorId = appt.doctor.toString();
      const userId = req.user._id.toString();
      if (doctorId !== userId) {
        return res.status(403).json({ message: 'You can only approve your own appointments' });
      }
    }
    
    if (appt.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending appointments can be approved',
        currentStatus: appt.status 
      });
    }
    
    appt.status = 'confirmed';
    appt.approvedBy = req.user._id;
    await appt.save();
    
    const populated = await Appointment.findById(appt._id).populate('patient doctor approvedBy', 'name email role');
    console.log('[Approve] Appointment approved successfully:', populated._id, 'Status:', populated.status);
    res.json(populated);
  } catch (err) {
    console.error('Error approving appointment:', err);
    res.status(500).json({ message: 'Server error while approving appointment', error: err.message });
  }
});

// Complete appointment (doctor only, after completion doctor can create prescription) - MUST come before /:id route
router.patch('/complete/:id', requireRole('doctor'), async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ message: 'Not found' });
  if (!appt.doctor.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only complete your own appointments' });
  }
  if (appt.status !== 'confirmed') {
    return res.status(400).json({ message: 'Only confirmed appointments can be completed' });
  }
  appt.status = 'completed';
  appt.completedAt = new Date();
  await appt.save();
  const populated = await Appointment.findById(appt._id).populate('patient doctor approvedBy', 'name email role');
  res.json(populated);
});

// Get single appointment by ID - MUST come after specific routes
router.get('/:id', async (req, res) => {
  const appt = await Appointment.findById(req.params.id).populate('patient doctor approvedBy', 'name email role');
  if (!appt) return res.status(404).json({ message: 'Not found' });
  res.json(appt);
});

// General patch endpoint for other updates - MUST come after specific routes
router.patch('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    
    // Handle approval action
    if (req.body.action === 'approve') {
      // Only admin or doctor can approve
      if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only admin or doctor can approve appointments' });
      }
      // Doctor can only approve their own appointments
      if (req.user.role === 'doctor') {
        const doctorId = appt.doctor.toString();
        const userId = req.user._id.toString();
        if (doctorId !== userId) {
          return res.status(403).json({ message: 'You can only approve your own appointments' });
        }
      }
      if (appt.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending appointments can be approved' });
      }
      appt.status = 'confirmed';
      appt.approvedBy = req.user._id;
      await appt.save();
      const populated = await Appointment.findById(appt._id).populate('patient doctor approvedBy', 'name email role');
      return res.json(populated);
    }
    
    // Handle completion action
    if (req.body.action === 'complete') {
      if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only doctor can complete appointments' });
      }
      if (!appt.doctor.equals(req.user._id)) {
        return res.status(403).json({ message: 'You can only complete your own appointments' });
      }
      if (appt.status !== 'confirmed') {
        return res.status(400).json({ message: 'Only confirmed appointments can be completed' });
      }
      appt.status = 'completed';
      appt.completedAt = new Date();
      await appt.save();
      const populated = await Appointment.findById(appt._id).populate('patient doctor approvedBy', 'name email role');
      return res.json(populated);
    }
    
    // For other updates, check permissions
    if (!(req.user.role === 'admin' || appt.patient.equals(req.user._id) || appt.doctor.equals(req.user._id))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Prevent direct status changes (must use action parameter)
    if (req.body.status && !req.body.action) {
      delete req.body.status;
    }
    Object.assign(appt, req.body);
    await appt.save();
    const populated = await Appointment.findById(appt._id).populate('patient doctor approvedBy', 'name email role');
    res.json(populated);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ message: 'Not found' });
  if (!(req.user.role === 'admin' || appt.patient.equals(req.user._id))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
