require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const seed = async () => {
  try {
    // ✅ Safety check
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Class.deleteMany(),
      Subject.deleteMany(),
      Teacher.deleteMany(),
      Student.deleteMany()
    ]);
    console.log('🧹 Cleared existing data');

    // Classes
    const classNames = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

    const classes = await Class.insertMany(
      classNames.map((name) => ({
        name,
        session: '2024/2025',
        term: 'First Term'
      }))
    );
    console.log('🏫 Classes created');

    // Subjects
    const subjectData = [
      { name: 'English Language', code: 'ENG', category: 'Core' },
      { name: 'Mathematics', code: 'MTH', category: 'Core' },
      { name: 'Basic Science', code: 'BSC', category: 'Core' },
      { name: 'Biology', code: 'BIO', category: 'Core' },
      { name: 'Chemistry', code: 'CHE', category: 'Core' },
      { name: 'Physics', code: 'PHY', category: 'Core' },
      { name: 'Economics', code: 'ECO', category: 'Elective' },
      { name: 'Government', code: 'GOV', category: 'Elective' },
      { name: 'Civic Education', code: 'CIV', category: 'Core' },
      { name: 'Computer Studies', code: 'CST', category: 'Core' }
    ];

    const subjects = await Subject.insertMany(subjectData);
    console.log('📚 Subjects created');

    // Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@primecollege.edu.ng',
      password: 'admin1234',
      role: 'admin'
    });

    console.log('👨‍💼 Admin created: admin@primecollege.edu.ng / admin1234');

    // Teacher
    const teacherUser = await User.create({
      name: 'Mr. Aliyu Bello',
      email: 'aliyu.bello@primecollege.edu.ng',
      password: 'teacher1234',
      role: 'teacher'
    });

    const teacher = await Teacher.create({
      userId: teacherUser._id,
      staffId: 'TCH0001',
      fullName: 'Mr. Aliyu Bello',
      gender: 'Male',
      phone: '08011223344',
      qualification: 'B.Sc Mathematics',
      assignedClasses: [classes[0]._id, classes[3]._id],
      assignedSubjects: [subjects[1]._id, subjects[2]._id]
    });

    teacherUser.profileId = teacher._id;
    teacherUser.profileModel = 'Teacher';
    await teacherUser.save({ validateBeforeSave: false });

    console.log('👨‍🏫 Teacher created: aliyu.bello@primecollege.edu.ng / teacher1234');

    // Student
    const studentUser = await User.create({
      name: 'Amina Yusuf',
      email: 'amina.yusuf@student.primecollege.edu.ng',
      password: 'student1234',
      role: 'student'
    });

    const student = await Student.create({
      userId: studentUser._id,
      admissionNumber: 'PC/2024/0001',
      fullName: 'Amina Yusuf',
      gender: 'Female',
      dateOfBirth: new Date('2010-05-20'),
      class: classes[0]._id,
      parentName: 'Yusuf Musa',
      parentPhone: '08099887766',
      address: '12 Tudun Wada, Gombe',
      stateOfOrigin: 'Gombe',
      religion: 'Islam'
    });

    studentUser.profileId = student._id;
    studentUser.profileModel = 'Student';
    await studentUser.save({ validateBeforeSave: false });

    console.log('👩‍🎓 Student created: amina.yusuf@student.primecollege.edu.ng / student1234');

    console.log('\n🎉 SEED COMPLETE!\n');
    console.log('LOGIN CREDENTIALS:');
    console.log('Admin   → admin@primecollege.edu.ng / admin1234');
    console.log('Teacher → aliyu.bello@primecollege.edu.ng / teacher1234');
    console.log('Student → amina.yusuf@student.primecollege.edu.ng / student1234');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seed();