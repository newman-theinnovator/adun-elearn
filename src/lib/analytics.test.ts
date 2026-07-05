import { describe, expect, it } from "vitest";
import { getGradePoint, getLetterGrade, predictFinalScore } from "./analytics";

describe("getGradePoint", () => {
    it.each([
        [70, 5.0],
        [60, 4.0],
        [50, 3.0],
        [45, 2.0],
        [40, 1.0],
        [39, 0.0],
    ])("maps score %i to grade point %f", (score, expected) => {
        expect(getGradePoint(score)).toBe(expected);
    });
});

describe("getLetterGrade", () => {
    it.each([
        [70, "A"],
        [60, "B"],
        [50, "C"],
        [45, "D"],
        [40, "E"],
        [0, "F"],
    ])("maps score %i to letter grade %s", (score, expected) => {
        expect(getLetterGrade(score)).toBe(expected);
    });
});

describe("predictFinalScore", () => {
    it("weights quiz 30%, assignment 40%, engagement 15%, forum 5%, content 10%", () => {
        const { score } = predictFinalScore({
            averageQuizScore: 100,
            averageAssignmentScore: 100,
            engagementScore: 100,
            forumParticipationScore: 100,
            contentCompletionRate: 100,
        });
        expect(score).toBeCloseTo(100);
    });

    it("returns 0 confidence contribution for zeroed metrics but keeps the base 15", () => {
        const { confidence } = predictFinalScore({
            averageQuizScore: 0,
            averageAssignmentScore: 0,
            engagementScore: 0,
            forumParticipationScore: 0,
            contentCompletionRate: 0,
        });
        expect(confidence).toBe(15);
    });

    it("caps confidence at 85", () => {
        const { confidence } = predictFinalScore({
            averageQuizScore: 100,
            averageAssignmentScore: 100,
            engagementScore: 100,
            forumParticipationScore: 100,
            contentCompletionRate: 100,
        });
        expect(confidence).toBe(85);
    });
});
