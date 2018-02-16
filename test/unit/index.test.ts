import src from '../../src';
import {Application} from '../../src/application';
import {Request as RealRequest} from '../../src/request';
import {Response as RealResponse} from '../../src/response';
import {Router as RealRouter} from '../../src/router';
import {Express as RealExpress} from '../../src/express';
import {
  Router,
  Response,
  Request,
  Express,
  resetMocked,
} from '../../src';

let application: Application;

describe('Exporter', () => {
  test('Default export is a instance of express', () => {
    expect(src()).toBeInstanceOf(Express);
  });

  test('Router is a instance of Router class', () => {
    expect(Router).toEqual(RealRouter);
  });

  test('Response is a instance of Response class', () => {
    expect(Response).toEqual(RealResponse);
  });

  test('Express is a instance of Express class', () => {
    expect(Express).toEqual(RealExpress);
  });

  test('Request is a instance of Request class', () => {
    expect(Request).toEqual(RealRequest);
  });

  test('resetMocked is a instance of Application resetMocked function', () => {
    application = new Application();

    expect(resetMocked).toEqual(application.resetMocked);
  });
});
