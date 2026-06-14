const mongoose = require('mongoose');

const getGrade = (total) => {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
};

const getRemark = (grade) => {
  const map = { A: 'Excellent', B: 'Very Good', C: 'Good', D: 'Fair', E: 'Pass', F: 'Fail' };
  return map[grade] || 'Fail';
};

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    session: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ['First Term', 'Second Term', 'Third Term'],
      required: true,
    },
    ca1: {
      type: Number,
      min: 0,
      max: 30,
      default: 0,
    },
    ca2: {
      type: Number,
      min: 0,
      max: 30,
      default: 0,
    },
    exam: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: 'F',
    },
    remark: {
      type: String,
      default: 'Fail',
    },
    position: Number,
  },
  { timestamps: true }
);

// Auto-calculate total, grade, remark
resultSchema.pre('save', function (next) {
  // Normalize: ca1+ca2 max 40, exam max 60 → total out of 100
  const ca = Math.min(this.ca1 + this.ca2, 40);
  const exam = Math.min(this.exam, 60);
  this.total = ca + exam;
  this.grade = getGrade(this.total);
  this.remark = getRemark(this.grade);
  next();
});

// Unique result per student/subject/session/term
resultSchema.index({ student: 1, subject: 1, session: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
