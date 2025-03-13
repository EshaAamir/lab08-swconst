const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { events } = require('../utils/storage');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

cron.schedule('* * * * *', () => {
    const upcomingEvents = events.filter(e => e.reminder && new Date(e.date) <= new Date(Date.now() + 15 * 60000));
    upcomingEvents.forEach(event => {
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: 'i222473@nu.edu.pk', 
            subject: `Reminder: ${event.name}`,
            text: `Don't forget: ${event.description} at ${event.date}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Email sent: ' + info.response);
        });
    });
});