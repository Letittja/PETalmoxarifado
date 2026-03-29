const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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

// POST /login
app.post('/login', async (req, res) => {
  try {
    const { matricula, password } = req.body;
    if (!matricula || !password) return res.status(400).json({ message: 'Matrícula e senha são obrigatórios' });

    const result = await db.query('SELECT id, email, password_hash, name, matricula FROM public.users WHERE matricula = $1', [matricula]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Matrícula ou senha inválidos' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Matrícula ou senha inválidos' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ message: 'Login realizado com sucesso', token, user: { id: user.id, email: user.email, name: user.name, matricula: user.matricula } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, matricula } = req.body;
    if (!email || !password || !name || !matricula) return res.status(400).json({ message: 'Email, senha, nome e matrícula são obrigatórios' });

    // Validar matrícula: exatamente 6 dígitos numéricos
    if (!/^\d{6}$/.test(matricula)) return res.status(400).json({ message: 'Matrícula deve conter exatamente 6 dígitos numéricos' });

    const exists = await db.query('SELECT id FROM public.users WHERE email = $1 OR matricula = $2', [email, matricula]);
    if (exists.rows.length > 0) return res.status(400).json({ message: 'Email ou matrícula já cadastrados' });

    const hashed = await bcrypt.hash(password, 10);
    const insert = await db.query('INSERT INTO public.users (email, password_hash, name, matricula) VALUES ($1, $2, $3, $4) RETURNING id, email, name, matricula', [email, hashed, name, matricula]);

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

// GET /api/auth/me (protected)
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

// POST /change-password (protected) - Mudar senha
app.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });

    if (currentPassword === newPassword) return res.status(400).json({ message: 'A nova senha não pode ser igual à senha atual' });

    const result = await db.query('SELECT password_hash FROM public.users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Verificar se a senha atual está correta
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Senha atual inválida' });

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await db.query('UPDATE public.users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.userId]);

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// Configurar Nodemailer (ajuste com suas credenciais de email)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'sua-senha-app'
  }
});

// POST /forgot-password - Esqueci a senha
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email é obrigatório' });

    const result = await db.query('SELECT id, name FROM public.users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Gerar token de reset (32 caracteres aleatórios)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

    // Salvar token no banco
    await db.query('UPDATE public.users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3', [resetTokenHash, resetExpires, user.id]);

    // Enviar email
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;
    const mailOptions = {
      from: process.env.EMAIL_USER || 'seu-email@gmail.com',
      to: email,
      subject: 'Redefinição de Senha - Almoxarifado',
      html: `
        <p>Olá ${user.name},</p>
        <p>Você solicitou uma redefinição de senha. Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Email send error:', err.message);
        return res.status(500).json({ message: 'Erro ao enviar email', error: err.message });
      }
      res.json({ message: 'Email de redefinição enviado com sucesso' });
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// POST /reset-password - Redefinir senha
app.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) return res.status(400).json({ message: 'Token, email e nova senha são obrigatórios' });

    // Hash do token recebido
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuário e verificar token e expiração
    const result = await db.query('SELECT id FROM public.users WHERE email = $1 AND password_reset_token = $2 AND password_reset_expires > NOW()', [email, tokenHash]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Token inválido ou expirado' });

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token
    await db.query('UPDATE public.users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2', [hashedPassword, user.id]);

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  }
});

// servidor
app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});
