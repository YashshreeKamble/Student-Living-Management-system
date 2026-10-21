function errorHandler(error, _request, response, _next) {
  console.error('Server error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((val) => val.message);
    return response.status(400).json({ error: messages.join('. ') });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return response
      .status(409)
      .json({ error: `An account with this ${field} already exists.` });
  }

  // CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid resource ID' });
  }

  const statusCode = error.statusCode || 500;
  return response.status(statusCode).json({
    error: error.message || 'An unexpected server error occurred.'
  });
}

module.exports = errorHandler;
