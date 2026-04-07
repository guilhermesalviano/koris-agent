# OpenCrawDI Tests

Comprehensive test suite for CLI and Telegram interfaces.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

```
src/
├── agent/
│   ├── processor.test.ts      # Message processor tests
│   └── commands.test.ts       # Command handler tests
├── sub-instructions/
│   ├── detect-instruction.test.ts  # Instruction detection tests
│   ├── read-file.test.ts           # File reading tests
│   └── list-directory.test.ts      # Directory listing tests
└── telegram/
    └── handlers.test.ts       # Telegram bot handler tests
```

## Test Coverage

- **Message Processor**: Command routing, instruction detection, Markdown escaping
- **Command Handler**: All commands (/start, /help, /status, /exit, etc.)
- **Instruction Detection**: Pattern matching for read, write, list, search, execute
- **File Operations**: Reading files, listing directories, error handling
- **Telegram Handlers**: Message processing, bot integration, Markdown formatting

## Writing New Tests

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('My Module', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('./module', () => ({
  function: vi.fn(),
}));

// Mock implementation
vi.mocked(function).mockReturnValue('mocked value');
```

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
```

## Notes

- Tests use Vitest (fast, ESM-native)
- Mocks are used for external dependencies (Telegram bot, file system)
- Tests are co-located with source files (*.test.ts)
- Tests run in Node environment
