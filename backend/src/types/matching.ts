export interface UserProfile {
  gmat_score?: number;
  gre_score?: number;
  gpa: number;
  gpa_scale?: number;
  work_experience: number;
  program_type: string;
  industry_preference?: string;
  nationality?: string;
  visa_required?: boolean;
  preferred_location?: string;
}

export interface University {
  university_id: number;
  name: string;
  program_name: string;
  program_type: string; // Joined from program_types table
  location_city: string | null;
  location_country: string | null; // Joined from countries table
  location_region: string | null; // Joined from countries table
  ranking: number | null;
  acceptance_rate: number | null;
  median_gmat: number | null;
  median_gre: number | null;
  median_gpa: number | null;
  avg_work_experience: number | null;
  tuition_usd: number | null;
  avg_starting_salary_usd: number | null;
  scholarship_available: boolean | null;
  visa_sponsorship: boolean | null;
  primary_industry: string | null; // Joined from industries table
  post_study_work_support: string | null;
}

export interface MatchResult {
  university: University;
  match_percentage: number;
  category: string;
  reasons: string[];
}
