const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const timerRoutes = require('./routes/timerRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {}));
  app.use(morgan('dev'));
  app.use(express.json());

  app.use('/api/timers', timerRoutes);
  app.use('/api', healthRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
