import { configure } from 'express-mock-core';
import { vi } from 'vitest';

configure({ fn: vi.fn });
