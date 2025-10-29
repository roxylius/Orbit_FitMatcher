import { Request, Response } from 'express';
import pool from '../config/db';
import getLogger from '../utils/logger';
import { searchUniversities as searchUniversitiesService } from '../services/searchService';
import type { SearchFilters, SearchOptions } from '../services/searchService';

const logger = getLogger('searchController');

/**
 * Search universities with multiple filters
 * Supports filtering by: program type, location, acceptance rate, visa sponsorship,
 * tuition range, ranking, post-study work support, and scholarships
 */
export const searchUniversities = async (req: Request, res: Response) => {
  logger.info('searchUniversities', 'ENTERING - Processing search request');

  try {
    const {
      program,
      location_country,
      min_acceptance,
      max_acceptance,
      visa_sponsorship,
      min_tuition,
      max_tuition,
      min_ranking,
      max_ranking,
      post_study_work,
      has_scholarships,
      sort_by,
      order,
      limit,
      offset,
    } = req.query;

    // Parse and validate filters
    const filters: SearchFilters = {};

    if (program) {
      filters.program = program as string;
    }

    if (location_country) {
      filters.location_country = location_country as string;
    }

    if (min_acceptance) {
      const minRate = parseFloat(min_acceptance as string);
      if (!isNaN(minRate) && minRate >= 0 && minRate <= 100) {
        filters.min_acceptance = minRate;
      } else {
        logger.warn('searchUniversities', `Invalid min_acceptance: ${min_acceptance}`);
      }
    }

    if (max_acceptance) {
      const maxRate = parseFloat(max_acceptance as string);
      if (!isNaN(maxRate) && maxRate >= 0 && maxRate <= 100) {
        filters.max_acceptance = maxRate;
      } else {
        logger.warn('searchUniversities', `Invalid max_acceptance: ${max_acceptance}`);
      }
    }

    if (visa_sponsorship !== undefined) {
      filters.visa_sponsorship = visa_sponsorship === 'true' || visa_sponsorship === '1';
    }

    if (min_tuition) {
      const minTuitionVal = parseInt(min_tuition as string);
      if (!isNaN(minTuitionVal) && minTuitionVal >= 0) {
        filters.min_tuition = minTuitionVal;
      } else {
        logger.warn('searchUniversities', `Invalid min_tuition: ${min_tuition}`);
      }
    }

    if (max_tuition) {
      const maxTuitionVal = parseInt(max_tuition as string);
      if (!isNaN(maxTuitionVal) && maxTuitionVal >= 0) {
        filters.max_tuition = maxTuitionVal;
      } else {
        logger.warn('searchUniversities', `Invalid max_tuition: ${max_tuition}`);
      }
    }

    if (min_ranking) {
      const minRank = parseInt(min_ranking as string);
      if (!isNaN(minRank) && minRank > 0) {
        filters.min_ranking = minRank;
      } else {
        logger.warn('searchUniversities', `Invalid min_ranking: ${min_ranking}`);
      }
    }

    if (max_ranking) {
      const maxRank = parseInt(max_ranking as string);
      if (!isNaN(maxRank) && maxRank > 0) {
        filters.max_ranking = maxRank;
      } else {
        logger.warn('searchUniversities', `Invalid max_ranking: ${max_ranking}`);
      }
    }

    if (post_study_work) {
      filters.post_study_work = post_study_work as string;
    }

    if (has_scholarships !== undefined) {
      filters.has_scholarships = has_scholarships === 'true' || has_scholarships === '1';
    }

    // Parse options
    const options: SearchOptions = {
      sort_by: sort_by as string,
      order: (order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
      limit: limit ? Math.min(parseInt(limit as string) || 50, 100) : 50,
      offset: offset ? parseInt(offset as string) || 0 : 0,
    };

    logger.info('searchUniversities', 'Validation passed - Calling search service');

    // Call search service
    const result = await searchUniversitiesService(pool, filters, options);

    const page = Math.floor(options.offset! / options.limit!) + 1;
    const pages = Math.ceil(result.total / options.limit!);

    logger.info('searchUniversities', `EXITING - Returning ${result.universities.length} results`);

    return res.status(200).json({
      success: true,
      count: result.universities.length,
      total: result.total,
      page,
      pages,
      filters,
      sort: { field: options.sort_by || 'ranking', order: options.order },
      universities: result.universities,
    });
  } catch (error) {
    logger.error('searchUniversities', `EXITING - Error occurred: ${error}`);
    console.error('Error in searchUniversities controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while searching universities',
    });
  }
};
