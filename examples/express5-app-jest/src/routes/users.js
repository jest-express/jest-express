const { Router } = require('express');

function createUsersRouter(userService) {
  const router = Router();

  router.get('/', listUsersHandler(userService));
  router.get('/:id', getUserHandler(userService));
  router.post('/', createUserHandler(userService));

  return router;
}

function getUserHandler(userService) {
  return (req, res, next) => {
    const { id } = req.params;
    const user = userService ? userService.findById(id) : null;
    if (!user) {
      const error = new Error(`User not found: ${id}`);
      error.status = 404;
      return next(error);
    }
    return res.status(200).json(user);
  };
}

function createUserHandler(userService) {
  return (req, res, next) => {
    const { name, email } = req.body || {};
    if (!name || !email) {
      const error = new Error('Name and email are required');
      error.status = 400;
      return next(error);
    }
    const created = userService ? userService.create({ name, email }) : { id: '1', name, email };
    return res.status(201).json(created);
  };
}

function listUsersHandler(userService) {
  return async (_req, res) => {
    const users = await userService.list();
    res.status(200).json({ users });
  };
}

module.exports = {
  createUsersRouter,
  getUserHandler,
  createUserHandler,
  listUsersHandler,
};
