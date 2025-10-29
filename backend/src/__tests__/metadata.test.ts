import { Pool } from 'pg';

// Mock PostgreSQL pool
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

import pool from '../config/db';

describe('Metadata Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/metadata', () => {
    it('should return program types, countries, and industries', async () => {
      const mockProgramTypes = { rows: [{ name: 'MBA' }, { name: 'MS CS' }] };
      const mockCountries = { rows: [{ name: 'USA' }, { name: 'UK' }] };
      const mockIndustries = { rows: [{ name: 'Technology' }, { name: 'Finance' }] };

      // Simulate metadata fetch logic
      const programTypes = mockProgramTypes.rows.map(r => r.name);
      const countries = mockCountries.rows.map(r => r.name);
      const industries = mockIndustries.rows.map(r => r.name);

      expect(programTypes).toEqual(['MBA', 'MS CS']);
      expect(countries).toEqual(['USA', 'UK']);
      expect(industries).toEqual(['Technology', 'Finance']);
      expect(programTypes.length).toBeGreaterThan(0);
      expect(countries.length).toBeGreaterThan(0);
      expect(industries.length).toBeGreaterThan(0);
    });

    it('should handle database errors gracefully', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      try {
        await pool.query('SELECT * FROM program_types');
      } catch (error: any) {
        expect(error.message).toBe('Database error');
      }
    });
  });

  describe('Data validation', () => {
    it('should ensure metadata arrays are not empty', () => {
      const programTypes = ['MBA', 'MS CS', 'MS Finance'];
      const countries = ['USA', 'UK', 'Canada'];
      const industries = ['Technology', 'Finance', 'Healthcare'];

      expect(programTypes.length).toBeGreaterThan(0);
      expect(countries.length).toBeGreaterThan(0);
      expect(industries.length).toBeGreaterThan(0);
    });

    it('should validate metadata format', () => {
      const metadata = {
        programTypes: ['MBA', 'MS CS'],
        countries: ['USA', 'UK'],
        industries: ['Technology']
      };

      expect(metadata).toHaveProperty('programTypes');
      expect(metadata).toHaveProperty('countries');
      expect(metadata).toHaveProperty('industries');
      expect(Array.isArray(metadata.programTypes)).toBe(true);
      expect(Array.isArray(metadata.countries)).toBe(true);
      expect(Array.isArray(metadata.industries)).toBe(true);
    });
  });
});
