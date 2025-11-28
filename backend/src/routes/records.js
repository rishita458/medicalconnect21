const express = require('express');
const multer = require('multer');
const MedicalRecord = require('../models/MedicalRecord');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(auth);

// Add a record (doctor or admin)
router.post('/:patientId', requireRole(['doctor','admin']), upload.single('file'), async (req, res) => {
  const rec = new MedicalRecord({
    patient: req.params.patientId,
    createdBy: req.user._id,
    title: req.body.title,
    notes: req.body.notes,
    fileUrl: req.file ? req.file.path : undefined
  });
  await rec.save();
  res.json(rec);
});

router.get('/:patientId', async (req, res) => {
  const patientId = req.params.patientId;
  if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const list = await MedicalRecord.find({ patient: patientId }).populate('createdBy', 'name email');
  res.json(list);
});

module.exports = router;
