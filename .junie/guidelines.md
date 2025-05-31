# Ledger App Development Guidelines

This document provides essential information for developers working on the Ledger App project.

## Project Overview

Ledger App is a desktop application built with Tauri, combining a React frontend with a Rust backend. The application allows users to view and manage financial accounts.

## Build and Configuration Instructions

### Prerequisites

- Node.js (v16+)
- Rust (latest stable)
- Tauri CLI

### Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Development Workflow

1. Start the development server:
   ```
   npm run tauri dev
   ```
   This will start both the Vite development server for the frontend and the Tauri development environment.

2. Build for production:
   ```
   npm run tauri build
   ```
   This will create optimized builds for your target platforms in the `src-tauri/target/release` directory.

### Configuration Files

- **package.json**: Frontend dependencies and npm scripts
- **vite.config.ts**: Vite configuration for the frontend
- **src-tauri/tauri.conf.json**: Tauri configuration (window size, app metadata, etc.)
- **src-tauri/Cargo.toml**: Rust dependencies and package configuration

## Testing Information

### Testing Setup

The project uses Vitest with React Testing Library for frontend testing. The testing environment is configured to use jsdom for simulating a browser environment.

### Running Tests

Run all tests once:
```
npm test
```

Run tests in watch mode (for development):
```
npm run test:watch
```

### Adding New Tests

1. Create test files with the naming convention `*.test.tsx` or `*.test.ts` adjacent to the files they test.
2. Use the Vitest and React Testing Library APIs for writing tests.

#### Example Test

Here's a simple example of testing a React component:

```
// Component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Mocking Tauri API

When testing components that use Tauri's API, you'll need to mock the API calls:

```
import { vi } from 'vitest';

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd) => {
    if (cmd === 'your_command') {
      return Promise.resolve(yourMockData);
    }
    return Promise.reject(new Error('Unknown command'));
  }),
}));
```

## Rust Backend Development

### Command Structure

Tauri commands are defined in `src-tauri/src/lib.rs` using the `#[tauri::command]` attribute macro:

```
#[tauri::command]
fn your_command(param: &str) -> Result<YourReturnType, String> {
    // Implementation
}
```

Remember to register your commands in the `run()` function:

```
// In your run() function
.invoke_handler(tauri::generate_handler![command1, command2])
```

### Calling Rust from Frontend

Use the `invoke` function from Tauri API:

```
import { invoke } from '@tauri-apps/api/core';

// Call a Rust command
const result = await invoke<ReturnType>('command_name', { param1: value1 });
```

## Code Style and Conventions

### Frontend

- Use functional components with hooks
- Use TypeScript for type safety
- Follow React best practices for state management
- Use async/await for asynchronous operations

### Backend

- Follow Rust idioms and conventions
- Use proper error handling with Result types
- Document public functions and modules

## Debugging

### Frontend

- Use browser developer tools for React debugging
- Use console.log for simple debugging
- Consider using React DevTools for component inspection

### Backend

- Use `println!` or the `log` crate for logging in Rust code
- Check the Tauri console output for backend logs

## Deployment

Build the application for distribution:

```
npm run tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle` directory.