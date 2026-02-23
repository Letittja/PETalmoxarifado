const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// middleware
app.use(cors());
app.use(express.json());

// conexão com o Postgres
const db = new Pool({
  host: 'postgres-login',
  user: 'login_user',
  password: 'login_pass',
  database: 'login_db',
  port: 5432
});

// teste de conexão
db.query('SELECT 1')
  .then(() => console.log('Postgres conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar no Postgres', err));

// Auth middleware
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

// Rota raiz
app.get('/', (req, res) => {
  res.send('API de Login do Almoxarifado está VIVA!');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Login service is running' });
});

// POST /api/auth/login
app.post('/login', async (req, res) => {
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
app.post('/register', async (req, res) => {
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
app.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// GET /me (protected)
app.get('/me', authMiddleware, async (req, res) => {
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

// servidor
app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});
