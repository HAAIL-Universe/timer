/**
 * Timer routes: POST /timers, GET /timers/:id, POST /timers/:id/start, POST /timers/:id/stop.
 */

const express = require('express');
const timerService = require('../services/timerService');
const { TimerNotFoundError } = require('../services/timerService');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/timers', async (req, res, next) => {
  try {
    const timer = await timerService.createTimer();
    res.status(201).json(timer);
  } catch (err) {
    next(err);
  }
});

router.get('/timers/:id', async (req, res, next) => {
  try {
    const timer = await timerService.getTimer(req.params.id);
    res.status(200).json(timer);
  } catch (err) {
    if (err instanceof TimerNotFoundError) {
      return res.status(404).json({
        error: 'Timer not found',
        message: `No timer exists with id ${req.params.id}`,
      });
    }
    next(err);
  }
});

router.post('/timers/:id/start', async (req, res, next) => {
  try {
    const timer = await timerService.startTimer(req.params.id);
    res.status(200).json(timer);
  } catch (err) {
    if (err instanceof TimerNotFoundError) {
      return res.status(404).json({
        error: 'Timer not found',
        message: `No timer exists with id ${req.params.id}`,
      });
    }
    next(err);
  }
});

router.post('/timers/:id/stop', async (req, res, next) => {
  try {
    const timer = await timerService.stopTimer(req.params.id);
    res.status(200).json(timer);
  } catch (err) {
    if (err instanceof TimerNotFoundError) {
      return res.status(404).json({
        error: 'Timer not found',
        message: `No timer exists with id ${req.params.id}`,
      });
    }
    next(err);
  }
});

module.exports = router;
