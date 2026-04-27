require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection (MongoDB)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Routes (Importing routes - see step 4)
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));