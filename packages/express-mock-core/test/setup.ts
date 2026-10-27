import { vi } from 'vitest';

import { configure } from '../src/mock';

configure({ fn: vi.fn });
