const Class = require('../models/Class');
const Student = require('../models/Student');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'fullName staffId')
      .populate('subjects', 'name code')
      .populate('studentCount')
      .sort('name');
    res.json({ success: true, count: classes.length, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('classTeacher', 'fullName staffId phone')
      .populate('subjects', 'name code category');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    const students = await Student.find({ class: cls._id }).populate('userId', 'email isActive');
    res.json({ success: true, class: cls, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, message: 'Class created', class: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('classTeacher', 'fullName')
      .populate('subjects', 'name code');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class updated', class: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const count = await Student.countDocuments({ class: req.params.id });
    if (count > 0)
      return res.status(400).json({ success: false, message: `Cannot delete class with ${count} enrolled students` });
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
