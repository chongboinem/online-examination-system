const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// Create Exam
router.post('/', async (req, res) => {
    const { code, subject, datetime, duration, questions, createdBy } = req.body;
    try {
        const newExam = new Exam({ code, subject, datetime, duration, questions, createdBy });
        await newExam.save();
        res.status(201).json(newExam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Exams (For Admin/Students to check codes)
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Specific Exam by Code (For taking exam)
router.get('/:code', async (req, res) => {
    try {
        const exam = await Exam.findOne({ code: req.params.code });
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

    javascript
localStorage.setItem('exams', JSON.stringify(storedExams));


    javascript
fetch('http://localhost:5000/api/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newExam)
})
.then(response => response.json())
.then(data => alert('Exam Published to Database!'))
.catch(error => console.error('Error:', error));