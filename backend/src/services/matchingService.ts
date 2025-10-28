import { Pool } from 'pg';
import { University, UserProfile, MatchResult } from '../types';
import { categorizeMatch } from '../utils/helpers/matchHelpers';
import { getNormalizedTestScore, normalizeGpa } from '../utils/helpers/scoreNormalization';
import getLogger from '../utils/logger';

const logger = getLogger('matchingService');

/**
 * Calculate match score (0-100) based on multiple weighted factors
 * 
 * @param profile - User's academic and preference profile
 * @param university - University program data
 * @returns Match score between 0-100
 * 
 * @remarks
 * Scoring weights:
 * - Test Score (GMAT/GRE): 35%
 * - GPA: 25%
 * - Work Experience: 20%
 * - Acceptance Rate: 10%
 * - Visa Support: 5%
 * - Industry Match: 3%
 * - Location Preference: 2%
 */
const calculateMatchScore = (profile: UserProfile, university: University): number => {
  logger.info('calculateMatchScore', 'ENTERING - Calculating match score');
  const {
    gmat_score,
    gre_score,
    gpa,
    gpa_scale = 4.0,
    work_experience,
    visa_required = false,
    industry_preference,
    preferred_location
  } = profile;

  const {
    median_gmat,
    median_gre,
    median_gpa,
    avg_work_experience,
    acceptance_rate,
    visa_sponsorship,
    primary_industry,
    secondary_industries,
    location_country,
    location_region
  } = university;

  // Normalize scores
  const normalizedTestScore = getNormalizedTestScore(gmat_score, gre_score);
  const normalizedGpa = normalizeGpa(gpa, gpa_scale);
  
  // Determine which test score to compare (GMAT or GRE)
  const isGMAT = !!gmat_score;
  const medianTestScore = isGMAT ? median_gmat : median_gre;

  // Factor 1: Test Score (GMAT/GRE) - 35% weight
  let testScore = 50; // baseline
  if (normalizedTestScore && medianTestScore) {
    const testDelta = normalizedTestScore - medianTestScore;
    if (testDelta >= 30) testScore = 95;
    else if (testDelta >= 20) testScore = 90;
    else if (testDelta >= 10) testScore = 80;
    else if (testDelta >= 0) testScore = 70;
    else if (testDelta >= -10) testScore = 60;
    else if (testDelta >= -20) testScore = 50;
    else if (testDelta >= -30) testScore = 40;
    else testScore = 30;
  }

  // Factor 2: GPA - 25% weight
  let gpaScore = 50;
  if (median_gpa) {
    const gpaDelta = normalizedGpa - median_gpa;
    if (gpaDelta >= 0.4) gpaScore = 95;
    else if (gpaDelta >= 0.3) gpaScore = 90;
    else if (gpaDelta >= 0.2) gpaScore = 80;
    else if (gpaDelta >= 0.1) gpaScore = 70;
    else if (gpaDelta >= 0) gpaScore = 60;
    else if (gpaDelta >= -0.1) gpaScore = 50;
    else if (gpaDelta >= -0.2) gpaScore = 40;
    else gpaScore = 30;
  }

  // Factor 3: Work Experience - 20% weight
  let expScore = 50;
  if (avg_work_experience) {
    const expDelta = Math.abs(work_experience - avg_work_experience);
    if (expDelta <= 0.5) expScore = 90;
    else if (expDelta <= 1.0) expScore = 80;
    else if (expDelta <= 1.5) expScore = 70;
    else if (expDelta <= 2.0) expScore = 60;
    else if (expDelta <= 3.0) expScore = 50;
    else expScore = 40;
  }

  // Factor 4: Acceptance Rate - 10% weight
  let acceptanceScore = 50;
  if (acceptance_rate) {
    if (acceptance_rate >= 30) acceptanceScore = 85;
    else if (acceptance_rate >= 25) acceptanceScore = 75;
    else if (acceptance_rate >= 20) acceptanceScore = 70;
    else if (acceptance_rate >= 15) acceptanceScore = 60;
    else if (acceptance_rate >= 10) acceptanceScore = 50;
    else if (acceptance_rate >= 7) acceptanceScore = 40;
    else acceptanceScore = 30;
  }

  // Factor 5: Visa Support (if required) - 5% weight
  let visaScore = 50;
  if (visa_required) {
    visaScore = visa_sponsorship ? 90 : 20;
  }

  // Factor 6: Industry Match (if provided) - 3% weight
  let industryScore = 50;
  if (industry_preference && (primary_industry || secondary_industries)) {
    const industryLower = industry_preference.toLowerCase();
    const primaryMatch = primary_industry?.toLowerCase().includes(industryLower);
    const secondaryMatch = secondary_industries?.some(ind => 
      ind.toLowerCase().includes(industryLower)
    );
    
    if (primaryMatch) industryScore = 90;
    else if (secondaryMatch) industryScore = 70;
    else industryScore = 40;
  }

  // Factor 7: Location Preference (if provided) - 2% weight
  let locationScore = 50;
  if (preferred_location && (location_country || location_region)) {
    const locationLower = preferred_location.toLowerCase();
    const countryMatch = location_country?.toLowerCase().includes(locationLower);
    const regionMatch = location_region?.toLowerCase().includes(locationLower);
    
    if (countryMatch || regionMatch) locationScore = 90;
    else locationScore = 30;
  }

  // Weighted total
  const totalScore = Math.round(
    (testScore * 0.35) +
    (gpaScore * 0.25) +
    (expScore * 0.20) +
    (acceptanceScore * 0.10) +
    (visaScore * 0.05) +
    (industryScore * 0.03) +
    (locationScore * 0.02)
  );

  const finalScore = Math.min(Math.max(totalScore, 0), 100);
  logger.info('calculateMatchScore', `EXITING - Match score calculated: ${finalScore}`);
  return finalScore;
};

