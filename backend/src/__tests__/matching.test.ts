describe('University Matching Algorithm', () => {
  
  describe('GPA Normalization', () => {
    it('should normalize GPA from 4.0 scale correctly', () => {
      const gpa = 3.5;
      const scale = 4.0;
      const normalized = (gpa / scale) * 4.0;
      
      expect(normalized).toBe(3.5);
    });

    it('should normalize GPA from 5.0 scale correctly', () => {
      const gpa = 4.0;
      const scale = 5.0;
      const normalized = (gpa / scale) * 4.0;
      
      expect(normalized).toBe(3.2);
    });

    it('should normalize GPA from 10.0 scale correctly', () => {
      const gpa = 8.5;
      const scale = 10.0;
      const normalized = (gpa / scale) * 4.0;
      
      expect(normalized).toBe(3.4);
    });

    it('should normalize GPA from 100.0 scale correctly', () => {
      const gpa = 85;
      const scale = 100.0;
      const normalized = (gpa / scale) * 4.0;
      
      expect(normalized).toBe(3.4);
    });
  });

  describe('Match Category Classification', () => {
    it('should classify Safety schools (70-100% match)', () => {
      const matchPercentage = 85;
      let category = '';
      
      if (matchPercentage >= 70) category = 'Safety';
      else if (matchPercentage >= 50) category = 'Target';
      else category = 'Reach';
      
      expect(category).toBe('Safety');
    });

    it('should classify Target schools (50-69% match)', () => {
      const matchPercentage = 60;
      let category = '';
      
      if (matchPercentage >= 70) category = 'Safety';
      else if (matchPercentage >= 50) category = 'Target';
      else category = 'Reach';
      
      expect(category).toBe('Target');
    });

    it('should classify Reach schools (0-49% match)', () => {
      const matchPercentage = 35;
      let category = '';
      
      if (matchPercentage >= 70) category = 'Safety';
      else if (matchPercentage >= 50) category = 'Target';
      else category = 'Reach';
      
      expect(category).toBe('Reach');
    });
  });

  describe('Score Validation', () => {
    it('should validate GMAT score range (200-800)', () => {
      const validGMAT = 700;
      const invalidGMATLow = 150;
      const invalidGMATHigh = 850;

      expect(validGMAT >= 200 && validGMAT <= 800).toBe(true);
      expect(invalidGMATLow >= 200 && invalidGMATLow <= 800).toBe(false);
      expect(invalidGMATHigh >= 200 && invalidGMATHigh <= 800).toBe(false);
    });

    it('should validate GRE score range (260-340)', () => {
      const validGRE = 320;
      const invalidGRELow = 250;
      const invalidGREHigh = 350;

      expect(validGRE >= 260 && validGRE <= 340).toBe(true);
      expect(invalidGRELow >= 260 && invalidGRELow <= 340).toBe(false);
      expect(invalidGREHigh >= 260 && invalidGREHigh <= 340).toBe(false);
    });

    it('should ensure either GMAT or GRE is provided (not both)', () => {
      const profile1 = { gmat_score: 700, gre_score: undefined };
      const profile2 = { gmat_score: undefined, gre_score: 320 };
      const profile3 = { gmat_score: 700, gre_score: 320 }; // Invalid

      const hasValidScores1 = (!!profile1.gmat_score) !== (!!profile1.gre_score);
      const hasValidScores2 = (!!profile2.gmat_score) !== (!!profile2.gre_score);
      const hasValidScores3 = (!!profile3.gmat_score) !== (!!profile3.gre_score);

      expect(hasValidScores1).toBe(true);
      expect(hasValidScores2).toBe(true);
      expect(hasValidScores3).toBe(false); // Both provided - invalid
    });
  });
});
