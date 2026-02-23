const { validate: isValidUuid } = require('uuid');

module.exports = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !isValidUuid(id)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Invalid timer ID format: ${id || '(missing)'}. Must be a valid UUID v4.`
    });
  }
  
  next();
};
