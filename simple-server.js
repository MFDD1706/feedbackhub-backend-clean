require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://feedbackhub-frontend-clean.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Mock users data (since database seems to be the issue)
const mockUsers = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@feedbackhub.com',
    senha: '$2a$10$YourHashedPasswordHere', // Will be set below
    cargo: 'ADMINISTRADOR',
    status: 'ATIVO'
  },
  {
    id: 2,
    nome: 'Gestor Desenvolvimento',
    email: 'gestor.dev@feedbackhub.com',
    senha: '$2a$10$YourHashedPasswordHere', // Will be set below
    cargo: 'GESTOR',
    status: 'ATIVO'
  },
  {
    id: 3,
    nome: 'Desenvolvedor 1',
    email: 'dev1@feedbackhub.com',
    senha: '$2a$10$YourHashedPasswordHere', // Will be set below
    cargo: 'COLABORADOR',
    status: 'ATIVO'
  }
];

// Hash passwords on startup
async function initializeUsers() {
  for (let user of mockUsers) {
    if (user.email === 'admin@feedbackhub.com') {
      user.senha = await bcrypt.hash('admin123', 10);
    } else if (user.email === 'gestor.dev@feedbackhub.com') {
      user.senha = await bcrypt.hash('gestor123', 10);
    } else if (user.email === 'dev1@feedbackhub.com') {
      user.senha = await bcrypt.hash('user123', 10);
    }
  }
  console.log('Mock users initialized');
}

// Status endpoint
app.get('/api/status', (req, res) => {
  res.send('FeedbackHub API is running!');
});

// Test endpoint
app.get('/api/test/users', (req, res) => {
  const safeUsers = mockUsers.map(u => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    cargo: u.cargo,
    status: u.status
  }));
  res.json({ users: safeUsers, count: mockUsers.length });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.senha });
    
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('Looking for user:', email);
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('User found:', { id: user.id, email: user.email, status: user.status });

    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.status !== 'ATIVO') {
      console.log('User inactive:', email, user.status);
      return res.status(403).json({ error: 'Usuário inativo' });
    }

    const token = jwt.sign(
      { userId: user.id, cargo: user.cargo },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '8h' }
    );

    console.log('Login successful for:', email);
    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.cargo,
        cargo: user.cargo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Profile endpoint
app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.cargo,
      status: user.status
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

const PORT = process.env.PORT || 3000;

// Initialize and start server
initializeUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`Simple server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('GET /api/status');
    console.log('GET /api/test/users');
    console.log('POST /api/auth/login');
    console.log('GET /api/auth/profile');
  });
});
