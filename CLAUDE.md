

<!-- Source: .ruler/AGENTS.md -->

# Senior Developer Guidelines

## Must

- always use client component for all components. (use `use client` directive)
- always use promise for page.tsx params props.
- use valid picsum.photos stock image for placeholder image
- route feature hooks' HTTP requests through `@/lib/remote/api-client`.
- Hono 라우트 경로는 반드시 `/api` prefix를 포함해야 함 (Next.js API 라우트가 `/api/[[...hono]]`에 위치하므로). 예: `app.post('/api/auth/signup', ...)`
- `AppLogger`는 `info`, `error`, `warn`, `debug` 메서드만 제공함. `logger.log()` 대신 `logger.info()` 사용할 것.
- API 응답 스키마에서 `redirectTo` 등 경로 필드는 `z.string().url()` 대신 `z.string()` 사용 (상대 경로 허용).
- **Before starting development**: Run `pnpm env:check` to verify `.env.local` is properly configured.

## Library

use following libraries for specific functionalities:

1. `date-fns`: For efficient date and time handling.
2. `ts-pattern`: For clean and type-safe branching logic.
3. `@tanstack/react-query`: For server state management.
4. `zustand`: For lightweight global state management.
5. `react-use`: For commonly needed React hooks.
6. `es-toolkit`: For robust utility functions.
7. `lucide-react`: For customizable icons.
8. `zod`: For schema validation and data integrity.
9. `shadcn-ui`: For pre-built accessible UI components.
10. `tailwindcss`: For utility-first CSS styling.
11. `supabase`: For a backend-as-a-service solution.
12. `react-hook-form`: For form validation and state management.

## Directory Structure

- src
- src/app: Next.js App Routers
- src/app/api/[[...hono]]: Hono entrypoint delegated to Next.js Route Handler (`handle(createHonoApp())`)
- src/backend/hono: Hono 앱 본체 (`app.ts`, `context.ts`)
- src/backend/middleware: 공통 미들웨어 (에러, 컨텍스트, Supabase 등)
- src/backend/http: 응답 포맷, 핸들러 결과 유틸 등 공통 HTTP 레이어
- src/backend/supabase: Supabase 클라이언트 및 설정 래퍼
- src/backend/config: 환경 변수 파싱 및 캐싱
- src/components/ui: shadcn-ui components
- src/constants: Common constants
- src/hooks: Common hooks
- src/lib: utility functions
- src/remote: http client
- src/features/[featureName]/components/\*: Components for specific feature
- src/features/[featureName]/constants/\*
- src/features/[featureName]/hooks/\*
- src/features/[featureName]/backend/route.ts: Hono 라우터 정의
- src/features/[featureName]/backend/service.ts: Supabase/비즈니스 로직
- src/features/[featureName]/backend/error.ts: 상황별 error code 정의
- src/features/[featureName]/backend/schema.ts: 요청/응답 zod 스키마 정의
- src/features/[featureName]/lib/\*: 클라이언트 측 DTO 재노출 등
- supabase/migrations: Supabase SQL migration 파일 (예시 테이블 포함)

## Backend Layer (Hono + Next.js)

- Next.js `app` 라우터에서 `src/app/api/[[...hono]]/route.ts` 를 통해 Hono 앱을 위임한다. 모든 HTTP 메서드는 `handle(createHonoApp())` 로 노출하며 `runtime = 'nodejs'` 로 Supabase service-role 키를 사용한다.
- `src/backend/hono/app.ts` 의 `createHonoApp` 은 싱글턴으로 관리하되, **development 환경에서는 매번 재생성**하여 HMR 시 라우터 변경사항이 반영되도록 한다. (Singleton pattern with HMR compatibility: only cache in production to ensure route changes are reflected during hot reload)
- `src/backend/hono/app.ts` 의 `createHonoApp` 은 싱글턴으로 관리하며 다음 빌딩블록을 순서대로 연결한다.
  1. `errorBoundary()` – 공통 에러 로깅 및 5xx 응답 정규화.
  2. `withAppContext()` – `zod` 기반 환경 변수 파싱, 콘솔 기반 logger, 설정을 `c.set` 으로 주입.
  3. `withSupabase()` – service-role 키로 생성한 Supabase 서버 클라이언트를 per-request로 주입.
  4. `registerExampleRoutes(app)` 등 기능별 라우터 등록 (모든 라우터는 `src/features/[feature]/backend/route.ts` 에서 정의).
