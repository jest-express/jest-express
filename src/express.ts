import { Request } from './request';
import { Response } from './response';

declare const jest: any;

export class Express {
  public request: any;
  public response: any;
  public get: any;
  public route: any;
  public set: any;
  public use: any;
  private setting: any;

  constructor() {
    this.setting = {};
    this.request = new Request();
    this.response = new Response();
    this.get = jest.fn((path: any, callback: any) => {
      if (typeof path === 'string' && callback === undefined) {
        return this.setting[path];
      }
      if (typeof path === 'string' && typeof callback === 'function') {
        return callback(this.request, this.response);
      }
      return path(this.request, this.response);
    });
    this.route = jest.fn(() => {
      return {
        get: this.get,
      };
    });
    this.set = jest.fn((key: any, value: any) => {
      this.setting[key] = value;
    });
    this.use = jest.fn();
    return this;
  }

  public resetMocked() {
    this.setting = {};
    this.request.resetMocked();
    this.response.resetMocked();
    this.set.mockReset();
    this.get.mockReset();
    this.route.mockReset();
    this.use.mockReset();
  }
}
