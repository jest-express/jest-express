import type { RequestHandler } from 'express';
import { Router } from 'express';
import { defaultUserService, type UserService } from '../services/user-service.js';
import { HttpError } from '../types.js';

export function listUsersHandler(userService: UserService): RequestHandler {
  // Express 5 forwards a rejected promise to next(err), so async handlers don't need
  // try/catch: if userService.list() rejects, the error handler receives it.
  return async (_req, res) => {
    const users = await userService.list();
    res.json({ users });
  };
}

export function getUserByIdHandler(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    if (!userId) {
      return next(new HttpError(400, 'Invalid user ID'));
    }
    const user = await userService.findById(userId);
    if (!user) {
      return next(new HttpError(404, `User ${userId} not found`));
    }
    res.json(user);
  };
}

export function createUserHandler(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    const { name, email } = req.body ?? {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return next(new HttpError(400, 'Name is required'));
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return next(new HttpError(400, 'A valid email is required'));
    }

    const created = await userService.create({ name: name.trim(), email: email.trim() });
    res.status(201).json(created);
  };
}

export function createUsersRouter(userService: UserService = defaultUserService): Router {
  const router = Router();

  router.get('/', listUsersHandler(userService));
  router.get('/:id', getUserByIdHandler(userService));
  router.post('/', createUserHandler(userService));

  return router;
}
