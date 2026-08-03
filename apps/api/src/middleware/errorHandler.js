export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.issues });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}
