const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;
const secretKey = 'testuser123'; // Hardcoded for testing

// PostgreSQL connection
const pool = new Pool({
  user: 'taskuser',
  host: 'localhost',
  database: 'usermanagament',
  password: 'taskuser',
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors());



app.get('/api/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    res.status(200).send('Database connection successful');
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send('Database connection error');
  }
});

// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('step1: Received email and password:', email, password);

  try {
    const client = await pool.connect();
    console.log('step2: Connected to database');
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('step3: Executed query');
    const user = result.rows[0];
    client.release();

    if (!user) {
      console.log('step4: User not found');
      return res.status(400).send('User not found');
    }

    //const passwordIsValid = await bcrypt.compare(password, user.password);

    // if (!passwordIsValid) {
    //   console.log('step5: Invalid password');
    //   return res.status(401).send('Invalid password');
    // }

    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: 86400 });
    console.log('Generated Token:', token);
    res.status(200).send({ token });

  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).send('Internal server error');
  }
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send('No token provided');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).send('Failed to authenticate token');
    }
    req.userId = decoded.id;
    next();
  });
}

// Protected route example
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.vwuser');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/users/current', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.vwuser LIMIT 1'); 
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;
    const result = await pool.query(
      'INSERT INTO public.vwuser (username, email, mobile, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, mobile, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, mobile, password } = req.body;

  try {
    const result = await pool.query(
      'UPDATE public.vwuser SET username = $1, email = $2, mobile = $3, password = $4 WHERE id = $5 RETURNING *',
      [username, email, mobile, password, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM public.vwuser WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).send(err.message);
  }
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
