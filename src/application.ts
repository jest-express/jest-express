declare const jest: any;

export class Application {
  public json: any;
  public staticLoad: any;
  public query: any;
  public urlencoded: any;

  constructor() {
    this.json = jest.fn();
    this.staticLoad = jest.fn();
    this.query = jest.fn();
    this.urlencoded = jest.fn();
    return this;
  }

  public resetMocked() {
    this.json.mockReset();
    this.staticLoad.mockReset();
    this.query.mockReset();
    this.urlencoded.mockReset();
  }
}
