-- Migration 007: Seed Assessment Questions
-- Date: 2025-10-22
-- Purpose: Insert predefined assessment questions for the 5-step wizard
-- Status: PENDING
-- Note: These are template questions. New assessments can inherit these or create custom ones

-- Create a temporary function to generate a consistent UUID based on namespace
-- This ensures the same question always gets the same UUID across deployments

-- STEP 1: Work History (3 questions)
INSERT INTO assessment_questions (
  id,
  assessment_id,
  step_number,
  section,
  question_text,
  question_type,
  "order",
  required,
  help_text,
  placeholder
) VALUES
-- Step 1.1
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  NULL,
  1,
  'work_history',
  'Describe your most recent job position',
  'textarea',
  1,
  true,
  'Include job title, company name, years worked, and key responsibilities',
  'E.g., Senior Developer at TechCorp (2020-2025): Led backend development...'
),
-- Step 1.2
(
  '11111111-1111-1111-1111-111111111112'::uuid,
  NULL,
  1,
  'work_history',
  'List all previous job positions',
  'textarea',
  2,
  true,
  'List in reverse chronological order (most recent first). Include job title, company, and years.',
  'Junior Developer at StartupCo (2018-2020)
Project Manager at Corp (2016-2018)
...'
),
-- Step 1.3
(
  '11111111-1111-1111-1111-111111111113'::uuid,
  NULL,
  1,
  'work_history',
  'What aspects of your work history are most important to you?',
  'textarea',
  3,
  false,
  'Consider achievements, challenges overcome, skills developed, etc.',
  'E.g., I''m proud of...'
)
ON CONFLICT DO NOTHING;

-- STEP 2: Education (4 questions)
INSERT INTO assessment_questions (
  id,
  assessment_id,
  step_number,
  section,
  question_text,
  question_type,
  options,
  "order",
  required,
  help_text,
  placeholder
) VALUES
-- Step 2.1
(
  '22222222-2222-2222-2222-222222222221'::uuid,
  NULL,
  2,
  'education',
  'What is your highest level of education?',
  'select',
  '[
    {"value": "bac", "label": "Baccalauréat"},
    {"value": "bac+2", "label": "Bac+2 (DEUG, BTS, DUT)"},
    {"value": "bac+3", "label": "Bac+3 (Licence)"},
    {"value": "bac+5", "label": "Bac+5+ (Master, Doctorat)"},
    {"value": "other", "label": "Other"}
  ]',
  1,
  true,
  'Select the highest education level you have completed',
  NULL
),
-- Step 2.2
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  NULL,
  2,
  'education',
  'What is your field of study?',
  'text',
  NULL,
  2,
  false,
  'E.g., Computer Science, Business Administration, Psychology, etc.',
  'E.g., Computer Science'
),
-- Step 2.3
(
  '22222222-2222-2222-2222-222222222223'::uuid,
  NULL,
  2,
  'education',
  'Do you have any professional certifications or qualifications?',
  'textarea',
  NULL,
  3,
  false,
  'List any certifications, qualifications, or additional training completed',
  'E.g., AWS Certified Solutions Architect
Oracle Database Certification
...'
),
-- Step 2.4
(
  '22222222-2222-2222-2222-222222222224'::uuid,
  NULL,
  2,
  'education',
  'Are you currently pursuing any education or training?',
  'text',
  NULL,
  4,
  false,
  'If yes, describe the program and expected completion date',
  'E.g., Pursuing Master''s in Data Science (completion: 2026)'
)
ON CONFLICT DO NOTHING;

