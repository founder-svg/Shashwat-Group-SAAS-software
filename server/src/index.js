const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const dealRoutes = require('./routes/deal.routes');
const taskRoutes = require('./routes/task.routes');
const documentRoutes = require('./routes/document.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const billingRoutes = require('./routes/billing.routes');
const driveRoutes = require('./routes/drive.routes');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static serve for local uploads & local drive mirrors
app.use('/uploads', express.static(path.join(__dirname, '../../cloud/storage/local_uploads')));
app.use('/drive/files', express.static(path.join(__dirname, '../../cloud/drive/local_drive')));

// Root & Healthcheck Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Shashwat Group SaaS & CRM Software',
    teamLimit: 'Up to 5 Users',
    modules: ['Billing & Invoicing', 'Inventory & Stock In/Out', 'CRM & Leads', 'Free Cloud Drive (15GB)'],
    version: '1.1.0',
    timestamp: new Date(),
    cloudStorageProvider: config.storageProvider
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptimeSeconds: process.uptime(),
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/drive', driveRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on ${req.method} ${req.url}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server (only if not required as a module in tests)
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ${config.appName} Backend Server Running`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`☁️  Cloud Storage Provider: ${config.storageProvider.toUpperCase()}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
