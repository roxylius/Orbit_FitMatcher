import getLogger from '../logger';

const logger = getLogger('matchHelpers');

/**
 * Categorize a match score into Safety/Target/Reach buckets.
 * Keeps route logic focused on orchestration rather than scoring rules.
 */
export const categorizeMatch = (score: number): string => {
  logger.info('categorizeMatch', `ENTERING - Categorizing score: ${score}`);
  
  let category: string;
  
  if (score >= 70) {
    category = 'Safety';
  } else if (score >= 50) {
    category = 'Target';
  } else {
    category = 'Reach';
  }
  
  logger.info('categorizeMatch', `EXITING - Category: ${category}`);
  return category;
};
