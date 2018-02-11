declare const jest: any;

export class Response {
  public render: any;
  public send: any;
  public status: any;
  public type: any;
  public write: any;
  public end: any;

  constructor() {
    this.render = jest.fn();
    this.send = jest.fn();
    this.status = jest.fn(() => {
      return {
        send: this.send,
      };
    });
    this.type = jest.fn();
    this.write = jest.fn();
    this.end = jest.fn();
    return this;
  }

  public resetMocked() {
    this.render.mockReset();
    this.send.mockReset();
    this.status.mockReset();
    this.type.mockReset();
    this.write.mockReset();
    this.end.mockReset();
  }
}
