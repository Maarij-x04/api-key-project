const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth/auth.routes');
const applicationRoutes = require('./applications/application.routes');
const apiKeyNestedRoutes = require('./api-keys/apiKeyNested.routes');
const apiKeyRoutes = require('./api-keys/apiKey.routes');
const usageRoutes = require('./usage/usage.routes');
const usageNestedRoutes = require('./usage/usageNested.routes');
const analyticsRoutes = require('./usage/analytics.routes');
const productRoutes = require('./products/product.routes');
const orderRoutes = require('./orders/order.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/applications/:id/api-keys', apiKeyNestedRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/applications/:id/usage', usageNestedRoutes);
app.use('/usage', usageRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;