- `src/backend/hono/context.ts` 의 `AppEnv` 는 `c.get`/`c.var` 로 접근 가능한 `supabase`, `logger`, `config` 키를 제공한다. 절대 `c.env` 를 직접 수정하지 않는다.
- 공통 HTTP 응답 헬퍼는 `src/backend/http/response.ts`에서 제공하며, 모든 라우터/서비스는 `success`/`failure`/`respond` 패턴을 사용한다.
- 기능별 백엔드 로직은 `src/features/[feature]/backend/service.ts`(Supabase 접근), `schema.ts`(요청/응답 zod 정의), `route.ts`(Hono 라우터)로 분리한다.
- 프런트엔드가 동일 스키마를 사용할 경우 `src/features/[feature]/lib/dto.ts`에서 backend/schema를 재노출해 React Query 훅 등에서 재사용한다.
- 새 테이블이나 시드 데이터는 반드시 `supabase/migrations` 에 SQL 파일로 추가하고, Supabase에 적용 여부를 사용자에게 위임한다.
- 프론트엔드 레이어는 전부 Client Component (`"use client"`) 로 유지하고, 서버 상태는 `@tanstack/react-query` 로만 관리한다.

## Solution Process:

1. Rephrase Input: Transform to clear, professional prompt.
2. Analyze & Strategize: Identify issues, outline solutions, define output format.
3. Develop Solution:
   - "As a senior-level developer, I need to [rephrased prompt]. To accomplish this, I need to:"
   - List steps numerically.
   - "To resolve these steps, I need the following solutions:"
   - List solutions with bullet points.
4. Validate Solution: Review, refine, test against edge cases.
5. Evaluate Progress:
   - If incomplete: Pause, inform user, await input.
   - If satisfactory: Proceed to final output.
6. Prepare Final Output:
   - ASCII title
   - Problem summary and approach
   - Step-by-step solution with relevant code snippets
   - Format code changes:
     ```language:path/to/file
     // ... existing code ...
     function exampleFunction() {
         // Modified or new code here
     }
     // ... existing code ...
     ```
   - Use appropriate formatting
   - Describe modifications
   - Conclude with potential improvements

## Key Mindsets:

1. Simplicity
2. Readability
3. Maintainability
4. Testability
5. Reusability
6. Functional Paradigm
7. Pragmatism

## Code Guidelines:

1. Early Returns
2. Conditional Classes over ternary
3. Descriptive Names
4. Constants > Functions
5. DRY
6. Functional & Immutable
7. Minimal Changes
8. Pure Functions
9. Composition over inheritance

## Functional Programming:

- Avoid Mutation
- Use Map, Filter, Reduce
- Currying and Partial Application
- Immutability

## Code-Style Guidelines

- Use TypeScript for type safety.
- Follow the coding standards defined in the ESLint configuration.
- Ensure all components are responsive and accessible.
- Use Tailwind CSS for styling, adhering to the defined color palette.
- When generating code, prioritize TypeScript and React best practices.
- Ensure that any new components are reusable and follow the existing design patterns.
- Minimize the use of AI generated comments, instead use clearly named variables and functions.
- Always validate user inputs and handle errors gracefully.
- Use the existing components and pages as a reference for the new components and pages.

## Performance:

- Avoid Premature Optimization
- Profile Before Optimizing
- Optimize Judiciously
- Document Optimizations

## Comments & Documentation:

- Comment function purpose
- Use JSDoc for JS
- Document "why" not "what"

## Function Ordering:

- Higher-order functionality first
- Group related functions

## Handling Bugs:

- Use TODO: and FIXME: comments

## Error Handling:

- Use appropriate techniques
- Prefer returning errors over exceptions

## Testing:

### Test-Driven Development (TDD)

