import { Request, Response } from 'express';
import pool from '../config/db';
import getLogger from '../utils/logger';

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

    // Build dynamic query
    let query = 'SELECT * FROM universities WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // HIGH PRIORITY: Program Type (70% search start)
    if (program) {
      query += ` AND program_type = $${paramIndex}`;
      queryParams.push(program);
      paramIndex++;
      logger.info('searchUniversities', `Filter: program_type = ${program}`);
    }

    // HIGH PRIORITY: Location/Country (50% decision factor)
    if (location_country) {
      query += ` AND location_country ILIKE $${paramIndex}`;
      queryParams.push(`%${location_country}%`);
      paramIndex++;
      logger.info('searchUniversities', `Filter: location_country LIKE ${location_country}`);
    }

    // HIGH PRIORITY: Acceptance Rate Range (Competitiveness balance)
    if (min_acceptance) {
      const minRate = parseFloat(min_acceptance as string);
      if (!isNaN(minRate)) {
        query += ` AND acceptance_rate >= $${paramIndex}`;
        queryParams.push(minRate);
        paramIndex++;
        logger.info('searchUniversities', `Filter: acceptance_rate >= ${minRate}`);
      }
    }

    if (max_acceptance) {
      const maxRate = parseFloat(max_acceptance as string);
      if (!isNaN(maxRate)) {
        query += ` AND acceptance_rate <= $${paramIndex}`;
        queryParams.push(maxRate);
        paramIndex++;
        logger.info('searchUniversities', `Filter: acceptance_rate <= ${maxRate}`);
      }
    }

    // HIGH PRIORITY: Visa Sponsorship (International barrier)
    if (visa_sponsorship !== undefined) {
      const visaRequired = visa_sponsorship === 'true' || visa_sponsorship === '1';
      query += ` AND visa_sponsorship = $${paramIndex}`;
      queryParams.push(visaRequired);
      paramIndex++;
      logger.info('searchUniversities', `Filter: visa_sponsorship = ${visaRequired}`);
    }

    // MEDIUM PRIORITY: Tuition Range (Affordability)
    if (min_tuition) {
      const minTuitionVal = parseInt(min_tuition as string);
      if (!isNaN(minTuitionVal)) {
        query += ` AND tuition_usd >= $${paramIndex}`;
        queryParams.push(minTuitionVal);
        paramIndex++;
        logger.info('searchUniversities', `Filter: tuition_usd >= ${minTuitionVal}`);
      }
    }

    if (max_tuition) {
      const maxTuitionVal = parseInt(max_tuition as string);
      if (!isNaN(maxTuitionVal)) {
        query += ` AND tuition_usd <= $${paramIndex}`;
        queryParams.push(maxTuitionVal);
        paramIndex++;
        logger.info('searchUniversities', `Filter: tuition_usd <= ${maxTuitionVal}`);
      }
    }

    // MEDIUM PRIORITY: Ranking Range (Prestige)
    if (min_ranking) {
      const minRank = parseInt(min_ranking as string);
      if (!isNaN(minRank)) {
        query += ` AND ranking >= $${paramIndex}`;
        queryParams.push(minRank);
        paramIndex++;
        logger.info('searchUniversities', `Filter: ranking >= ${minRank}`);
      }
    }

    if (max_ranking) {
      const maxRank = parseInt(max_ranking as string);
      if (!isNaN(maxRank)) {
        query += ` AND ranking <= $${paramIndex}`;
        queryParams.push(maxRank);
        paramIndex++;
        logger.info('searchUniversities', `Filter: ranking <= ${maxRank}`);
      }
    }

    // LOW PRIORITY: Post-Study Work Support (Career outcomes)
    if (post_study_work) {
      query += ` AND post_study_work_support ILIKE $${paramIndex}`;
      queryParams.push(`%${post_study_work}%`);
      paramIndex++;
      logger.info('searchUniversities', `Filter: post_study_work_support LIKE ${post_study_work}`);
    }

    // LOW PRIORITY: Scholarships (Financial access)
    if (has_scholarships !== undefined) {
      const hasScholarship = has_scholarships === 'true' || has_scholarships === '1';
      query += ` AND scholarship_available = $${paramIndex}`;
      queryParams.push(hasScholarship);
      paramIndex++;
      logger.info('searchUniversities', `Filter: scholarship_available = ${hasScholarship}`);
    }

    // Sorting
    const allowedSortFields = [
      'ranking',
      'acceptance_rate',
      'tuition_usd',
      'avg_starting_salary_usd',
      'name',
    ];
    const sortField = allowedSortFields.includes(sort_by as string)
      ? sort_by
      : 'ranking';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder} NULLS LAST`;
    logger.info('searchUniversities', `Sorting by: ${sortField} ${sortOrder}`);

    // Pagination
    const limitVal = Math.min(parseInt(limit as string) || 50, 100); // Max 100 results
    const offsetVal = parseInt(offset as string) || 0;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limitVal, offsetVal);
    paramIndex += 2;
    logger.info('searchUniversities', `Pagination: LIMIT ${limitVal} OFFSET ${offsetVal}`);

    // Execute query
    logger.info('searchUniversities', `Executing search query with ${queryParams.length} parameters`);
    const result = await pool.query(query, queryParams);
    const universities = result.rows;

    // Get total count (for pagination metadata)
    let countQuery = 'SELECT COUNT(*) FROM universities WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    // Re-apply filters for count (without ORDER BY, LIMIT, OFFSET)
    if (program) {
      countQuery += ` AND program_type = $${countParamIndex}`;
      countParams.push(program);
      countParamIndex++;
    }
    if (location_country) {
      countQuery += ` AND location_country ILIKE $${countParamIndex}`;
      countParams.push(`%${location_country}%`);
      countParamIndex++;
    }
    if (min_acceptance) {
      const minRate = parseFloat(min_acceptance as string);
      if (!isNaN(minRate)) {
        countQuery += ` AND acceptance_rate >= $${countParamIndex}`;
        countParams.push(minRate);
        countParamIndex++;
      }
    }
    if (max_acceptance) {
      const maxRate = parseFloat(max_acceptance as string);
      if (!isNaN(maxRate)) {
        countQuery += ` AND acceptance_rate <= $${countParamIndex}`;
        countParams.push(maxRate);
        countParamIndex++;
      }
    }
    if (visa_sponsorship !== undefined) {
      const visaRequired = visa_sponsorship === 'true' || visa_sponsorship === '1';
      countQuery += ` AND visa_sponsorship = $${countParamIndex}`;
      countParams.push(visaRequired);
      countParamIndex++;
    }
    if (min_tuition) {
      const minTuitionVal = parseInt(min_tuition as string);
      if (!isNaN(minTuitionVal)) {
        countQuery += ` AND tuition_usd >= $${countParamIndex}`;
        countParams.push(minTuitionVal);
        countParamIndex++;
      }
    }
    if (max_tuition) {
      const maxTuitionVal = parseInt(max_tuition as string);
      if (!isNaN(maxTuitionVal)) {
        countQuery += ` AND tuition_usd <= $${countParamIndex}`;
        countParams.push(maxTuitionVal);
        countParamIndex++;
      }
    }
    if (min_ranking) {
      const minRank = parseInt(min_ranking as string);
      if (!isNaN(minRank)) {
        countQuery += ` AND ranking >= $${countParamIndex}`;
        countParams.push(minRank);
        countParamIndex++;
      }
    }
    if (max_ranking) {
      const maxRank = parseInt(max_ranking as string);
      if (!isNaN(maxRank)) {
        countQuery += ` AND ranking <= $${countParamIndex}`;
        countParams.push(maxRank);
        countParamIndex++;
      }
    }
    if (post_study_work) {
      countQuery += ` AND post_study_work_support ILIKE $${countParamIndex}`;
      countParams.push(`%${post_study_work}%`);
      countParamIndex++;
    }
    if (has_scholarships !== undefined) {
      const hasScholarship = has_scholarships === 'true' || has_scholarships === '1';
      countQuery += ` AND scholarship_available = $${countParamIndex}`;
      countParams.push(hasScholarship);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    logger.info('searchUniversities', `EXITING - Returning ${universities.length} results (${totalCount} total)`);

    return res.status(200).json({
      success: true,
      count: universities.length,
      total: totalCount,
      page: Math.floor(offsetVal / limitVal) + 1,
      pages: Math.ceil(totalCount / limitVal),
      filters: {
        program,
        location_country,
        acceptance_rate: { min: min_acceptance, max: max_acceptance },
        visa_sponsorship,
        tuition_range: { min: min_tuition, max: max_tuition },
        ranking_range: { min: min_ranking, max: max_ranking },
        post_study_work,
        has_scholarships,
      },
      sort: { field: sortField, order: sortOrder },
      universities,
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
