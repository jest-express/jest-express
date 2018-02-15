import { Express } from './express';

export { Express } from './express';
export { Request } from './request';
export { Response } from './response';
export { Router } from './router';
export default function () {
  return new Express();
}
