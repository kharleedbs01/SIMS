const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      enum: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'],
      unique: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    capacity: {
      type: Number,
      default: 40,
    },
    session: {
      type: String,
      default: () => {
        const y = new Date().getFullYear();
        return `${y}/${y + 1}`;
      },
    },
    term: {
      type: String,
      enum: ['First Term', 'Second Term', 'Third Term'],
      default: 'First Term',
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

classSchema.virtual('studentCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'class',
  count: true,
});

module.exports = mongoose.model('Class', classSchema);
