const express = require('express');
const { requireAuth } = require('./middleware/auth');
const { createUsersRouter } = require('./routes/users');

function createApp(options = {}) {
  const app = express();
  const userService = options.userService;

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/users', requireAuth, createUsersRouter(userService));

  return app;
}

module.exports = { createApp };
