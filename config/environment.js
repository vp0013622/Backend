import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
  development: {
    PORT: process.env.PORT || 3001,
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/inhabit_dev',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173/',
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    PROFILE_IMAGES_PATH: process.env.PROFILE_IMAGES_PATH || './profileImages',
    PROPERTY_IMAGES_PATH: process.env.PROPERTY_IMAGES_PATH || './propertyImagesUploads',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,pdf,doc,docx',
  },
  production: {
    PORT: process.env.PORT || 3001,
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://your-production-domain.com',
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    PROFILE_IMAGES_PATH: process.env.PROFILE_IMAGES_PATH || './profileImages',
    PROPERTY_IMAGES_PATH: process.env.PROPERTY_IMAGES_PATH || './propertyImagesUploads',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,pdf,doc,docx',
  }
};

const currentConfig = config[NODE_ENV];

if (!currentConfig) {
  throw new Error(`Invalid NODE_ENV: ${NODE_ENV}. Must be 'development' or 'production'`);
}

// Validate required production environment variables
if (NODE_ENV === 'production') {
  const requiredVars = ['DB_CONNECTION_STRING', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missingVars.join(', ')}`);
  }
}

export default currentConfig; 