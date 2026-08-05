const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth/auth.routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;