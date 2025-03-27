require("./instrument");
const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig'); // Importa tu configuración
// const { checkApiKey } = require('./middlewares/auth.handler');
// require('./tracing');
const { trace } = require('@opentelemetry/api');
const Sentry = require('@sentry/node');

const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middlewares/error.handler');

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/suscription/webhook') {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});

app.use(express.urlencoded({ extended: true }));

const whitelist = [
  'http://localhost:8080',
  'http://localhost:3000', 
  'https://myapp.co', 
  'http://localhost:5173', 
  'https://gest-client.onrender.com', 
  'https://app.taxrepo.com', 
  'http://192.168.100.143:3000',
  'http://192.168.100.143:3001',
  'http://192.168.100.143:3016',
  'https://test3.pangeanic.com',
  'http://test3.pangeanic.com',
  'api.pangeanic.com',
  'https://ecochat.pangeanic.com',
  'http://admin.local.com',
  'https://api.pangeanic.com',
  'https://ecochat2.pangeanic.com'
];

const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS', origin);
      callback(new Error('no permitido'));
    }
  }
}

app.use(cors(options));

let otelApiSafe;
try {
  otelApiSafe = require('@opentelemetry/api');
} catch (e) {
  console.warn('OpenTelemetry API no está disponible');
}

if (otelApiSafe) {
  app.use((req, res, next) => {
    try {
      const span = otelApiSafe.trace.getSpan(otelApiSafe.context.active());
      if (span) {
        span.updateName(`${req.method} ${req.path}`);
      }
    } catch (err) {
      console.warn('Error al renombrar la transacción con OpenTelemetry:', err.message);
    }
    next();
  });
}

require('./utils/auth');

app.get('/', (req, res) => {
  res.send('Welcome to ECOChat');
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use('/service/ecochat/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/service/ecochat', (req, res) => {
  res.send('Welcome to ECOChat');
});

app.get('/service/ecochat/healthcheck', (req, res) => {
  console.log('healthcheck');
  res.send({"message": "It's working!"});
});

routerApi(app);

Sentry.setupExpressErrorHandler(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Mi port ${port}`);
});
