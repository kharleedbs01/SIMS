const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.markAttendance = async (req, res) => {
  try {
    const { classId, date, session, term, records } = req.body;
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const next = new Date(d.getTime() + 86400000);

    let att = await Attendance.findOne({ class: classId, date: { $gte: d, $lt: next } });
    if (att) {
      att.records = records;
      att.markedBy = req.user._id;
      await att.save();
    } else {
      att = await Attendance.create({ class: classId, date: d, session, term, markedBy: req.user._id, records });
    }
    res.status(200).json({ success: true, message: 'Attendance saved', attendance: att });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { classId, date, startDate, endDate, studentId } = req.query;
    const query = {};
    if (classId) query.class = classId;
    if (date) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    let attendance = await Attendance.find(query)
      .populate('class', 'name')
      .populate('records.student', 'fullName admissionNumber')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    if (studentId) {
      attendance = attendance.map((a) => ({
        ...a.toObject(),
        records: a.records.filter((r) => String(r.student?._id) === studentId),
      })).filter((a) => a.records.length > 0);
    }
    res.json({ success: true, count: attendance.length, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentSummary = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const attendance = await Attendance.find({ class: student.class, 'records.student': student._id });
    let present = 0, absent = 0, late = 0;
    attendance.forEach((a) => {
      const rec = a.records.find((r) => String(r.student) === String(student._id) || String(r.student?._id) === String(student._id));
      if (rec?.status === 'Present') present++;
      else if (rec?.status === 'Absent') absent++;
      else if (rec?.status === 'Late') late++;
    });
    const total = present + absent + late;
    const percentage = total ? ((present + late) / total * 100).toFixed(1) : 0;
    res.json({ success: true, summary: { present, absent, late, total, percentage } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const attendance = await Attendance.find({ class: student.class, 'records.student': student._id })
      .sort({ date: -1 });
    const records = [];
    let present = 0, absent = 0, late = 0;
    attendance.forEach((a) => {
      const rec = a.records.find((r) => String(r.student) === String(student._id));
      if (rec) {
        records.push({ date: a.date, status: rec.status, remark: rec.remark });
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
        else if (rec.status === 'Late') late++;
      }
    });
    const total = present + absent + late;
    const percentage = total ? ((present + late) / total * 100).toFixed(1) : 0;
    res.json({ success: true, records, summary: { present, absent, late, total, percentage } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
