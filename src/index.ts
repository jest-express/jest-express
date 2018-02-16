import { Express } from './express'
import { Application } from './application'

export { Request } from './request'
export { Response } from './response'
export { Router } from './router'

const { json, query, urlencoded, staticLoad, resetMocked } = new Application();
export { json, query, urlencoded, resetMocked };
export { staticLoad as static };
export default new Express()
