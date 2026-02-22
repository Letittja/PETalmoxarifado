const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middlewares
app.use(cors());
app.use(express.json());

// Simple auth middleware (inlined for minimal structure)
function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'Token não fornecido' });
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expirado' });
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// Routes (inlined — simplest functional structure)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Login service is running' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    const result = await db.query('SELECT id, email, password_hash, name FROM public.users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Email ou senha inválidos' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Email ou senha inválidos' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ message: 'Login realizado com sucesso', token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Email, senha e nome são obrigatórios' });

    const exists = await db.query('SELECT id FROM public.users WHERE email = $1', [email]);
    if (exists.rows.length > 0) return res.status(400).json({ message: 'Email já cadastrado' });

    const hashed = await bcrypt.hash(password, 10);
    const insert = await db.query('INSERT INTO public.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, hashed, name]);

    res.status(201).json({ message: 'Usuário registrado com sucesso', user: insert.rows[0] });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// POST /api/auth/logout (protected)
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  // stateless JWT: to really invalidate you'd need blacklist; keep simple
  res.json({ message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me (protected)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, name FROM public.users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ user });
  } catch (err) {
    console.error('GetProfile error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

app.listen(PORT, () => console.log(`Login service rodando na porta ${PORT}`));
