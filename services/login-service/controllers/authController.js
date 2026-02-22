const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const result = await db.query('SELECT id, email, password_hash, name FROM public.users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, senha e nome são obrigatórios' });
    }

    // Verificar se usuário já existe
    const exists = await db.query('SELECT id FROM public.users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = await db.query(
      'INSERT INTO public.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const newUser = insert.rows[0];

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// Logout
exports.logout = (req, res) => {
  // Em um cenário real, você poderia blacklist o token ou fazer outras operações
  res.json({ message: 'Logout realizado com sucesso' });
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, name FROM public.users WHERE id = $1', [req.userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('GetProfile error:', error.message);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};