-- STEP 3: Skills & Competencies (2 questions)
INSERT INTO assessment_questions (
  id,
  assessment_id,
  step_number,
  section,
  question_text,
  question_type,
  options,
  "order",
  required,
  help_text,
  placeholder
) VALUES
-- Step 3.1
(
  '33333333-3333-3333-3333-333333333331'::uuid,
  NULL,
  3,
  'skills',
  'Select your professional skills and rate your proficiency level',
  'checkbox_array',
  '[
    {"value": "leadership", "label": "Leadership"},
    {"value": "communication", "label": "Communication"},
    {"value": "project_management", "label": "Project Management"},
    {"value": "data_analysis", "label": "Data Analysis"},
    {"value": "programming", "label": "Programming"},
    {"value": "web_development", "label": "Web Development"},
    {"value": "mobile_development", "label": "Mobile Development"},
    {"value": "database_management", "label": "Database Management"},
    {"value": "cloud_computing", "label": "Cloud Computing (AWS, Azure, GCP)"},
    {"value": "machine_learning", "label": "Machine Learning"},
    {"value": "data_visualization", "label": "Data Visualization"},
    {"value": "financial_analysis", "label": "Financial Analysis"},
    {"value": "marketing", "label": "Marketing"},
    {"value": "sales", "label": "Sales"},
    {"value": "customer_service", "label": "Customer Service"},
    {"value": "human_resources", "label": "Human Resources"},
    {"value": "accounting", "label": "Accounting/Finance"},
    {"value": "legal_knowledge", "label": "Legal Knowledge"},
    {"value": "teaching", "label": "Teaching/Training"},
    {"value": "writing", "label": "Writing/Content Creation"},
    {"value": "graphic_design", "label": "Graphic Design"},
    {"value": "ux_ui_design", "label": "UX/UI Design"},
    {"value": "video_production", "label": "Video Production"},
    {"value": "social_media", "label": "Social Media Management"},
    {"value": "seo_sem", "label": "SEO/SEM"},
    {"value": "business_strategy", "label": "Business Strategy"},
    {"value": "supply_chain", "label": "Supply Chain Management"},
    {"value": "quality_assurance", "label": "Quality Assurance"},
    {"value": "research", "label": "Research"},
    {"value": "negotiation", "label": "Negotiation"},
    {"value": "problem_solving", "label": "Problem Solving"},
    {"value": "critical_thinking", "label": "Critical Thinking"},
    {"value": "time_management", "label": "Time Management"},
    {"value": "adaptability", "label": "Adaptability"},
    {"value": "teamwork", "label": "Teamwork"},
    {"value": "french", "label": "French Language"},
    {"value": "english", "label": "English Language"},
    {"value": "spanish", "label": "Spanish Language"},
    {"value": "german", "label": "German Language"},
    {"value": "italian", "label": "Italian Language"},
    {"value": "mandarin", "label": "Mandarin Language"},
    {"value": "arabic", "label": "Arabic Language"}
  ]',
  1,
  true,
  'Select all skills you possess and will be prompted to rate your level for each',
  NULL
),
-- Step 3.2
(
  '33333333-3333-3333-3333-333333333332'::uuid,
  NULL,
  3,
  'skills',
  'List any additional skills not shown above',
  'textarea',
  NULL,
  2,
  false,
  'Add any specialized or niche skills relevant to your career',
  'E.g., Specialized software, unique certifications, uncommon skills...'
)
ON CONFLICT DO NOTHING;

-- STEP 4: Motivations & Values (3 questions)
INSERT INTO assessment_questions (
  id,
  assessment_id,
  step_number,
  section,
  question_text,
  question_type,
  options,
  "order",
  required,
  help_text,
  placeholder
) VALUES
-- Step 4.1
(
  '44444444-4444-4444-4444-444444444441'::uuid,
  NULL,
  4,
  'motivations',
  'What are your top 3 career values? (Select up to 3)',
  'multiselect',
  '[
    {"value": "autonomy", "label": "Autonomy - Independence in work"},
    {"value": "stability", "label": "Stability - Secure, predictable work"},
    {"value": "growth", "label": "Growth & Learning - Continuous development"},
    {"value": "impact", "label": "Impact - Making a difference"},
    {"value": "creativity", "label": "Creativity - Innovation and expression"},
    {"value": "collaboration", "label": "Collaboration - Working with teams"},
    {"value": "recognition", "label": "Recognition - Acknowledgment of work"},
    {"value": "compensation", "label": "Compensation - Competitive salary"},
    {"value": "flexibility", "label": "Flexibility - Work-life balance"},
    {"value": "prestige", "label": "Prestige - Status and reputation"},
    {"value": "helping_others", "label": "Helping Others - Service-oriented work"},
    {"value": "security", "label": "Security - Job and financial security"}
  ]',
  1,
  true,
  'Choose up to 3 values that are most important to you in a career',
  NULL
),
-- Step 4.2
(
  '44444444-4444-4444-4444-444444444442'::uuid,
  NULL,
  4,
  'motivations',
  'What are your top 3 career goals? (Select up to 3)',
  'multiselect',
  '[
    {"value": "leadership", "label": "Leadership Position - Manage teams"},
    {"value": "expertise", "label": "Subject Matter Expert - Deep expertise in field"},
    {"value": "entrepreneurship", "label": "Entrepreneurship - Start own business"},
    {"value": "higher_education", "label": "Higher Education - Return to school"},
    {"value": "career_change", "label": "Career Change - Switch to new field"},
    {"value": "stay_current", "label": "Stay Current - Keep up with industry"},
    {"value": "work_life_balance", "label": "Work-Life Balance - Better balance"},
    {"value": "travel", "label": "International Work - Travel/relocate"},
    {"value": "remote_work", "label": "Remote Work - Work from anywhere"},
    {"value": "social_impact", "label": "Social Impact - Work for cause"},
    {"value": "financial_security", "label": "Financial Security - Build wealth"},
    {"value": "consulting", "label": "Consulting - Advise other organizations"}
  ]',
  2,
  true,
  'Choose up to 3 goals you want to achieve in your career',
  NULL
),
-- Step 4.3
(
  '44444444-4444-4444-4444-444444444443'::uuid,
  NULL,
  4,
  'motivations',
  'Describe your ideal work environment and what motivates you',
  'textarea',
  NULL,
  3,
  true,
  'Describe what gets you excited about work, your ideal team, work style, etc.',
  'E.g., I thrive in fast-paced environments with collaborative teams. I''m motivated by...'
)
ON CONFLICT DO NOTHING;

