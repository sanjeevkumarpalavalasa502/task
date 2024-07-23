const { findUserById } = require('../models/userModel');

const getUser = async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUser };
