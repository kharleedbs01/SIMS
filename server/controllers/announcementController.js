const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const { type, audience } = req.query;
    const query = { isPublished: true };
    if (type) query.type = type;
    const now = new Date();
    query.$or = [{ expiresAt: { $gt: now } }, { expiresAt: null }, { expiresAt: { $exists: false } }];
    if (audience && audience !== 'All') query.audience = { $in: [audience, 'All'] };
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id).populate('createdBy', 'name role');
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, announcement: ann });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Announcement created', announcement: ann });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement updated', announcement: ann });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