-- STEP 5: Constraints & Context (4 questions)
INSERT INTO assessment_questions (
  id,
  assessment_id,
  step_number,
  section,
  question_text,
  question_type,
  options,
  "order",
  required,
  help_text,
  placeholder
) VALUES
-- Step 5.1
(
  '55555555-5555-5555-5555-555555555551'::uuid,
  NULL,
  5,
  'constraints',
  'What are your geographic preferences for work?',
  'multiselect',
  '[
    {"value": "paris", "label": "Île-de-France (Paris region)"},
    {"value": "auvergne_rhone_alpes", "label": "Auvergne-Rhône-Alpes"},
    {"value": "bourgogne_franche_comte", "label": "Bourgogne-Franche-Comté"},
    {"value": "brittany", "label": "Brittany"},
    {"value": "centre", "label": "Centre-Val de Loire"},
    {"value": "champagne", "label": "Champagne-Ardenne"},
    {"value": "corsica", "label": "Corsica"},
    {"value": "grand_est", "label": "Grand Est"},
    {"value": "hauts_france", "label": "Hauts-de-France"},
    {"value": "languedoc", "label": "Languedoc-Roussillon"},
    {"value": "limousin", "label": "Limousin"},
    {"value": "aquitaine", "label": "New Aquitaine"},
    {"value": "normandy", "label": "Normandy"},
    {"value": "occitanie", "label": "Occitanie"},
    {"value": "loire", "label": "Pays de la Loire"},
    {"value": "paca", "label": "Provence-Alpes-Côte d''Azur"},
    {"value": "remote", "label": "Remote (work from anywhere)"},
    {"value": "international", "label": "International (outside France)"}
  ]',
  1,
  false,
  'Select all regions where you''re willing to work',
  NULL
),
-- Step 5.2
(
  '55555555-5555-5555-5555-555555555552'::uuid,
  NULL,
  5,
  'constraints',
  'What types of employment contracts are you interested in?',
  'multiselect',
  '[
    {"value": "cdi", "label": "CDI (Permanent Contract)"},
    {"value": "cdd", "label": "CDD (Fixed-term Contract)"},
    {"value": "interim", "label": "Interim/Temporary"},
    {"value": "freelance", "label": "Freelance/Self-employed"},
    {"value": "entrepreneur", "label": "Entrepreneur (Own business)"},
    {"value": "part_time", "label": "Part-time"},
    {"value": "apprenticeship", "label": "Apprenticeship"}
  ]',
  2,
  false,
  'Select all contract types that interest you',
  NULL
),
-- Step 5.3
(
  '55555555-5555-5555-5555-555555555553'::uuid,
  NULL,
  5,
  'constraints',
  'What salary range are you aiming for (gross annual)?',
  'select',
  '[
    {"value": "under_25k", "label": "Under €25,000"},
    {"value": "25k_35k", "label": "€25,000 - €35,000"},
    {"value": "35k_50k", "label": "€35,000 - €50,000"},
    {"value": "50k_70k", "label": "€50,000 - €70,000"},
    {"value": "70k_100k", "label": "€70,000 - €100,000"},
    {"value": "100k_150k", "label": "€100,000 - €150,000"},
    {"value": "over_150k", "label": "Over €150,000"},
    {"value": "not_specified", "label": "Prefer not to specify"}
  ]',
  3,
  false,
  'Select your target salary range',
  NULL
),
-- Step 5.4
(
  '55555555-5555-5555-5555-555555555554'::uuid,
  NULL,
  5,
  'constraints',
  'Are there any other constraints or conditions important for your next role?',
  'textarea',
  NULL,
  4,
  false,
  'Include any other important factors (e.g., specific company type, industry restrictions, health considerations, etc.)',
  'E.g., Must be a startup, cannot work in healthcare, need flexible hours...'
)
ON CONFLICT DO NOTHING;

-- Add RLS policies if needed (adjust based on your actual RLS setup)
-- Note: These are just template questions. Individual assessments should link their own questions
-- or inherit these with assessment_id = NULL indicating they are templates