- Follow the **RED → GREEN → REFACTOR** process:
  1. **RED**: Write a failing test first
  2. **GREEN**: Write minimal code to make it pass
  3. **REFACTOR**: Improve code quality while keeping tests green

### E2E Testing

- Write E2E tests for **all specifications** using Playwright
- E2E tests should validate complete user workflows
- Place E2E tests in `e2e/` directory with `.spec.ts` extension
- Refer to `.ruler/test.md` for E2E testing guidelines

### Unit Testing

- Extract business logic into **pure functions** whenever possible
- Write unit tests for all pure functions and complex logic
- Place unit tests next to source files with `.test.ts` or `.test.tsx` extension
- Use Vitest and Testing Library for unit testing
- Focus on behavior, not implementation details

### Testing Guidelines

- See `.ruler/test.md` for comprehensive testing guidelines
- Avoid testing implementation details (overfitting)
- Use accessible queries (getByRole, getByLabelText) over test IDs
- Ensure tests are independent and isolated

### Test Commands

- `pnpm test` - Run unit tests only
- `pnpm test:e2e` - Run E2E tests only
- `pnpm test:all` - **Run unit and E2E tests concurrently (recommended for CI/CD)**
- Use `pnpm test:all` for fast parallel test execution

## Environment Variables

### Validation

- Run `pnpm env:check` to validate `.env.local` configuration
- This command checks all required environment variables using zod schemas
- Always run this before development or deployment

### Required Variables

Must be set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_URL` - Supabase project URL (server-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)

### Usage

```bash
# Validate environment variables
pnpm env:check

# If validation fails, check error output for missing/invalid variables
# Update .env.local accordingly and re-run validation
```

## Next.js

- you must use promise for page.tsx params props.

## Shadcn-ui

- if you need to add new component, please show me the installation instructions. I'll paste it into terminal.
- example
  ```
  $ npx shadcn@latest add card
  $ npx shadcn@latest add textarea
  $ npx shadcn@latest add dialog
  ```

## Supabase

- if you need to add new table, please create migration. I'll paste it into supabase.
- do not run supabase locally
- store migration query for `.sql` file. in /supabase/migrations/

## Package Manager

- use pnpm as package manager.

## Korean Text

- 코드를 생성한 후에 utf-8 기준으로 깨지는 한글이 있는지 확인해주세요. 만약 있다면 수정해주세요.
- 항상 한국어로 응답하세요.

You are a senior full-stack developer, one of those rare 10x devs. Your focus: clean, maintainable, high-quality code.
Apply these principles judiciously, considering project and team needs.

`example` page, table is just example.



<!-- Source: .ruler/supabase.md -->

---
description: Supabase Migration SQL Guideline
globs: supabase/migrations/*.sql
---

# Supabase Migration SQL Guideline

## Must

- Each migration file must have a unique name with number prefix (e.g., `0001_create_users_table.sql`)
- Each migration must be idempotent (can be run multiple times without error)
- Use `CREATE TABLE IF NOT EXISTS` instead of just `CREATE TABLE`
- Include proper error handling with `BEGIN` and `EXCEPTION` blocks
- Add comments for complex operations
- Always specify column types explicitly
- Include proper constraints (NOT NULL, UNIQUE, etc.) where appropriate
- Add updated_at column to all tables, and use trigger to update it
- always check other migrations to avoid conflicts

## Should

- Keep migrations small
- Use consistent naming conventions for tables and columns
- Use snake_case for all identifiers
- Document breaking changes
- MUST NOT use RLS. disable it for all tables

## Recommended Patterns

- Set up proper indexes for frequently queried columns
- Use foreign key constraints to maintain referential integrity
- Leverage Postgres extensions when appropriate
- Use enums for fields with a fixed set of values
- Consider using views for complex queries

## Schema Organization

- Group related tables together
- Use schemas to organize tables by domain
- Consider using Postgres schemas for multi-tenant applications
- Keep authentication tables in the auth schema

## Performance Considerations

- Avoid adding/removing columns from large tables in production
- Use appropriate data types to minimize storage
- Add indexes strategically (not excessively)

## Security Best Practices

- Never store plaintext passwords
- Sanitize/validate all user inputs



<!-- Source: .ruler/test.md -->

# Testing Guidelines

> **Purpose**: This document provides testing guidelines for the supernext project template, designed to help AI coding agents and developers write effective, maintainable tests.

---

## Core Testing Philosophy

### Focus on Behavior, Not Implementation

**Golden Rule**: Tests should verify **user-observable behavior**, not **implementation details**.

This approach ensures:
- ✅ Tests survive refactoring without breaking
- ✅ Tests provide real value by catching actual bugs
- ✅ Tests serve as reliable documentation of expected behavior

**❌ Anti-Pattern: Testing Implementation Details**
```typescript
// DON'T: Testing internal state or implementation
expect(component.state.isLoading).toBe(true);
expect(mockFunction).toHaveBeenCalledWith(specificInternalArg);
```

**✅ Best Practice: Testing User-Observable Behavior**
```typescript
// DO: Test what users see and experience
expect(screen.getByText(/loading/i)).toBeInTheDocument();
expect(await screen.findByRole('button', { name: /submit/i })).toBeEnabled();
```

### Testing Library Principles

Follow these accessibility-first querying strategies:

1. **Query by what users see**: Use `getByRole`, `getByLabelText`, `getByPlaceholderText` first
2. **Avoid test IDs**: Only use `data-testid` as a last resort when no semantic alternative exists
3. **Enforce accessibility**: Let your tests naturally validate that your UI is accessible

**Query Priority (from best to worst)**:
```typescript
// 1. Accessible to everyone (best)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email address/i)

