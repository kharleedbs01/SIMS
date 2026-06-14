const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('student'), getMyProfile);
router.route('/').get(protect, getStudents).post(protect, authorize('admin'), createStudent);
router.route('/:id').get(protect, getStudent).put(protect, authorize('admin'), updateStudent).delete(protect, authorize('admin'), deleteStudent);
module.exports = router;
