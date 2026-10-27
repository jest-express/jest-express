import { configure, type MockFactory } from 'express-mock-core';

declare const jest: { fn: MockFactory };

configure({ fn: jest.fn });
