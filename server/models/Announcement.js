const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    type: {
      type: String,
      enum: ['General', 'Academic', 'Event', 'Urgent', 'Holiday'],
      default: 'General',
    },
    audience: {
      type: String,
      enum: ['All', 'Students', 'Teachers'],
      default: 'All',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    expiresAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
