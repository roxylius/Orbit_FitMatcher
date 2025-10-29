import { Request, Response } from 'express';
import pool from '../config/db';
import getLogger from '../utils/logger';
import { fetchMetadata } from '../services/metadataService';

const logger = getLogger('metadataController');

/**
 * Provide distinct metadata values for autocomplete dropdowns.
 */
export const getMetadata = async (_req: Request, res: Response) => {
  logger.info('getMetadata', 'ENTERING - Handling metadata request');

  try {
    const metadata = await fetchMetadata(pool);
    logger.info('getMetadata', 'EXITING - Metadata retrieved successfully');

    return res.status(200).json({
      success: true,
      ...metadata,
    });
  } catch (error) {
    logger.error('getMetadata', `EXITING - Error occurred: ${error}`);
    console.error('Error in getMetadata controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching metadata',
    });
  }
};
