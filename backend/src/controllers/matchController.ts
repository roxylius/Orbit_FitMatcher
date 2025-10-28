import { Request, Response } from 'express';
import pool from '../config/db';
import { findMatches } from '../services/matchingService';
import { UserProfile } from '../types';
import getLogger from '../utils/logger';

const logger = getLogger('matchController');

/**
 * Get personalized university matches based on user profile
 */
export const getUniversityMatches = async (req: Request, res: Response) => {
  logger.info('getUniversityMatches', 'ENTERING - Processing match request');
  
  try {
    const {
      gmat_score,
      gre_score,
      gpa,
      gpa_scale,
      work_experience,
      program_type,
      industry_preference,
      nationality,
      visa_required,
      preferred_location,
    } = req.body;

    // Validation: Require either GMAT or GRE
    if (!gmat_score && !gre_score) {
      logger.warn('getUniversityMatches', 'EXITING - Validation failed: Missing test score');
      return res.status(400).json({
        success: false,
        error: 'Either GMAT score or GRE score is required',
      });
    }

    // Validation: Require GPA
    if (!gpa) {
      logger.warn('getUniversityMatches', 'EXITING - Validation failed: Missing GPA');
      return res.status(400).json({
        success: false,
        error: 'GPA is required',
      });
    }

    // Validation: Require work experience
    if (work_experience === undefined || work_experience === null) {
      logger.warn('getUniversityMatches', 'EXITING - Validation failed: Missing work experience');
      return res.status(400).json({
        success: false,
        error: 'Work experience is required',
      });
    }

    // Validation: Require program type
    if (!program_type) {
      logger.warn('getUniversityMatches', 'EXITING - Validation failed: Missing program type');
      return res.status(400).json({
        success: false,
        error: 'Program type is required',
      });
    }

    // Validate score ranges
    if (gmat_score && (gmat_score < 200 || gmat_score > 800)) {
      logger.warn('getUniversityMatches', `EXITING - Validation failed: Invalid GMAT score ${gmat_score}`);
      return res.status(400).json({
        success: false,
        error: 'GMAT score must be between 200 and 800',
      });
    }

    if (gre_score && (gre_score < 260 || gre_score > 340)) {
      logger.warn('getUniversityMatches', `EXITING - Validation failed: Invalid GRE score ${gre_score}`);
      return res.status(400).json({
        success: false,
        error: 'GRE score must be between 260 and 340',
      });
    }

    if (gpa < 0 || gpa > (gpa_scale || 4.0)) {
      logger.warn('getUniversityMatches', `EXITING - Validation failed: Invalid GPA ${gpa}`);
      return res.status(400).json({
        success: false,
        error: `GPA must be between 0 and ${gpa_scale || 4.0}`,
      });
    }

    logger.info('getUniversityMatches', 'Validation passed - Building user profile');

    // Build user profile
    const userProfile: UserProfile = {
      gmat_score,
      gre_score,
      gpa,
      gpa_scale,
      work_experience,
      program_type,
      industry_preference,
      nationality,
      visa_required,
      preferred_location,
    };

    logger.info('getUniversityMatches', `Calling findMatches service for ${program_type} program`);
    // Call matching service
    const matches = await findMatches(pool, userProfile);

    logger.info('getUniversityMatches', `EXITING - Returning ${matches.length} matches`);

    // Return results
    return res.status(200).json({
      success: true,
      count: matches.length,
      profile_summary: {
        test_score: gmat_score || `GRE ${gre_score}`,
        gpa: gpa,
        gpa_scale: gpa_scale || 4.0,
        work_experience: work_experience,
        program_type: program_type,
      },
      matches: matches,
    });
  } catch (error) {
    logger.error('getUniversityMatches', `EXITING - Error occurred: ${error}`);
    console.error('Error in getUniversityMatches controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while finding matches',
    });
  }
};
