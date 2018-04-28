import { Application } from './application';
import { Express } from './express';
import { next } from './next';
import { Request } from './request';
import { Response } from './response';
import { Router } from './router';

/**
 * Expose `createApplication()`.
 */
exports = module.exports = createApplication;

/**
 * Create an express application.
 */
function createApplication() {
  return new Express();
}

/**
 * Expose constructors.
 */
exports.Express = Express;
exports.Response = Response;
exports.Request = Request;
exports.Next = next;
exports.Router = () => new Router();

/**
 * Expose middleware
 */
const application = new Application();
exports.json = application.json;
exports.query = application.query;
exports.static = application.staticLoad;
exports.urlencoded = application.urlencoded;
exports.resetMocked = application.resetMocked;
