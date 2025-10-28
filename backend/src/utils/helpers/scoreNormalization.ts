import getLogger from '../logger';

const logger = getLogger('scoreNormalization');

/**
 * Normalize GPA to 4.0 scale from various international scales
 * @param gpa Original GPA value
 * @param scale Original scale (4.0, 10.0, 100.0, etc.)
 * @returns Normalized GPA on 4.0 scale
 */
export const normalizeGpa = (gpa: number, scale: number = 4.0): number => {
  logger.info('normalizeGpa', `ENTERING - Normalizing GPA ${gpa} from scale ${scale}`);
  
  let normalized: number;
  
  if (scale === 4.0) {
    normalized = Math.min(gpa, 4.0);
  } else if (scale === 10.0) {
    // 10-point scale 
    normalized = Math.min((gpa / 10.0) * 4.0, 4.0);
  } else if (scale === 100.0) {
    // 100-point % scale
    normalized = Math.min((gpa / 100.0) * 4.0, 4.0);
  } else if (scale === 5.0) {
    // 5-point scale 
    normalized = Math.min((gpa / 5.0) * 4.0, 4.0);
  } else {
    // Default: assume 4.0 scale
    normalized = Math.min(gpa, 4.0);
  }
  
  logger.info('normalizeGpa', `EXITING - Normalized GPA: ${normalized}`);
  return normalized;
};

/**
 * Get normalized test score (use whichever score user provided)
 * User should provide either GMAT or GRE
 * @param gmatScore GMAT score if provided
 * @param greScore GRE score if provided
 * @returns Test score (GMAT or GRE)
 */
export const getNormalizedTestScore = (
  gmatScore?: number,
  greScore?: number
): number | null => {
  logger.info('getNormalizedTestScore', `ENTERING - GMAT: ${gmatScore}, GRE: ${greScore}`);
  
  let score: number | null = null;
  
  if (gmatScore) {
    score = gmatScore;
  } else if (greScore) {
    score = greScore;
  }
  
  logger.info('getNormalizedTestScore', `EXITING - Returning test score: ${score}`);
  return score;
};
