const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In real app, hash this!
    role: { type: String, enum: ['admin', 'examiner', 'student'], required: true },
    enrollmentNo: { type: String } // Only for students
});

module.exports = mongoose.model('User', UserSchema);