const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Subject = require('../models/Subject');

// GET /api/teachers
exports.getTeachers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { staffId: { $regex: search, $options: 'i' } },
    ];
    const teachers = await Teacher.find(query)
      .populate('assignedClasses', 'name')
      .populate('assignedSubjects', 'name code')
      .populate('userId', 'email isActive')
      .sort('fullName');
    res.json({ success: true, count: teachers.length, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/teachers/:id
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedClasses', 'name session term')
      .populate('assignedSubjects', 'name code')
      .populate('userId', 'email isActive lastLogin');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/teachers/me
exports.getMyProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id })
      .populate('assignedClasses', 'name session term')
      .populate('assignedSubjects', 'name code');
    if (!teacher) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/teachers
exports.createTeacher = async (req, res) => {
  try {
    const { email, password, fullName, gender, phone, qualification, address, specialization,
      assignedClasses, assignedSubjects, staffId } = req.body;

    let sId = staffId;
    if (!sId) {
      const count = await Teacher.countDocuments();
      sId = `TCH${String(count + 1).padStart(4, '0')}`;
    }

    const user = await User.create({
      name: fullName,
      email,
      password: password || `${sId}@sims`,
      role: 'teacher',
    });

    const teacher = await Teacher.create({
      userId: user._id,
      staffId: sId,
      fullName,
      gender,
      phone,
      qualification,
      address,
      specialization,
      assignedClasses: assignedClasses || [],
      assignedSubjects: assignedSubjects || [],
    });

    user.profileId = teacher._id;
    user.profileModel = 'Teacher';
    await user.save({ validateBeforeSave: false });

    const populated = await Teacher.findById(teacher._id)
      .populate('assignedClasses', 'name')
      .populate('assignedSubjects', 'name code');
    res.status(201).json({ success: true, message: 'Teacher created', teacher: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedClasses', 'name')
      .populate('assignedSubjects', 'name code');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher updated', teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    await User.findByIdAndDelete(teacher.userId);
    await teacher.deleteOne();
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
