import { z } from "zod";

function formatIssues(error: z.ZodError) {
    return error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

const serverSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().min(1, "NEXTAUTH_URL is required"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM_ADDRESS: z.string().optional(),
});

let cachedServerEnv: z.infer<typeof serverSchema> | undefined;

/** Validates and returns server-only env vars. Call only from server code (never bundled to the client). */
export function getServerEnv() {
    if (cachedServerEnv) return cachedServerEnv;

    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
        throw new Error(`Invalid server environment variables:\n${formatIssues(parsed.error)}`);
    }

    cachedServerEnv = parsed.data;
    return cachedServerEnv;
}

const publicSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z
        .string()
        .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is required"),
});

const parsedPublicEnv = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
});

if (!parsedPublicEnv.success) {
    throw new Error(
        `Invalid public environment variables:\n${formatIssues(parsedPublicEnv.error)}`
    );
}

/** Validated NEXT_PUBLIC_* env vars, safe to import from client or server code. */
export const publicEnv = parsedPublicEnv.data;
