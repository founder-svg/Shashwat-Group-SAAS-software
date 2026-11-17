const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  appName: process.env.APP_NAME || 'Shashwat Group CRM',
  jwtSecret: process.env.JWT_SECRET || 'default_shashwat_secret_key_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  storageProvider: process.env.STORAGE_PROVIDER || 'local'
};
