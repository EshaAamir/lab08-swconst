const express = require('express');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const reminderService = require('./services/reminderService');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);

module.exports = app;