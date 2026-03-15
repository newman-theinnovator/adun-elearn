// ADUN Grading Scale mappings
export function getGradePoint(score: number): number {
    if (score >= 70) return 5.0;
    if (score >= 60) return 4.0;
    if (score >= 50) return 3.0;
    if (score >= 45) return 2.0;
    if (score >= 40) return 1.0;
    return 0.0;
}

export function getLetterGrade(score: number): string {
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 45) return "D";
    if (score >= 40) return "E";
    return "F";
}

// Predict final grade based on formula
export function predictFinalScore(metrics: {
    averageQuizScore: number;
    averageAssignmentScore: number;
    engagementScore: number;
    forumParticipationScore: number;
    contentCompletionRate: number;
}): { score: number; confidence: number } {
    const { averageQuizScore, averageAssignmentScore, engagementScore, forumParticipationScore, contentCompletionRate } = metrics;

    // Weights: Quiz 30%, Assignment 40%, Engagement 15%, Forum 5%, Content 10%
    const predictedScore =
        (averageQuizScore * 0.3) +
        (averageAssignmentScore * 0.4) +
        (engagementScore * 0.15) +
        (forumParticipationScore * 0.05) +
        (contentCompletionRate * 0.1);

    // Confidence based on amount of data (heuristic)
    let confidence = Math.min(85, (averageQuizScore > 0 ? 20 : 0) + (averageAssignmentScore > 0 ? 30 : 0) + (engagementScore > 0 ? 20 : 0) + 15);

    return { score: predictedScore, confidence };
}
