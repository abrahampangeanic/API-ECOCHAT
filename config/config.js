require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'dev',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET,
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