// 2. Semantic queries
screen.getByPlaceholderText(/enter email/i)
screen.getByText(/welcome/i)

// 3. Test IDs (last resort)
screen.getByTestId('submit-button')
```

---

## Unit Testing with Vitest

### Purpose
Validate the logic of individual functions, hooks, and utilities in isolation.

### File Organization
Place test files next to the code they test using the `*.test.ts` or `*.test.tsx` pattern:

```
src/
  features/
    example/
      hooks/
        useExampleQuery.ts
        useExampleQuery.test.ts  # ✅ Collocated with source
      lib/
        dto.ts
        dto.test.ts              # ✅ Easy to find and maintain
```

### Testing Patterns

#### Pattern 1: Pure Function Testing
```typescript
import { describe, it, expect } from 'vitest';
import { formatUserName } from './user-utils';

describe('formatUserName', () => {
  it('should format name correctly', () => {
    expect(formatUserName('John', 'Doe')).toBe('John Doe');
  });

  it('should handle empty last name', () => {
    expect(formatUserName('John', '')).toBe('John');
  });

  it('should handle null values gracefully', () => {
    expect(formatUserName(null, null)).toBe('');
  });
});
```

#### Pattern 2: React Hook Testing
```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExampleQuery } from './useExampleQuery';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return Wrapper;
};

