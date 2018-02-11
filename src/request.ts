declare const jest: any;

export class Request {
  public query: any;
  public params: any;

  constructor() {
    this.query = {};
    this.params = {};
    return this;
  }

  public resetMocked() {
    this.query = {};
    this.params = {};
  }

  public setQuery(key: string, value: string) {
    this.query[key] = value;
  }

  public setParams(key: string, value: string) {
    this.params[key] = value;
  }
}
