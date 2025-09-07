/**
 * Utility functions for working with confidence scores
 */

export interface ConfidenceScoreData {
  questionId: number;
  score: number;
}

export interface UserPreferencesWithScores {
  confidenceScores: ConfidenceScoreData[];
  // other fields...
}

/**
 * Convert confidence scores array to a map for easier access
 */
export function confidenceScoresToMap(scores: ConfidenceScoreData[]): Map<number, number> {
  return new Map(scores.map(score => [score.questionId, score.score]));
}

/**
 * Convert confidence scores to legacy array format (for backward compatibility)
 */
export function confidenceScoresToArray(scores: ConfidenceScoreData[]): number[] {
  const scoreMap = confidenceScoresToMap(scores);
  const result: number[] = [];
  
  for (let i = 1; i <= 10; i++) {
    result.push(scoreMap.get(i) || 0);
  }
  
  return result;
}

/**
 * Convert array format to confidence score objects
 */
export function arrayToConfidenceScores(scores: number[]): Omit<ConfidenceScoreData, 'preferencesId'>[] {
  return scores.map((score, index) => ({
    questionId: index + 1,
    score,
  }));
}

/**
 * Validate confidence scores
 */
export function validateConfidenceScores(scores: number[]): boolean {
  if (scores.length !== 10) return false;
  return scores.every(score => score >= 0 && score <= 5 && Number.isInteger(score));
}
