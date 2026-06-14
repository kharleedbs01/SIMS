const express = require('express');
const router = express.Router();
const { getClasses, getClass, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');
router.route('/').get(protect, getClasses).post(protect, authorize('admin'), createClass);
router.route('/:id').get(protect, getClass).put(protect, authorize('admin'), updateClass).delete(protect, authorize('admin'), deleteClass);
module.exports = router;
