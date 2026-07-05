import "@testing-library/jest-dom/vitest";

// Dummy values so src/lib/env.ts validation doesn't throw when test files import
// modules that transitively pull in env.ts. Real values come from .env in dev/prod.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||= "test-publishable-key";
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
process.env.DIRECT_URL ||= "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_SECRET ||= "test-secret";
process.env.NEXTAUTH_URL ||= "http://localhost:3000";