/**
 * Generate personalized reasons explaining why a university matches the user's profile
 * 
 * @param profile - User's academic and preference profile
 * @param university - University program data
 * @param matchScore - Calculated match score (0-100)
 * @returns Array of explanation strings (max 6 reasons)
 * 
 * @remarks
 * Generates context-aware explanations for:
 * - Test score comparison (GMAT or GRE)
 * - GPA comparison
 * - Work experience alignment
 * - Visa sponsorship availability
 * - Industry focus match
 * - Location preference
 * - Safety/Target/Reach classification
 */
const generateReasons = (
  profile: UserProfile,
  university: University,
  matchScore: number
): string[] => {
  logger.info('generateReasons', `ENTERING - Generating reasons for ${university.name}`);
  const reasons: string[] = [];
  const {
    gmat_score,
    gre_score,
    gpa,
    gpa_scale = 4.0,
    work_experience,
    visa_required,
    industry_preference,
    preferred_location
  } = profile;

  const {
    name,
    median_gmat,
    median_gre,
    median_gpa,
    avg_work_experience,
    visa_sponsorship,
    primary_industry,
    location_country,
    acceptance_rate
  } = university;

  const normalizedTestScore = getNormalizedTestScore(gmat_score, gre_score);
  const normalizedGpa = normalizeGpa(gpa, gpa_scale);
  
  // Determine which test and median to use
  const isGMAT = !!gmat_score;
  const medianTestScore = isGMAT ? median_gmat : median_gre;
  const testType = isGMAT ? 'GMAT' : 'GRE';

  // Test score reason
  if (normalizedTestScore && medianTestScore) {
    const testDelta = normalizedTestScore - medianTestScore;
    
    if (testDelta >= 20) {
      reasons.push(`Your ${testType} (${normalizedTestScore}) significantly exceeds the median (${medianTestScore}).`);
    } else if (testDelta >= 10) {
      reasons.push(`Your ${testType} (${normalizedTestScore}) is above the median (${medianTestScore}).`);
    } else if (testDelta >= 0) {
      reasons.push(`Your ${testType} (${normalizedTestScore}) meets the median (${medianTestScore}).`);
    } else if (testDelta >= -10) {
      reasons.push(`Your ${testType} (${normalizedTestScore}) is close to median (${medianTestScore}).`);
    } else {
      reasons.push(`Your ${testType} (${normalizedTestScore}) is below median (${medianTestScore}). Consider retaking or strengthening other areas.`);
    }
  }

  // GPA reason
  if (median_gpa) {
    const gpaDelta = normalizedGpa - median_gpa;
    if (gpaDelta >= 0.2) {
      reasons.push(`Strong GPA (${normalizedGpa.toFixed(2)}) compared to median (${median_gpa}).`);
    } else if (gpaDelta >= 0) {
      reasons.push(`Your GPA (${normalizedGpa.toFixed(2)}) meets the median (${median_gpa}).`);
    } else {
      reasons.push(`GPA (${normalizedGpa.toFixed(2)}) is below median (${median_gpa}). Highlight achievements in essays.`);
    }
  }

  // Work experience reason
  if (avg_work_experience) {
    const expDelta = Math.abs(work_experience - avg_work_experience);
    if (expDelta <= 1) {
      reasons.push(`Work experience (${work_experience} years) aligns well with average (${avg_work_experience} years).`);
    } else if (work_experience > avg_work_experience) {
      reasons.push(`Extensive experience (${work_experience} years) – leverage leadership examples.`);
    } else {
      reasons.push(`Work experience (${work_experience} years) is below average (${avg_work_experience} years). Emphasize quality over quantity.`);
    }
  }

  // Visa reason
  if (visa_required) {
    if (visa_sponsorship) {
      reasons.push('Visa sponsorship available – low immigration barrier.');
    } else {
      reasons.push('Check visa sponsorship options for international students.');
    }
  }

  // Industry match reason
  if (industry_preference && primary_industry) {
    const industryLower = industry_preference.toLowerCase();
    const primaryMatch = primary_industry.toLowerCase().includes(industryLower);
    if (primaryMatch) {
      reasons.push(`Strong industry alignment with ${primary_industry}.`);
    }
  }

  // Location match reason
  if (preferred_location && location_country) {
    const locationLower = preferred_location.toLowerCase();
    const countryMatch = location_country.toLowerCase().includes(locationLower);
    if (countryMatch) {
      reasons.push(`Located in preferred region (${location_country}).`);
    }
  }

  // Category summary
  const category = categorizeMatch(matchScore);
  if (category === 'Safety') {
    reasons.push(`${name} is a strong safety school for your profile.`);
  } else if (category === 'Target') {
    reasons.push(`${name} is a balanced target. Focus on standout essays and recommendations.`);
  } else {
    reasons.push(`${name} is a reach school. Apply if it's your dream program, but have backup options.`);
  }

  // Acceptance rate context
  if (acceptance_rate) {
    if (acceptance_rate < 10) {
      reasons.push(`Highly selective (${acceptance_rate}% acceptance rate) – exceptional profile needed.`);
    } else if (acceptance_rate < 20) {
      reasons.push(`Very competitive (${acceptance_rate}% acceptance rate).`);
    }
  }

  const finalReasons = reasons.slice(0, 6);
  logger.info('generateReasons', `EXITING - Generated ${finalReasons.length} reasons`);
  return finalReasons;
};

