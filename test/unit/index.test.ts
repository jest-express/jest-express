import * as express from '../../src';
import { Application } from '../../src/application';
import { Request as RealRequest } from '../../src/request';
import { Response as RealResponse } from '../../src/response';
import { Router as RealRouter } from '../../src/router';
import { Express as RealExpress } from '../../src/express';
import { next as RealNext } from '../../src/next';

let application: Application;

describe('Exporter', () => {
  test('Default export is a instance of express', () => {
    expect(express()).toBeInstanceOf(RealExpress);
  });

  test('Router is a instance of Router class', () => {
    expect(express.Router()).toBeInstanceOf(RealRouter);
  });

  test('Response is a instance of Response class', () => {
    expect(express.Response).toEqual(RealResponse);
  });

  test('Express is a instance of Express class', () => {
    expect(express.Express).toEqual(RealExpress);
  });

  test('Request is a instance of Request class', () => {
    expect(express.Request).toEqual(RealRequest);
  });

  test('Next is a instance of Next function', () => {
    expect(express.Next).toEqual(RealNext);
  });

  test('resetMocked is a instance of Application resetMocked function', () => {
    application = new Application();

    expect(express.resetMocked).toEqual(application.resetMocked);
  });
});
