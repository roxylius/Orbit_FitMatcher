import { Pool } from 'pg';
import getLogger from '../utils/logger';
import { University } from '../types/matching';

const logger = getLogger('searchService');

export interface SearchFilters {
  program?: string;
  location_country?: string;
  min_acceptance?: number;
  max_acceptance?: number;
  visa_sponsorship?: boolean;
  min_tuition?: number;
  max_tuition?: number;
  min_ranking?: number;
  max_ranking?: number;
  post_study_work?: string;
  has_scholarships?: boolean;
}

export interface SearchOptions {
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  universities: University[];
  total: number;
}

/**
 * Search universities with multiple filters
 * @param pool - PostgreSQL connection pool
 * @param filters - Search filter criteria
 * @param options - Sorting and pagination options
 * @returns Universities matching the filters and total count
 */
export const searchUniversities = async (
  pool: Pool,
  filters: SearchFilters,
  options: SearchOptions
): Promise<SearchResult> => {
  logger.info('searchUniversities', 'ENTERING - Searching universities with filters');

  try {
    // Build dynamic query with JOINs for normalized tables
    let query = `
      SELECT 
        u.university_id,
        u.name,
        u.program_name,
        pt.name as program_type,
        u.location_city,
        c.name as location_country,
        c.region as location_region,
        u.ranking,
        u.acceptance_rate,
        u.median_gmat,
        u.median_gre,
        u.median_gpa,
        u.avg_work_experience,
        u.tuition_usd,
        u.avg_starting_salary_usd,
        u.scholarship_available,
        u.visa_sponsorship,
        i.name as primary_industry,
        u.post_study_work_support
      FROM universities u
      LEFT JOIN program_types pt ON u.program_type_id = pt.program_type_id
      LEFT JOIN countries c ON u.country_id = c.country_id
      LEFT JOIN industries i ON u.primary_industry_id = i.industry_id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    // HIGH PRIORITY: Program Type (70% search start)
    if (filters.program) {
      query += ` AND pt.name = $${paramIndex}`;
      queryParams.push(filters.program);
      paramIndex++;
      logger.info('searchUniversities', `Filter: program_type = ${filters.program}`);
    }

    // HIGH PRIORITY: Location/Country (50% decision factor)
    if (filters.location_country) {
      query += ` AND c.name ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.location_country}%`);
      paramIndex++;
      logger.info('searchUniversities', `Filter: location_country LIKE ${filters.location_country}`);
    }

    // HIGH PRIORITY: Acceptance Rate Range (Competitiveness balance)
    if (filters.min_acceptance !== undefined) {
      query += ` AND acceptance_rate >= $${paramIndex}`;
      queryParams.push(filters.min_acceptance);
      paramIndex++;
      logger.info('searchUniversities', `Filter: acceptance_rate >= ${filters.min_acceptance}`);
    }

    if (filters.max_acceptance !== undefined) {
      query += ` AND acceptance_rate <= $${paramIndex}`;
      queryParams.push(filters.max_acceptance);
      paramIndex++;
      logger.info('searchUniversities', `Filter: acceptance_rate <= ${filters.max_acceptance}`);
    }

    // HIGH PRIORITY: Visa Sponsorship (International barrier)
    if (filters.visa_sponsorship !== undefined) {
      query += ` AND visa_sponsorship = $${paramIndex}`;
      queryParams.push(filters.visa_sponsorship);
      paramIndex++;
      logger.info('searchUniversities', `Filter: visa_sponsorship = ${filters.visa_sponsorship}`);
    }

    // MEDIUM PRIORITY: Tuition Range (Affordability)
    if (filters.min_tuition !== undefined) {
      query += ` AND tuition_usd >= $${paramIndex}`;
      queryParams.push(filters.min_tuition);
      paramIndex++;
      logger.info('searchUniversities', `Filter: tuition_usd >= ${filters.min_tuition}`);
    }

    if (filters.max_tuition !== undefined) {
      query += ` AND tuition_usd <= $${paramIndex}`;
      queryParams.push(filters.max_tuition);
      paramIndex++;
      logger.info('searchUniversities', `Filter: tuition_usd <= ${filters.max_tuition}`);
    }

    // MEDIUM PRIORITY: Ranking Range (Prestige)
    if (filters.min_ranking !== undefined) {
      query += ` AND ranking >= $${paramIndex}`;
      queryParams.push(filters.min_ranking);
      paramIndex++;
      logger.info('searchUniversities', `Filter: ranking >= ${filters.min_ranking}`);
    }

    if (filters.max_ranking !== undefined) {
      query += ` AND ranking <= $${paramIndex}`;
      queryParams.push(filters.max_ranking);
      paramIndex++;
      logger.info('searchUniversities', `Filter: ranking <= ${filters.max_ranking}`);
    }

    // LOW PRIORITY: Post-Study Work Support (Career outcomes)
    if (filters.post_study_work) {
      query += ` AND post_study_work_support ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.post_study_work}%`);
      paramIndex++;
      logger.info('searchUniversities', `Filter: post_study_work_support LIKE ${filters.post_study_work}`);
    }

    // LOW PRIORITY: Scholarships (Financial access)
    if (filters.has_scholarships !== undefined) {
      query += ` AND scholarship_available = $${paramIndex}`;
      queryParams.push(filters.has_scholarships);
      paramIndex++;
      logger.info('searchUniversities', `Filter: scholarship_available = ${filters.has_scholarships}`);
    }

    // Sorting
    const allowedSortFields = [
      'ranking',
      'acceptance_rate',
      'tuition_usd',
      'avg_starting_salary_usd',
      'name',
    ];
    const sortField = allowedSortFields.includes(options.sort_by || '')
      ? options.sort_by
      : 'ranking';
    const sortOrder = options.order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder} NULLS LAST`;
    logger.info('searchUniversities', `Sorting by: ${sortField} ${sortOrder}`);

    // Pagination
    const limitVal = Math.min(options.limit || 50, 100); // Max 100 results
    const offsetVal = options.offset || 0;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limitVal, offsetVal);
    paramIndex += 2;
    logger.info('searchUniversities', `Pagination: LIMIT ${limitVal} OFFSET ${offsetVal}`);

    // Execute query
    logger.info('searchUniversities', `Executing search query with ${queryParams.length} parameters`);
    const result = await pool.query(query, queryParams);
    const universities: University[] = result.rows;

    logger.info('searchUniversities', `Query successful - Retrieved ${universities.length} universities`);

    // Get total count for pagination
    const totalCount = await getTotalCount(pool, filters);

    logger.info('searchUniversities', `EXITING - Returning ${universities.length} results (${totalCount} total)`);

    return {
      universities,
      total: totalCount,
    };
  } catch (error) {
    logger.error('searchUniversities', `EXITING - Error occurred: ${error}`);
    console.error('Error in searchUniversities service:', error);
    throw error;
  }
};

