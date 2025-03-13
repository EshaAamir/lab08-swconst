const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../utils/storage');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = { id: users.length + 1, username, password: hashedPassword };
        users.push(user);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};