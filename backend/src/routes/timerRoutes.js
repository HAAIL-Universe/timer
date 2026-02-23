const express = require('express');
const timerService = require('../services/timerService');
const validateUuid = require('../middleware/validateUuid');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const timer = await timerService.createTimer();
    res.status(201).json(timer);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateUuid, async (req, res, next) => {
  try {
    const timer = await timerService.getTimer(req.params.id);
    if (!timer) {
      return res.status(404).json({
        error: 'Timer not found',
        message: `No timer exists with id ${req.params.id}`
      });
    }
    res.status(200).json(timer);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/start', validateUuid, async (req, res, next) => {
  try {
    const timer = await timerService.startTimer(req.params.id);
    if (!timer) {
      return res.status(404).json({
        error: 'Timer not found',
        message: `No timer exists with id ${req.params.id}`
      });
    }
    res.status(200).json(timer);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/stop', validateUuid, async (req, res, next) => {
  try {
    const timer = await timerService.stopTimer(req.params.id);
    if (!timer) {
      return res.status(404).json({
        error: 'Timer not found',
        message: `No timer exists with id ${req.params.id}`
      });
    }
    res.status(200).json(timer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
