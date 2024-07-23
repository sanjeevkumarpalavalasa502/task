const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await createUser(username, email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login };
