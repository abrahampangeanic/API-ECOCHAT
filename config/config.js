require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'dev',
  isProd: process.env.NODE_ENV === 'production',
  apiUrl: process.env.API_URL,
  modulePipeline:  process.env.MODULE_PIPELINE,
  moduleExtractor:  process.env.MODULE_EXTRACTOR,
  moduleScraping:  process.env.MODULE_SCRAPING,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  dbUrl: process.env.DATABASE_URL,
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  },

  // smtpEmail: process.env.SMTP_EMAIL,
  // smtpPassword: process.env.SMTP_PASSWORD,
  // stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  // stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  // stripeWebHookKey: process.env.STRIPE_WEBHOOK_KEY,
  // appUrl: process.env.APP_URL,
  // stripeClient: process.env.STRIPE_CLIENT,
  // stripeBasic: process.env.STRIPE_BASIC,
  // stripeExpert: process.env.STRIPE_EXPERT,
  // stripePremium: process.env.STRIPE_PREMIUM
}

module.exports = { config };