describe('useExampleQuery', () => {
  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useExampleQuery('test-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useExampleQuery('invalid-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
```

#### Pattern 3: React Component Testing
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExampleComponent } from './example-component';

describe('ExampleComponent', () => {
  it('should display user name', () => {
    render(<ExampleComponent name="John Doe" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle button click interaction', async () => {
    const user = userEvent.setup();
    render(<ExampleComponent />);

    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);

    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });

  it('should validate form input', async () => {
    const user = userEvent.setup();
    render(<ExampleComponent />);

    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'invalid-email');

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

### Commands
```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode for development
pnpm test:ui           # Visual UI mode
pnpm test:coverage     # Generate coverage report
```

---

## E2E Testing with Playwright

### Purpose
Validate complete user workflows in a real browser environment. Test API communication, routing, and full user journeys.

### File Organization
Place E2E tests in the `e2e/` directory at project root:

```
e2e/
  example.spec.ts      # Example feature tests
  auth.spec.ts         # Authentication flow tests
  checkout.spec.ts     # Checkout process tests
```

### Testing Patterns

```typescript
import { test, expect } from '@playwright/test';

test.describe('Example Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/example');
  });

  test('should complete successful data retrieval flow', async ({ page }) => {
    // Arrange: Set up the test scenario
    const input = page.getByPlaceholder(/00000000-0000-0000-0000-000000000000/i);
    const submitButton = page.getByRole('button', { name: /submit/i });

    // Act: Perform user actions
    await input.fill('123e4567-e89b-12d3-a456-426614174000');
    await submitButton.click();

    // Assert: Verify expected outcomes
    await expect(page.getByText('Success')).toBeVisible();
    await expect(page.getByText(/ID/i)).toBeVisible();
    await expect(page.getByText(/Name/i)).toBeVisible();
  });

  test('should display error for invalid input', async ({ page }) => {
    // Test error handling
    await page.getByPlaceholder(/00000000-0000-0000-0000-000000000000/i)
      .fill('invalid-id');
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(/request failed/i)).toBeVisible();
  });

  test('should handle loading states correctly', async ({ page }) => {
    // Test async behavior
    const input = page.getByPlaceholder(/00000000-0000-0000-0000-000000000000/i);
    await input.fill('123e4567-e89b-12d3-a456-426614174000');

    const submitButton = page.getByRole('button', { name: /submit/i });
    await submitButton.click();

    // Verify loading state appears
    await expect(page.getByText(/loading/i).or(page.getByText(/fetching/i)))
      .toBeVisible({ timeout: 1000 });
  });
});
```

### Commands
```bash
pnpm test:e2e           # Run E2E tests (headless)
pnpm test:e2e:watch     # Interactive UI mode
pnpm test:e2e:headed    # Run with visible browser
```

---

## Testing Checklist for AI Agents

### Unit Test Checklist
When writing or reviewing unit tests, verify:

- [ ] **Core logic coverage**: Does the test validate the function's primary purpose?
- [ ] **Edge cases**: Are boundary conditions tested (empty values, null, undefined, extreme inputs)?
- [ ] **Dependencies**: Are external dependencies properly mocked or isolated?
- [ ] **Behavior focus**: Does the test verify behavior, not implementation details?
- [ ] **Naming clarity**: Is the test name descriptive and intention-revealing?

### E2E Test Checklist
When writing or reviewing E2E tests, verify:

- [ ] **User scenarios**: Does the test reflect realistic user workflows?
- [ ] **Success & failure paths**: Are both happy paths and error cases covered?
- [ ] **Async handling**: Are page loads and async operations properly awaited?
- [ ] **Accessible selectors**: Do queries use semantic selectors (role, label) over test IDs?
- [ ] **Test isolation**: Can this test run independently without relying on other tests?

---

## Best Practices

### 1. Test Independence
**Rule**: Each test must be completely isolated from others.

```typescript
// ❌ DON'T: Tests depending on execution order
describe('User flow', () => {
  let userId;

  it('creates user', () => {
    userId = createUser(); // Side effect affects next test
  });

  it('updates user', () => {
    updateUser(userId); // Depends on previous test
  });
});

// ✅ DO: Self-contained tests
describe('User flow', () => {
  it('creates user successfully', () => {
    const userId = createUser();
    expect(userId).toBeDefined();
  });

  it('updates existing user', () => {
    const userId = createUser(); // Own setup
    const result = updateUser(userId);
    expect(result.success).toBe(true);
  });
});
```

### 2. AAA Pattern (Arrange-Act-Assert)
Structure tests with clear phases:

```typescript
it('should calculate total price with discount', () => {
  // Arrange: Set up test data and conditions
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ];
  const discountRate = 0.1;

  // Act: Execute the function being tested
  const total = calculateTotal(items, discountRate);

  // Assert: Verify the expected outcome
  expect(total).toBe(225); // (200 + 50) * 0.9
});
```

### 3. Descriptive Test Names
**Pattern**: `should [expected behavior] when [condition]`

```typescript
// ❌ Bad: Vague, unhelpful names
it('test 1', () => { ... });
it('works', () => { ... });
it('returns value', () => { ... });