/**
 * Find and rank university matches based on user profile
 * 
 * @param pool - PostgreSQL connection pool
 * @param profile - User's academic profile and preferences
 * @returns Array of MatchResult sorted by match percentage
 */
export const findMatches = async (
  pool: Pool,
  profile: UserProfile
): Promise<MatchResult[]> => {
  logger.info('findMatches', 'ENTERING - Finding matches for profile');
  
  try {
    // Build dynamic query based on profile filters
    let query = 'SELECT * FROM universities WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filter by program type
    if (profile.program_type) {
      query += ` AND program_type = $${paramIndex}`;
      queryParams.push(profile.program_type);
      paramIndex++;
    }

    // Filter by location if strong preference
    if (profile.preferred_location) {
      query += ` AND (location_country ILIKE $${paramIndex} OR location_region ILIKE $${paramIndex})`;
      queryParams.push(`%${profile.preferred_location}%`);
      paramIndex++;
    }

    // Filter by visa sponsorship if required
    if (profile.visa_required) {
      query += ` AND visa_sponsorship = true`;
    }

    logger.info('findMatches', `Executing database query with ${queryParams.length} parameters`);
    const result = await pool.query(query, queryParams);
    const universities: University[] = result.rows;

    logger.info('findMatches', `Query successful - Retrieved ${universities.length} universities`);

    if (universities.length === 0) {
      logger.info('findMatches', 'EXITING - No universities found matching criteria');
      return [];
    }

    logger.info('findMatches', 'Calculating match scores for all universities');
    // Calculate match scores for all universities
    const matches: MatchResult[] = universities.map((university) => {
      const match_percentage = calculateMatchScore(profile, university);
      const category = categorizeMatch(match_percentage);
      const reasons = generateReasons(profile, university, match_percentage);

      return {
        university,
        match_percentage,
        category,
        reasons,
      };
    });

    logger.info('findMatches', 'Sorting matches by match percentage');
    // Sort by match percentage (descending)
    matches.sort((a, b) => b.match_percentage - a.match_percentage);

    logger.info('findMatches', `EXITING - Returning ${matches.length} matches`);
    return matches;
  } catch (error) {
    logger.error('findMatches', `EXITING - Error occurred: ${error}`);
    console.error('Error in findMatches service:', error);
    throw error;
  }
};
