const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: 'taskuser',
    host: 'localhost',
    database: 'usermanagament',
    password: 'taskuser',
    port: 5432,
});

const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
    );
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById };
