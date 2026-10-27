import { vi } from 'vitest';

// Temporary bridge until T3.1 removes src/'s global `jest.fn()` calls (bug B5).
(globalThis as Record<string, unknown>).jest = vi;
