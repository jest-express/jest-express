'use strict';
var Request = require('./lib/request').Request;
var Response = require('./lib/response').Response;
var Router = require('./lib/router').Router;
var Express = require('./lib/express').Express;
var Application = require('./lib/application').Application;

module.exports.Request = Request;
module.exports.Response = Response;
module.exports.Router = Router;

function createApplication() {
  return new Express();
}

module.exports = createApplication;

var application = new Application();
module.exports.json = application.json;
module.exports.query = application.query;
module.exports.static = application.staticLoad;
module.exports.urlencoded = application.urlencoded;
module.exports.resetApplication = application.resetMocked;
