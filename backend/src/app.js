const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth/auth.routes');
const applicationRoutes = require('./applications/application.routes');
const apiKeyNestedRoutes = require('./api-keys/apiKeyNested.routes');
const apiKeyRoutes = require('./api-keys/apiKey.routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API is running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/applications/:id/api-keys', apiKeyNestedRoutes); // nested: create + list
app.use('/api-keys', apiKeyRoutes);                        // standalone: get/update/rotate/revoke/restore/delete

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;