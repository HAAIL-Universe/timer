/**Main router: aggregates routes and applies middleware.*/

const express = require('express');
const cors = require('cors');
const config = require('../config');
const logger = require('../utils/logger');
const healthRouter = require('./health');
const timersRouter = require('./timers');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();

// CORS
router.use(cors({ origin: config.cors.origin }));

// Body parsing
router.use(express.json());

// HTTP request logging
router.use(logger.httpMiddleware(config.logging.level));

// Routes
router.use(healthRouter);
router.use(timersRouter);

// Error handling (must be last)
router.use(errorHandler);

module.exports = router;
