declare const jest: any;

export interface IMockInstance {
  mockReset(): void;
}

export type Mock = (...args: any[]) => any;

export interface IMock extends IMockInstance, Mock {}

export type NextFunction = IMock;

export const next: NextFunction = jest.fn();
