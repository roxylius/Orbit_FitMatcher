import { MatchResult, University, UserProfile } from '../types';
import { categorizeMatch } from '../utils/helpers/matchHelpers';

// Core: Calculate weighted match score (0-100)
const calculateMatchScore = (profile: UserProfile, university: University): number => {
  const { gmat_score, gpa, work_experience, visa_required = false } = profile;
  const { median_gmat, median_gpa, avg_work_experience, acceptance_rate, visa_sponsorship } = university;

  // Factor 1: GMAT (40% weight) - Delta-based scoring
  let gmatScore = 50;  // Neutral baseline
  if (gmat_score && median_gmat) {
    const gmatDelta = gmat_score - median_gmat;
    if (gmatDelta >= 20) gmatScore = 90;
    else if (gmatDelta >= 10) gmatScore = 80;
    else if (gmatDelta >= 0) gmatScore = 70;
    else if (gmatDelta >= -10) gmatScore = 60;
    else if (gmatDelta >= -20) gmatScore = 40;
    else gmatScore = 30;
  }

  // Factor 2: GPA (30% weight)
  let gpaScore = 50;
  if (median_gpa) {
    const gpaDelta = gpa - median_gpa;
    if (gpaDelta >= 0.3) gpaScore = 90;
    else if (gpaDelta >= 0.1) gpaScore = 70;
    else if (gpaDelta >= 0) gpaScore = 60;
    else if (gpaDelta >= -0.1) gpaScore = 50;
    else gpaScore = 30;
  }

  // Factor 3: Work Experience (20% weight) - Closeness to average
  let expScore = 50;
  if (avg_work_experience) {
    const expDelta = Math.abs(work_experience - avg_work_experience);
    if (expDelta <= 0.5) expScore = 80;
    else if (expDelta <= 1.0) expScore = 70;
    else if (expDelta <= 2.0) expScore = 50;
    else expScore = 30;
  }

  // Factor 4: Acceptance Rate (10% weight) - Higher = easier admission
  let acceptanceScore = 50;
  if (acceptance_rate) {
    if (acceptance_rate >= 25) acceptanceScore = 80;
    else if (acceptance_rate >= 15) acceptanceScore = 70;
    else if (acceptance_rate >= 10) acceptanceScore = 50;
    else acceptanceScore = 30;
  }

  // Bonus Factor: Visa (5% weight)
  let visaScore = 50;
  if (visa_required && visa_sponsorship) visaScore = 80;
  else if (visa_required && !visa_sponsorship) visaScore = 20;

  // Weighted total
  const totalScore = Math.round(
    (gmatScore * 0.40) + (gpaScore * 0.30) + (expScore * 0.20) + 
    (acceptanceScore * 0.10) + (visaScore * 0.05)
  );
  return totalScore;
}

// Generate explainable reasons (3-5 per match)
const generateReasons = (profile: UserProfile, university: University, score: number): string[] => {
  const reasons: string[] = [];
  const { gmat_score, gpa, work_experience, visa_required } = profile;
  const { median_gmat, median_gpa, avg_work_experience, name, visa_sponsorship } = university;

  // GMAT reason
  if (gmat_score && median_gmat) {
    const gmatDelta = gmat_score - median_gmat;
    if (gmatDelta >= 10) reasons.push(`Your GMAT (${gmat_score}) exceeds the median (${median_gmat}).`);
    else if (gmatDelta < -10) reasons.push(`Your GMAT (${gmat_score}) is below the median (${median_gmat}); consider retaking.`);
    else reasons.push(`Your GMAT aligns well with ${name}'s requirements.`);
  }

  // GPA reason
  if (median_gpa) {
    const gpaDelta = gpa - median_gpa;
    if (gpaDelta >= 0.1) reasons.push(`Strong GPA (${gpa}) compared to median (${median_gpa}).`);
    else if (gpaDelta < -0.1) reasons.push(`GPA is slightly below median; highlight achievements in essays.`);
    else reasons.push(`Your GPA fits ${name}'s profile.`);
  }

  // Work Exp reason
  if (avg_work_experience) {
    const expDelta = Math.abs(work_experience - avg_work_experience);
    if (expDelta <= 1) reasons.push(`Work experience (${work_experience} years) matches average (${avg_work_experience}).`);
    else if (work_experience > avg_work_experience) reasons.push(`Extensive experience – leverage leadership examples.`);
    else reasons.push(`Build more experience to strengthen application.`);
  }

  // Visa reason (if applicable)
  if (visa_required) {
    reasons.push(visa_sponsorship ? 'Visa sponsorship available – low immigration barrier.' : 'Check sponsorship options for international status.');
  }

  // Category summary
  reasons.push(`${name} is a ${categorizeMatch(score)} school based on your profile.`);

  return reasons.slice(0, 5);  // Limit for UI
}

// Process full matches (for route use)
const getMatches = (profile: UserProfile, universities: University[]): MatchResult[] => {
  return universities
    .map((university) => {
      const match_percentage = calculateMatchScore(profile, university);
      return {
        university,
        match_percentage,
        category: categorizeMatch(match_percentage),
        reasons: generateReasons(profile, university, match_percentage),
      } as MatchResult;
    })
    .sort((a, b) => b.match_percentage - a.match_percentage);  // Descending score
};

export { generateReasons, calculateMatchScore, getMatches };