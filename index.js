'use strict';
var Express = require('./lib/express').Express;
var Request = require('./lib/request').Request;
var Response = require('./lib/response').Response;
var Router = require('./lib/router').Router;
var Application = require('./lib/application').Application;

function createApplication() {
  return new Express();
}

var application = new Application();

exports.Request = Request;
exports.Response = Response;
exports.Router = Router;
exports.json = application.json;
exports.query = application.query;
exports.static = application.staticLoad;
exports.urlencoded = application.urlencoded;
exports.resetApplication = application.resetMocked;
exports = module.exports = createApplication;
