declare const jest: any;
// https://expressjs.com/en/4x/api.html#res
export class Response {
  // Properties
  public headersSent: boolean;
  public locals: any;
  // Methods
  public append: any;
  public attachment: any;
  public cookie: any;
  public clearCookie: any;
  public download: any;
  public end: any;
  public format: any;
  public get: any;
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
  public vary: any;

  constructor() {
    // Properties
    this.headersSent = false;
    this.locals = {};
    // Methods
    this.append = jest.fn();
    this.attachment = jest.fn();
    this.cookie = jest.fn();
    this.clearCookie = jest.fn();
    this.download = jest.fn();
    this.end = jest.fn();
    this.format = jest.fn();
    this.get = jest.fn();
    this.json = jest.fn();
    this.jsonp = jest.fn();
    this.links = jest.fn();
    this.location = jest.fn();
    this.redirect = jest.fn();
    this.render = jest.fn();
    this.send = jest.fn();
    this.sendFile = jest.fn();
    this.sendStatus = jest.fn();
    this.set = jest.fn();
    this.setHeader = jest.fn();
    this.status = jest.fn(() => {
      return {
        end: this.end,
        send: this.send,
        sendFile: this.sendFile,
      };
    });
    this.type = jest.fn();
    this.vary = jest.fn();
    return this;
  }

  public setHeadersSent(value: boolean) {
    this.headersSent = value;
  }

  public setLocals(key: string, value: string) {
    this.locals[key] = value;
  }

  public resetMocked() {
    // Properties
    this.headersSent = false;
    this.locals = {};
    // Methods
    this.append.mockReset();
    this.attachment.mockReset();
    this.cookie.mockReset();
    this.clearCookie.mockReset();
    this.download.mockReset();
    this.end.mockReset();
    this.format.mockReset();
    this.get.mockReset();
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
    this.type.mockReset();
    this.vary.mockReset();
  }
}
