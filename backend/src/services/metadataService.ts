import { Pool } from 'pg';
import getLogger from '../utils/logger';

const logger = getLogger('metadataService');

export interface MetadataResult {
  programTypes: string[];
  countries: string[];
  industries: string[];
}

/**
 * Fetch distinct metadata values (program types, countries, industries) for autocomplete dropdowns.
 */
export const fetchMetadata = async (pool: Pool): Promise<MetadataResult> => {
  logger.info('fetchMetadata', 'ENTERING - Fetching metadata for autocomplete');

  try {
    const [programTypes, countries, industries] = await Promise.all([
      getProgramTypes(pool),
      getCountries(pool),
      getIndustries(pool),
    ]);

    logger.info('fetchMetadata', 'EXITING - Metadata retrieved successfully');
    return { programTypes, countries, industries };
  } catch (error) {
    logger.error('fetchMetadata', `EXITING - Error occurred: ${error}`);
    console.error('Error in fetchMetadata service:', error);
    throw error;
  }
};

const getProgramTypes = async (pool: Pool): Promise<string[]> => {
  logger.info('getProgramTypes', 'ENTERING - Fetching distinct program types');

  try {
    const result = await pool.query(
      `SELECT name FROM program_types ORDER BY name ASC`
    );

    const values = result.rows.map((row) => row.name as string);
    logger.info('getProgramTypes', `EXITING - Retrieved ${values.length} program types`);
    return values;
  } catch (error) {
    logger.error('getProgramTypes', `EXITING - Error occurred: ${error}`);
    throw error;
  }
};

const getCountries = async (pool: Pool): Promise<string[]> => {
  logger.info('getCountries', 'ENTERING - Fetching distinct countries');

  try {
    const result = await pool.query(
      `SELECT name FROM countries ORDER BY name ASC`
    );

    const values = result.rows.map((row) => row.name as string);
    logger.info('getCountries', `EXITING - Retrieved ${values.length} countries`);
    return values;
  } catch (error) {
    logger.error('getCountries', `EXITING - Error occurred: ${error}`);
    throw error;
  }
};

const getIndustries = async (pool: Pool): Promise<string[]> => {
  logger.info('getIndustries', 'ENTERING - Fetching distinct industries');

  try {
    const result = await pool.query(
      `SELECT name FROM industries ORDER BY name ASC`
    );

    const values = result.rows.map((row) => row.name as string);
    logger.info('getIndustries', `EXITING - Retrieved ${values.length} industries`);
    return values;
  } catch (error) {
    logger.error('getIndustries', `EXITING - Error occurred: ${error}`);
    throw error;
  }
};