// ✅ Good: Clear, intention-revealing names
it('should return 404 when user is not found', () => { ... });
it('should disable submit button when form is invalid', () => { ... });
it('should display error message when API call fails', () => { ... });
```

### 4. Test Isolation & Cleanup
Ensure tests clean up after themselves (automatically handled in `vitest.setup.ts`):

```typescript
// vitest.setup.ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup(); // Automatically unmount React components
});
```

### 5. Prevent Flaky Tests

**E2E Flakiness Prevention**:
```typescript
// ❌ DON'T: Hard-coded waits
await page.waitForTimeout(3000); // Brittle, slow

// ✅ DO: Conditional waiting
await expect(page.getByText('Loaded')).toBeVisible(); // Wait for condition

// ❌ DON'T: Timing-dependent assertions
expect(isLoading).toBe(true); // May already be false

// ✅ DO: State-based assertions
await expect(page.getByRole('progressbar')).toBeVisible();
```

**Unit Test Flakiness Prevention**:
```typescript
// ❌ DON'T: Depend on execution order
describe('API', () => {
  let cache = {};

  it('test 1', () => { cache.data = 'value'; }); // Modifies shared state
  it('test 2', () => { expect(cache.data).toBe('value'); }); // Depends on test 1
});

// ✅ DO: Use fresh state for each test
describe('API', () => {
  it('caches data correctly', () => {
    const cache = {};
    cache.data = 'value';
    expect(cache.data).toBe('value');
  });
});
```

### 6. Coverage vs. Quality
**Principle**: Prioritize test quality over coverage percentage.

- ❌ Don't aim for 100% coverage by testing trivial code
- ✅ Focus on critical business logic and user workflows
- ✅ Test edge cases and error paths for important features
- ✅ Ensure high-value features have comprehensive test coverage

---

## Anti-Patterns to Avoid

### ❌ Testing Implementation Details
```typescript
// DON'T: Coupling tests to internal structure
expect(component.state.count).toBe(5);
expect(mockFunction).toHaveBeenCalledTimes(3);

// DO: Test observable behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### ❌ Over-Mocking
```typescript
// DON'T: Mock everything unnecessarily
vi.mock('./utils'); // Mocking internal utilities
vi.mock('react'); // Mocking framework code

// DO: Only mock external dependencies
vi.mock('@/lib/api-client'); // External API calls
```

### ❌ Testing Multiple Concerns in One Test
```typescript
// DON'T: Test too many things at once
it('should handle everything', () => {
  // Tests rendering, clicking, validation, API calls, navigation...
});

// DO: One test, one concern
it('should display validation error when email is invalid', () => {
  // Only tests validation
});
```

---

## Resources for AI Agents

When implementing tests, refer to these authoritative sources:

- **[Vitest Documentation](https://vitest.dev/)** - Official Vitest testing framework guide
- **[Playwright Documentation](https://playwright.dev/)** - Official Playwright E2E testing guide
- **[Testing Library Principles](https://testing-library.com/docs/guiding-principles/)** - Core philosophy and best practices
- **[Testing Library Query Priority](https://testing-library.com/docs/queries/about/#priority)** - Recommended query methods hierarchy

---

## Quick Reference for AI Agents

### When to Write Unit Tests
- ✅ Pure functions with complex logic
- ✅ Custom React hooks
- ✅ Utility functions and helpers
- ✅ Data transformation and validation logic
- ✅ Complex component behavior

### When to Write E2E Tests
- ✅ Critical user flows (authentication, checkout, etc.)
- ✅ Multi-step processes
- ✅ Features involving API integration
- ✅ Navigation and routing scenarios
- ✅ Error handling and recovery flows

### Test Writing Template

```typescript
// Unit Test Template
describe('[ComponentName/FunctionName]', () => {
  it('should [expected behavior] when [condition]', () => {
    // Arrange
    const input = setupTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedValue);
  });
});

// E2E Test Template
test.describe('[Feature Name]', () => {
  test('should [complete user action] successfully', async ({ page }) => {
    // Arrange
    await page.goto('/feature-path');

    // Act
    await page.getByRole('button', { name: /action/i }).click();

    // Assert
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

---

**Remember**: Good tests are an investment in maintainability. Write tests that provide confidence, not just coverage.
