const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');

// GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const { classId, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (classId) query.class = classId;
    if (status) query.status = status;
    if (search) query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } },
    ];
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('class', 'name session term')
      .populate('userId', 'email isActive')
      .sort('fullName')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, count: students.length, total, pages: Math.ceil(total / limit), currentPage: Number(page), students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/students/:id
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name session term subjects')
      .populate('userId', 'email isActive lastLogin');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/students/me
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('class', 'name session term');
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const { email, password, fullName, gender, dateOfBirth, classId, parentName, parentPhone,
      parentEmail, address, stateOfOrigin, religion, admissionNumber } = req.body;

    // Generate admission number if not provided
    let admNo = admissionNumber;
    if (!admNo) {
      const count = await Student.countDocuments();
      admNo = `PC/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
    }

    // Create user account
    const user = await User.create({
      name: fullName,
      email,
      password: password || `${admNo.replace(/\//g, '')}@sims`,
      role: 'student',
    });

    const student = await Student.create({
      userId: user._id,
      admissionNumber: admNo,
      fullName,
      gender,
      dateOfBirth,
      class: classId,
      parentName,
      parentPhone,
      parentEmail,
      address,
      stateOfOrigin,
      religion,
    });

    // Update user profileId
    user.profileId = student._id;
    user.profileModel = 'Student';
    await user.save({ validateBeforeSave: false });

    const populated = await Student.findById(student._id).populate('class', 'name');
    res.status(201).json({ success: true, message: 'Student created', student: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body, class: req.body.classId || req.body.class },
      { new: true, runValidators: true }
    ).populate('class', 'name');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student updated', student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await User.findByIdAndDelete(student.userId);
    await student.deleteOne();
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
