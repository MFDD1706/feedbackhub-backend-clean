require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const { swaggerUi, specs } = require('./config/swagger');

// Importa as rotas refatoradas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const teamRoutes = require('./routes/team');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// Middlewares essenciais
// Configuração de CORS para permitir o frontend
app.use(cors({
  origin: ['https://feedbackhub-frontend-clean.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'html')));

// Direct auth routes to fix 404 issue
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Test route to check database connection
app.get('/api/test/db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, nome: true, cargo: true, status: true }
    });
    res.json({ 
      message: 'Database connected', 
      userCount,
      users: users.slice(0, 5) // Show first 5 users
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Login route directly in server.js
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.senha });
    
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('Looking for user:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

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
      process.env.JWT_SECRET,
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

// Debug: Log all registered routes
console.log('Registering API routes...');

// Rotas da API (commented out problematic routes)
// app.use('/api/auth', authRoutes);
console.log('✓ Auth routes registered directly in server.js');
app.use('/api/users', usersRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/email', emailRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FeedbackHub API Documentation'
}));

// Rota para checar a saúde da API
app.get('/api/status', (req, res) => {
  res.send('FeedbackHub API is running!');
});

// Debug route to list all routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes, message: 'Available routes' });
});

// Middleware de tratamento de erros (deve ser o último)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
