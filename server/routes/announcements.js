const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
router.route('/').get(protect, getAnnouncements).post(protect, authorize('admin'), createAnnouncement);
router.route('/:id').get(protect, getAnnouncement).put(protect, authorize('admin'), updateAnnouncement).delete(protect, authorize('admin'), deleteAnnouncement);
module.exports = router;
