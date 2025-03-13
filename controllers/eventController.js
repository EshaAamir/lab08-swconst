const { events } = require('../utils/storage');

exports.createEvent = async (req, res) => {
    try {
        const { name, description, date, category, reminder } = req.body;
        const event = { id: events.length + 1, name, description, date, category, reminder, userId: req.user.id };
        events.push(event);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { sortBy, category, reminder } = req.query;
        let userEvents = events.filter(e => e.userId === req.user.id);
        if (category) userEvents = userEvents.filter(e => e.category === category);
        if (reminder) userEvents = userEvents.filter(e => e.reminder === (reminder === 'true'));
        if (sortBy === 'date') userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        res.json(userEvents);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};