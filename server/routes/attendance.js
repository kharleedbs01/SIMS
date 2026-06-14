const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getStudentSummary, getMyAttendance, deleteAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
router.get('/my', protect, authorize('student'), getMyAttendance);
router.get('/summary/:studentId', protect, getStudentSummary);
router.route('/').get(protect, getAttendance).post(protect, authorize('admin', 'teacher'), markAttendance);
router.delete('/:id', protect, authorize('admin'), deleteAttendance);
module.exports = router;
