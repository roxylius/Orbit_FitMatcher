-- Seed data for normalized university database
-- Run this in Supabase SQL Editor AFTER running schema.sql

-- Insert Program Types
INSERT INTO program_types (name) VALUES
    ('MBA'),
    ('MS CS'),
    ('MS Finance'),
    ('MS Analytics')
ON CONFLICT (name) DO NOTHING;

-- Insert Countries with Regions
INSERT INTO countries (name, region) VALUES
    ('USA', 'North America'),
    ('France', 'Europe'),
    ('UK', 'Europe')
ON CONFLICT (name) DO NOTHING;

-- Insert Industries
INSERT INTO industries (name) VALUES
    ('Consulting'),
    ('Technology'),
    ('Finance'),
    ('Entrepreneurship'),
    ('Operations'),
    ('Marketing'),
    ('Media'),
    ('Social Impact'),
    ('Healthcare'),
    ('Analytics'),
    ('Artificial Intelligence'),
    ('Robotics'),
    ('Cybersecurity'),
    ('Data Science'),
    ('Software Engineering'),
    ('Risk Management'),
    ('Quantitative Finance'),
    ('Sustainability')
ON CONFLICT (name) DO NOTHING;

-- Insert Universities (removed class_size, secondary_industries, international_student_ratio)
INSERT INTO universities (
    name,
    program_name,
    program_type_id,
    location_city,
    country_id,
    ranking,
    acceptance_rate,
    median_gmat,
    median_gre,
    median_gpa,
    avg_work_experience,
    tuition_usd,
    avg_starting_salary_usd,
    scholarship_available,
    visa_sponsorship,
    primary_industry_id,
    post_study_work_support
) VALUES
    ('Harvard Business School', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Boston', (SELECT country_id FROM countries WHERE name = 'USA'), 1, 11.50, 730, 325, 3.70, 4.7, 73440, 175000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Consulting'), 'Strong'),
    ('Stanford Graduate School of Business', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Stanford', (SELECT country_id FROM countries WHERE name = 'USA'), 2, 6.90, 737, 328, 3.75, 4.5, 74706, 178000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Strong'),
    ('Wharton School', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Philadelphia', (SELECT country_id FROM countries WHERE name = 'USA'), 3, 20.70, 728, 324, 3.60, 5.0, 77976, 172000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Finance'), 'Strong'),
    ('MIT Sloan School of Management', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Cambridge', (SELECT country_id FROM countries WHERE name = 'USA'), 4, 14.60, 723, 322, 3.68, 5.2, 80340, 170000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Strong'),
    ('Northwestern Kellogg School of Management', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Evanston', (SELECT country_id FROM countries WHERE name = 'USA'), 5, 23.10, 727, 323, 3.61, 5.1, 76536, 168000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Consulting'), 'Strong'),
    ('Chicago Booth School of Business', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Chicago', (SELECT country_id FROM countries WHERE name = 'USA'), 6, 23.90, 730, 325, 3.60, 5.0, 77000, 169000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Finance'), 'Strong'),
    ('Columbia Business School', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'New York', (SELECT country_id FROM countries WHERE name = 'USA'), 7, 17.00, 727, 324, 3.60, 5.0, 80252, 170000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Finance'), 'Strong'),
    ('INSEAD', 'Global MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Fontainebleau', (SELECT country_id FROM countries WHERE name = 'France'), 8, 31.00, 710, 324, 3.50, 5.5, 98300, 170000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Consulting'), 'Strong'),
    ('London Business School', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'London', (SELECT country_id FROM countries WHERE name = 'UK'), 9, 34.00, 708, 322, 3.45, 5.0, 115000, 156000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Finance'), 'Strong'),
    ('UC Berkeley Haas School of Business', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Berkeley', (SELECT country_id FROM countries WHERE name = 'USA'), 10, 17.60, 726, 323, 3.65, 5.4, 79860, 167000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Strong'),
    ('Yale School of Management', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'New Haven', (SELECT country_id FROM countries WHERE name = 'USA'), 11, 24.60, 725, 324, 3.64, 5.0, 79200, 162000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Social Impact'), 'Moderate'),
    ('Duke Fuqua School of Business', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Durham', (SELECT country_id FROM countries WHERE name = 'USA'), 12, 24.90, 710, 320, 3.50, 5.5, 74818, 154000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Healthcare'), 'Moderate'),
    ('University of Michigan Ross School of Business', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Ann Arbor', (SELECT country_id FROM countries WHERE name = 'USA'), 13, 27.90, 720, 322, 3.50, 5.0, 74000, 158000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Consulting'), 'Strong'),
    ('NYU Stern School of Business', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'New York', (SELECT country_id FROM countries WHERE name = 'USA'), 14, 29.40, 720, 324, 3.60, 5.2, 76800, 155000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Finance'), 'Strong'),
    ('UCLA Anderson School of Management', 'MBA', (SELECT program_type_id FROM program_types WHERE name = 'MBA'), 'Los Angeles', (SELECT country_id FROM countries WHERE name = 'USA'), 15, 30.00, 708, 321, 3.50, 5.0, 66960, 150000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Moderate'),
    ('Carnegie Mellon University', 'MS in Computer Science', (SELECT program_type_id FROM program_types WHERE name = 'MS CS'), 'Pittsburgh', (SELECT country_id FROM countries WHERE name = 'USA'), 16, 17.00, 700, 328, 3.60, 2.5, 54000, 140000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Strong'),
    ('Georgia Institute of Technology', 'MS in Computer Science', (SELECT program_type_id FROM program_types WHERE name = 'MS CS'), 'Atlanta', (SELECT country_id FROM countries WHERE name = 'USA'), 17, 18.00, 690, 325, 3.50, 3.0, 34000, 128000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Moderate'),
    ('University of Illinois Urbana-Champaign', 'MS in Computer Science', (SELECT program_type_id FROM program_types WHERE name = 'MS CS'), 'Urbana', (SELECT country_id FROM countries WHERE name = 'USA'), 18, 20.00, 680, 324, 3.50, 2.0, 32000, 122000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Technology'), 'Moderate'),
    ('Columbia University', 'MS in Finance', (SELECT program_type_id FROM program_types WHERE name = 'MS Finance'), 'New York', (SELECT country_id FROM countries WHERE name = 'USA'), 19, 15.00, 720, 326, 3.60, 3.0, 85000, 150000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Finance'), 'Strong'),
    ('University of Texas at Austin McCombs', 'MS in Business Analytics', (SELECT program_type_id FROM program_types WHERE name = 'MS Analytics'), 'Austin', (SELECT country_id FROM countries WHERE name = 'USA'), 20, 28.00, 690, 323, 3.40, 3.0, 48000, 135000, TRUE, TRUE, (SELECT industry_id FROM industries WHERE name = 'Analytics'), 'Moderate');

