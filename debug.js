// Debug script to test routes
const express = require('express');
const app = express();

// Test basic route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Test auth route
app.post('/auth/login', (req, res) => {
  res.json({ message: 'Auth route working' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log('Routes registered:');
  console.log('GET /test');
  console.log('POST /auth/login');
});
