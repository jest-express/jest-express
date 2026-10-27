function requireAuth(req, _res, next) {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Unauthorized: missing authorization header');
    error.status = 401;
    return next(error);
  }

  if (!authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized: invalid token format');
    error.status = 401;
    return next(error);
  }

  req.user = { token: authHeader.slice(7) };
  return next();
}

module.exports = { requireAuth };
