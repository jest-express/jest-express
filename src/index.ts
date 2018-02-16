import { Application } from './application';
import { Express } from './express';

const {
  json,
  query,
  resetMocked,
  staticLoad,
  urlencoded,
} = new Application();

export { Express } from './express';
export { Request } from './request';
export { Response } from './response';
export { Router } from './router';
export {
  json,
  query,
  resetMocked,
  urlencoded,
};
export { staticLoad as static };
export default new Express();
