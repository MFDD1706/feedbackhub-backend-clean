const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Mock users
const users = [
  { id: 1, nome: 'Admin', email: 'admin@feedbackhub.com', senha: '', cargo: 'ADMINISTRADOR', status: 'ATIVO' },
  { id: 2, nome: 'Gestor', email: 'gestor.dev@feedbackhub.com', senha: '', cargo: 'GESTOR', status: 'ATIVO' },
  { id: 3, nome: 'User', email: 'dev1@feedbackhub.com', senha: '', cargo: 'COLABORADOR', status: 'ATIVO' }
];

// Hash passwords
bcrypt.hash('admin123', 10).then(hash => users[0].senha = hash);
bcrypt.hash('gestor123', 10).then(hash => users[1].senha = hash);
bcrypt.hash('user123', 10).then(hash => users[2].senha = hash);

app.get('/api/status', (req, res) => {
  res.send('FeedbackHub API is running!');
});

app.get('/api/test/users', (req, res) => {
  res.json({ users: users.map(u => ({ id: u.id, nome: u.nome, email: u.email, cargo: u.cargo })) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ userId: user.id, cargo: user.cargo }, 'secret-key', { expiresIn: '8h' });

  res.json({
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.cargo,
      cargo: user.cargo
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
