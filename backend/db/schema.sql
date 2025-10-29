-- Normalized Database Schema for University Matching System
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS program_types CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS industries CASCADE;

-- Create normalized lookup tables

-- Program Types Table
CREATE TABLE program_types (
    program_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Countries Table
CREATE TABLE countries (
    country_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industries Table
CREATE TABLE industries (
    industry_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universities Table (normalized - removed class_size, secondary_industries, international_student_ratio)
CREATE TABLE universities (
    university_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_type_id INTEGER REFERENCES program_types(program_type_id),
    location_city VARCHAR(100),
    country_id INTEGER REFERENCES countries(country_id),
    ranking INTEGER,
    acceptance_rate NUMERIC(5,2),
    median_gmat INTEGER,
    median_gre INTEGER,
    median_gpa NUMERIC(3,2),
    avg_work_experience NUMERIC(3,1),
    tuition_usd INTEGER,
    avg_starting_salary_usd INTEGER,
    scholarship_available BOOLEAN DEFAULT FALSE,
    visa_sponsorship BOOLEAN DEFAULT FALSE,
    primary_industry_id INTEGER REFERENCES industries(industry_id),
    post_study_work_support VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, program_name)
);

-- Create indexes for performance
CREATE INDEX idx_universities_program_type ON universities(program_type_id);
CREATE INDEX idx_universities_country ON universities(country_id);
CREATE INDEX idx_universities_primary_industry ON universities(primary_industry_id);
CREATE INDEX idx_universities_ranking ON universities(ranking);
CREATE INDEX idx_universities_median_gmat ON universities(median_gmat);
CREATE INDEX idx_universities_median_gpa ON universities(median_gpa);
