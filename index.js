const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');
//const { checkApiKey } = require('./middlewares/auth.handler');

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
  'https://test3.pangeanic.com',
  'http://test3.pangeanic.com',
  'api.pangeanic.com',
  'https://ecochat.pangeanic.com',
  'http://admin.local.com'
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

require('./utils/auth');

app.get('/', (req, res) => {
  res.send('Welcome to ECOChat');
});

app.get('/service/ecochat', (req, res) => {
  res.send('Welcome to ECOChat');
});

app.get('/service/ecochat/healthcheck', (req, res) => {
  console.log('healthcheck');
  res.send({"message": "It's working!"});
});


routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Mi port ${port}`);
});
