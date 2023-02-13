declare const jest: any;
// https://expressjs.com/en/4x/api.html#res
export class Response {
  // Properties
  public headers: any;

  public headersSent: boolean;

  public locals: any;

  public statusCode: number;

  // Methods
  public append: any;

  public attachment: any;

  public body: any;

  public cookie: any;

  public clearCookie: any;

  public download: any;

  public end: any;

  public format: any;

  public get: any;

  public header: any;

  public json: any;

  public jsonp: any;

  public links: any;

  public location: any;

  public redirect: any;

  public render: any;

  public send: any;

  public sendFile: any;

  public sendStatus: any;

  public set: any;

  public setHeader: any;

  public status: any;

  public type: any;

  public text: any;

  public vary: any;

  public removeHeader: any;

  constructor() {
    // Properties
    this.headers = {};
    this.headersSent = false;
    this.locals = {};
    this.body = {};
    this.statusCode = 200;
    // Methods
    this.append = jest.fn(() => this);
    this.attachment = jest.fn(() => this);
    this.cookie = jest.fn(() => this);
    this.clearCookie = jest.fn(() => this);
    this.download = jest.fn();
    this.end = jest.fn((data: any) => this.body = data);
    this.format = jest.fn(() => this);
    this.get = jest.fn();
    this.header = jest.fn((key: any, value: string | void) => {
      if (typeof value === 'string') {
        this.set(key, value);
      } else {
        this.set(key);
      }
      return this;
    });
    this.json = jest.fn((data : any) => {
      this.body = data;
      return this;
    });
    this.jsonp = jest.fn((data : any) => {
      this.body = data;
      return this;
    });
    this.links = jest.fn(() => this);
    this.location = jest.fn(() => this);
    this.redirect = jest.fn((status : number, url : string) => {
      if (url) {
        this.statusCode = status;
        this.setHeader('Location', url);
      } else {
        this.statusCode = 307;
        this.setHeader('Location', status);
      }
    });
    this.render = jest.fn();
    this.send = jest.fn((data: any) => {
      this.body = data;
      return this;
    });
    this.sendFile = jest.fn();
    this.sendStatus = jest.fn();
    this.set = jest.fn((key: string | { [key: string]: string }, value: string | void) => {
      if (typeof key === 'string') {
        this.setHeader(key, value);
      } else {
        for (const k of Object.keys(key)) {
          this.set(k, key[k]);
        }
      }
      return this;
    });
    this.setHeader = jest.fn((key: string, value: string) => {
      this.headers[key] = value;
      return this;
    });
    this.status = jest.fn((statusCode: number): this => {
      this.statusCode = statusCode;
      return this;
    });
    this.type = jest.fn(() => this);
    this.text = jest.fn((data: any) => {
      this.body = data;
      return this;
    });
    this.vary = jest.fn(() => this);
    this.removeHeader = jest.fn(() => this);

    return this;
  }

  public getHeader(key: string): string | void {
    return this.headers[key];
  }

  public setHeadersSent(value: boolean) {
    this.headersSent = value;
  }

  public setLocals(key: string, value: string) {
    this.locals[key] = value;
  }

  public resetMocked() {
    // Properties
    this.headers = {};
    this.headersSent = false;
    this.locals = {};
    // Methods
    this.append.mockReset();
    this.attachment.mockReset();
    this.cookie.mockReset();
    this.body = {};
    this.clearCookie.mockReset();
    this.download.mockReset();
    this.end.mockReset();
    this.format.mockReset();
    this.get.mockReset();
    this.header.mockReset();
    this.json.mockReset();
    this.jsonp.mockReset();
    this.links.mockReset();
    this.location.mockReset();
    this.redirect.mockReset();
    this.render.mockReset();
    this.send.mockReset();
    this.sendFile.mockReset();
    this.sendStatus.mockReset();
    this.set.mockReset();
    this.setHeader.mockReset();
    this.status.mockReset();
    this.text.mockReset();
    this.type.mockReset();
    this.vary.mockReset();
    this.removeHeader.mockReset();
  }
}
