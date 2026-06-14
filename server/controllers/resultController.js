const Result = require('../models/Result');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

exports.getResults = async (req, res) => {
  try {
    const { classId, subjectId, studentId, session, term } = req.query;
    const query = {};
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (studentId) query.student = studentId;
    if (session) query.session = session;
    if (term) query.term = term;

    const results = await Result.find(query)
      .populate('student', 'fullName admissionNumber')
      .populate('subject', 'name code')
      .populate('class', 'name')
      .sort('student');
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const { session, term } = req.query;
    const query = { student: student._id };
    if (session) query.session = session;
    if (term) query.term = term;
    const results = await Result.find(query)
      .populate('subject', 'name code')
      .populate('class', 'name')
      .sort('subject');
    const totalScore = results.reduce((s, r) => s + r.total, 0);
    const average = results.length ? (totalScore / results.length).toFixed(1) : 0;
    res.json({ success: true, results, summary: { totalScore, average, count: results.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.upsertResult = async (req, res) => {
  try {
    const { studentId, subjectId, classId, session, term, ca1, ca2, exam } = req.body;
    let teacher = null;
    if (req.user.role === 'teacher') {
      teacher = await Teacher.findOne({ userId: req.user._id });
    }
    const existing = await Result.findOne({ student: studentId, subject: subjectId, session, term });
    let result;
    if (existing) {
      existing.ca1 = ca1; existing.ca2 = ca2; existing.exam = exam;
      if (teacher) existing.teacher = teacher._id;
      await existing.save();
      result = existing;
    } else {
      result = await Result.create({
        student: studentId, subject: subjectId, class: classId,
        session, term, ca1, ca2, exam,
        teacher: teacher?._id,
      });
    }
    await recalcPositions(classId, subjectId, session, term);
    const populated = await Result.findById(result._id)
      .populate('student', 'fullName admissionNumber')
      .populate('subject', 'name code');
    res.status(200).json({ success: true, message: 'Result saved', result: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.bulkUpsert = async (req, res) => {
  try {
    const { classId, subjectId, session, term, results } = req.body;
    let teacherId = null;
    if (req.user.role === 'teacher') {
      const t = await Teacher.findOne({ userId: req.user._id });
      teacherId = t?._id;
    }
    const ops = results.map((r) => ({
      updateOne: {
        filter: { student: r.studentId, subject: subjectId, session, term },
        update: { $set: { class: classId, ca1: r.ca1 || 0, ca2: r.ca2 || 0, exam: r.exam || 0, teacher: teacherId } },
        upsert: true,
      },
    }));
    await Result.bulkWrite(ops);
    // Recalculate totals/grades via pre-save — re-save each
    const docs = await Result.find({ class: classId, subject: subjectId, session, term });
    for (const d of docs) { d.ca1 = d.ca1; await d.save(); }
    await recalcPositions(classId, subjectId, session, term);
    res.json({ success: true, message: `${results.length} results saved` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
    res.json({ success: true, message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReportCard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('class', 'name session term');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const { session, term } = req.query;
    const results = await Result.find({ student: student._id, session, term })
      .populate('subject', 'name code')
      .sort('subject');
    const totalScore = results.reduce((s, r) => s + r.total, 0);
    const average = results.length ? (totalScore / results.length).toFixed(1) : 0;
    // Overall position in class
    const allAggregated = await Result.aggregate([
      { $match: { class: student.class._id, session, term } },
      { $group: { _id: '$student', total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
    ]);
    const pos = allAggregated.findIndex((r) => String(r._id) === String(student._id));
    res.json({ success: true, reportCard: { student, results, totalScore, average, position: pos + 1, totalStudents: allAggregated.length, session, term } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function recalcPositions(classId, subjectId, session, term) {
  const results = await Result.find({ class: classId, subject: subjectId, session, term }).sort({ total: -1 });
  for (let i = 0; i < results.length; i++) {
    results[i].position = i + 1;
    await Result.findByIdAndUpdate(results[i]._id, { position: i + 1 });
  }
}
