-- Schema for universities table only
CREATE TABLE IF NOT EXISTS universities (
    university_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_type VARCHAR(100) NOT NULL,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    ranking INTEGER,
    acceptance_rate NUMERIC(5,2),
    median_gmat INTEGER,
    median_gre INTEGER,
    median_gpa NUMERIC(3,2),
    avg_work_experience NUMERIC(3,1),
    class_size INTEGER,
    tuition_usd INTEGER,
    avg_starting_salary_usd INTEGER,
    scholarship_available BOOLEAN DEFAULT FALSE,
    visa_sponsorship BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS universities_name_program_idx
    ON universities (name, program_name);

CREATE INDEX IF NOT EXISTS universities_program_type_idx
    ON universities (program_type);

CREATE INDEX IF NOT EXISTS universities_ranking_idx
    ON universities (ranking);
