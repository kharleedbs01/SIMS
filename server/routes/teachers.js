const express = require('express');
const r = express.Router();
const c = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');
r.get('/me', protect, authorize('teacher'), c.getMyProfile);
r.route('/').get(protect, c.getTeachers).post(protect, authorize('admin'), c.createTeacher);
r.route('/:id').get(protect, c.getTeacher).put(protect, authorize('admin'), c.updateTeacher).delete(protect, authorize('admin'), c.deleteTeacher);
module.exports = r;
