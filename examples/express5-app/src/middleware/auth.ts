import type { RequestHandler } from 'express';
import { HttpError } from '../types.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return next(new HttpError(401, 'Unauthorized: missing authorization header'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Unauthorized: invalid token format'));
  }

  const token = authHeader.slice(7);
  if (token !== 'secret-token') {
    return next(new HttpError(403, 'Forbidden: invalid token'));
  }

  return next();
};
