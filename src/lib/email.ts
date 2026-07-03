import { Resend } from "resend";
import { getServerEnv } from "./env";

// Initialize Resend only if the API key is present in the environment
const resend = getServerEnv().RESEND_API_KEY ? new Resend(getServerEnv().RESEND_API_KEY) : null;

/**
 * Utility to send transactional emails (e.g. notifications, grades available, new posts).
 * Falls back to console.log in development if RESEND_API_KEY is missing.
 */
export async function sendNotificationEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
) {
    if (!resend) {
        // Dev fallback
        console.log("\n=============================================");
        console.log(`[EMAIL MOCK] Would have sent email to: ${to}`);
        console.log(`[SUBJECT]: ${subject}`);
        console.log(`[BODY]:\n${text}`);
        console.log("=============================================\n");
        return { success: true, mocked: true };
    }

    try {
        const data = await resend.emails.send({
            // Note: you will need to verify a domain in Resend to use a custom 'from' address
            from: getServerEnv().EMAIL_FROM_ADDRESS || "Adun e-Learn <onboarding@resend.dev>",
            to,
            subject,
            text,
            html: html || text.replace(/\n/g, "<br/>"),
        });
        return { success: true, data };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { success: false, error };
    }
}
