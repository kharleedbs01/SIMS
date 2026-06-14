const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Announcement = require('../models/Announcement');

exports.getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalClasses, totalSubjects, activeStudents] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
      Student.countDocuments({ status: 'Active' }),
    ]);

    // Today attendance
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const todayAtt = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    let present = 0, absent = 0;
    todayAtt.forEach((a) => a.records.forEach((r) => { if (r.status === 'Present' || r.status === 'Late') present++; else absent++; }));
    const attendanceRate = (present + absent) > 0 ? ((present / (present + absent)) * 100).toFixed(1) : 0;

    // Students per class
    const studentsPerClass = await Student.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$classInfo.name', 'Unknown'] }, count: 1 } },
      { $sort: { name: 1 } },
    ]);

    // Gender breakdown
    const genderBreakdown = await Student.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    // Recent announcements
    const recentAnnouncements = await Announcement.find({ isPublished: true })
      .sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name');

    res.json({
      success: true,
      stats: {
        totalStudents, totalTeachers, totalClasses, totalSubjects,
        activeStudents, attendanceRate: Number(attendanceRate),
        presentToday: present, absentToday: absent,
        studentsPerClass, genderBreakdown, recentAnnouncements,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
