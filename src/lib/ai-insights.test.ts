import { describe, expect, it } from "vitest";
import { generateInsightNarrative } from "./ai-insights";

describe("generateInsightNarrative (fallback, no ANTHROPIC_API_KEY configured)", () => {
    it("returns the zero-data message when scoreCount is 0", async () => {
        const result = await generateInsightNarrative("student-1", {
            firstName: "Ada",
            predictedGrade: 0,
            confidence: 15,
            strongestArea: "N/A (No Data)",
            areaToImprove: "N/A (No Data)",
            scoreCount: 0,
        });
        expect(result).toMatch(/complete some assessments/i);
    });

    it("returns an encouraging message referencing strongestArea for high grades", async () => {
        const result = await generateInsightNarrative("student-2", {
            firstName: "Ada",
            predictedGrade: 80,
            confidence: 85,
            strongestArea: "Software Architecture",
            areaToImprove: "Databases",
            scoreCount: 5,
        });
        expect(result).toContain("Software Architecture");
    });

    it("returns an improvement-focused message referencing areaToImprove for mid grades", async () => {
        const result = await generateInsightNarrative("student-3", {
            firstName: "Ada",
            predictedGrade: 55,
            confidence: 60,
            strongestArea: "Software Architecture",
            areaToImprove: "Databases",
            scoreCount: 3,
        });
        expect(result).toContain("Databases");
    });

    it("returns an urgent message referencing areaToImprove for low grades", async () => {
        const result = await generateInsightNarrative("student-4", {
            firstName: "Ada",
            predictedGrade: 30,
            confidence: 35,
            strongestArea: "Software Architecture",
            areaToImprove: "Databases",
            scoreCount: 2,
        });
        expect(result).toMatch(/urgent attention/i);
        expect(result).toContain("Databases");
    });
});