/**
 * Get total count of universities matching the filters (for pagination)
 * @param pool - PostgreSQL connection pool
 * @param filters - Search filter criteria
 * @returns Total count of matching universities
 */
const getTotalCount = async (
  pool: Pool,
  filters: SearchFilters
): Promise<number> => {
  logger.info('getTotalCount', 'ENTERING - Getting total count for pagination');

  try {
    let countQuery = `
      SELECT COUNT(*) 
      FROM universities u
      LEFT JOIN program_types pt ON u.program_type_id = pt.program_type_id
      LEFT JOIN countries c ON u.country_id = c.country_id
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let paramIndex = 1;

    // Re-apply all filters (without ORDER BY, LIMIT, OFFSET)
    if (filters.program) {
      countQuery += ` AND pt.name = $${paramIndex}`;
      countParams.push(filters.program);
      paramIndex++;
    }

    if (filters.location_country) {
      countQuery += ` AND c.name ILIKE $${paramIndex}`;
      countParams.push(`%${filters.location_country}%`);
      paramIndex++;
    }

    if (filters.min_acceptance !== undefined) {
      countQuery += ` AND acceptance_rate >= $${paramIndex}`;
      countParams.push(filters.min_acceptance);
      paramIndex++;
    }

    if (filters.max_acceptance !== undefined) {
      countQuery += ` AND acceptance_rate <= $${paramIndex}`;
      countParams.push(filters.max_acceptance);
      paramIndex++;
    }

    if (filters.visa_sponsorship !== undefined) {
      countQuery += ` AND visa_sponsorship = $${paramIndex}`;
      countParams.push(filters.visa_sponsorship);
      paramIndex++;
    }

    if (filters.min_tuition !== undefined) {
      countQuery += ` AND tuition_usd >= $${paramIndex}`;
      countParams.push(filters.min_tuition);
      paramIndex++;
    }

    if (filters.max_tuition !== undefined) {
      countQuery += ` AND tuition_usd <= $${paramIndex}`;
      countParams.push(filters.max_tuition);
      paramIndex++;
    }

    if (filters.min_ranking !== undefined) {
      countQuery += ` AND ranking >= $${paramIndex}`;
      countParams.push(filters.min_ranking);
      paramIndex++;
    }

    if (filters.max_ranking !== undefined) {
      countQuery += ` AND ranking <= $${paramIndex}`;
      countParams.push(filters.max_ranking);
      paramIndex++;
    }

    if (filters.post_study_work) {
      countQuery += ` AND post_study_work_support ILIKE $${paramIndex}`;
      countParams.push(`%${filters.post_study_work}%`);
      paramIndex++;
    }

    if (filters.has_scholarships !== undefined) {
      countQuery += ` AND scholarship_available = $${paramIndex}`;
      countParams.push(filters.has_scholarships);
      paramIndex++;
    }

    logger.info('getTotalCount', 'Executing count query');
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    logger.info('getTotalCount', `EXITING - Total count: ${total}`);
    return total;
  } catch (error) {
    logger.error('getTotalCount', `EXITING - Error occurred: ${error}`);
    console.error('Error in getTotalCount:', error);
    throw error;
  }
};
