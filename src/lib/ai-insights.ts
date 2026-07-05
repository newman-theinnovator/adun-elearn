import Anthropic from "@anthropic-ai/sdk";
import { getServerEnv } from "./env";

const anthropic = getServerEnv().ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: getServerEnv().ANTHROPIC_API_KEY })
    : null;

const MODEL = "claude-haiku-4-5-20251001";

export type InsightNarrativeInput = {
    firstName: string;
    predictedGrade: number;
    confidence: number;
    strongestArea: string;
    areaToImprove: string;
    scoreCount: number;
};

/** Rule-based fallback used when ANTHROPIC_API_KEY isn't configured. */
function fallbackExplanation(input: InsightNarrativeInput): string {
    const { scoreCount, predictedGrade, strongestArea, areaToImprove } = input;
    if (scoreCount === 0) {
        return "Complete some assessments or wait for grades to start receiving personalised analytics.";
    }
    if (predictedGrade >= 70) {
        return `Excellent trajectory. Your performance in ${strongestArea} is a key strength. Maintain your current engagement level.`;
    }
    if (predictedGrade >= 50) {
        return `Solid foundation. Targeted effort on ${areaToImprove} can push your overall performance significantly higher.`;
    }
    return `Your current scores suggest urgent attention is needed in ${areaToImprove}. Reach out to your lecturer for guidance.`;
}

type CacheEntry = { explanation: string; expiresAt: number };
const CACHE_TTL_MS = 10 * 60_000;
const cache = new Map<string, CacheEntry>();

/**
 * Generates a short personalized narrative for the student's dashboard AI insights
 * card. Falls back to a deterministic rule-based sentence when no Anthropic API key
 * is configured, so local dev works without one.
 */
export async function generateInsightNarrative(
    studentId: string,
    input: InsightNarrativeInput
): Promise<string> {
    const cached = cache.get(studentId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.explanation;
    }

    if (!anthropic || input.scoreCount === 0) {
        return fallbackExplanation(input);
    }

    try {
        const message = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 200,
            messages: [
                {
                    role: "user",
                    content: `You are an academic advisor writing a short, encouraging note to a Software Engineering student named ${input.firstName}.

Their data:
- Predicted overall score: ${input.predictedGrade}%
- Confidence in this prediction: ${input.confidence}%
- Strongest course: ${input.strongestArea}
- Course needing the most improvement: ${input.areaToImprove}

Write 2-3 sentences of personalized narrative feedback plus one concrete, actionable recommendation. Be warm but direct. Do not use markdown formatting. Address them by first name once.`,
                },
            ],
        });

        const textBlock = message.content.find((block) => block.type === "text");
        const explanation = textBlock?.text?.trim();
        if (!explanation) {
            return fallbackExplanation(input);
        }

        cache.set(studentId, { explanation, expiresAt: Date.now() + CACHE_TTL_MS });
        return explanation;
    } catch (error) {
        console.error("Anthropic insight generation failed, using fallback:", error);
        return fallbackExplanation(input);
    }
}
