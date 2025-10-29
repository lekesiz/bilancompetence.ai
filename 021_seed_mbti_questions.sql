-- Migration 021: Seed MBTI Test Questions
-- Date: 2025-10-25
-- Purpose: Insert MBTI personality test questions (60 questions, 15 per dimension)
-- Dependencies: 003_expand_assessment_questions.sql (assessment_questions table must exist)

-- MBTI has 4 dimensions with 2 poles each:
-- E/I: Extraversion vs Introversion
-- S/N: Sensing vs Intuition  
-- T/F: Thinking vs Feeling
-- J/P: Judging vs Perceiving

-- Each question is scored on a scale of 1-5:
-- 1 = Strongly disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly agree

-- ============================================================================
-- DIMENSION 1: EXTRAVERSION (E) vs INTROVERSION (I) - 15 questions
-- ============================================================================

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
  metadata
) VALUES
-- E/I Question 1
(
  'mbti-ei-001'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je me sens énergisé(e) après avoir passé du temps avec un groupe de personnes',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  1,
  true,
  'Répondez selon votre ressenti naturel',
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 2
(
  'mbti-ei-002'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je préfère passer du temps seul(e) plutôt qu''en groupe',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  2,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 3
(
  'mbti-ei-003'::uuid,
  NULL,
  1,
  'mbti_personality',
  'J''aime être au centre de l''attention lors de réunions sociales',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  3,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 4
(
  'mbti-ei-004'::uuid,
  NULL,
  1,
  'mbti_personality',
  'J''ai besoin de moments de solitude pour me ressourcer',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  4,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 5
(
  'mbti-ei-005'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je me fais facilement de nouveaux amis',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  5,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 6
(
  'mbti-ei-006'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je réfléchis longuement avant de parler',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  6,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 7
(
  'mbti-ei-007'::uuid,
  NULL,
  1,
  'mbti_personality',
  'J''aime participer à des activités de groupe',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  7,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 8
(
  'mbti-ei-008'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je préfère écouter plutôt que parler dans les conversations',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  8,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 9
(
  'mbti-ei-009'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je me sens à l''aise pour parler en public',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  9,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 10
(
  'mbti-ei-010'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je trouve les grandes fêtes épuisantes',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  10,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 11
(
  'mbti-ei-011'::uuid,
  NULL,
  1,
  'mbti_personality',
  'J''initie souvent des conversations avec des inconnus',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  11,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 12
(
  'mbti-ei-012'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je préfère travailler seul(e) plutôt qu''en équipe',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  12,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 13
(
  'mbti-ei-013'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je me sens vivant(e) dans les environnements animés',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  13,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
),
-- E/I Question 14
(
  'mbti-ei-014'::uuid,
  NULL,
  1,
  'mbti_personality',
  'J''ai un petit cercle d''amis proches',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  14,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "I", "weight": 1}'::jsonb
),
-- E/I Question 15
(
  'mbti-ei-015'::uuid,
  NULL,
  1,
  'mbti_personality',
  'Je pense à voix haute pour organiser mes idées',
  'likert_scale',
  '[
    {"value": 1, "label": "Pas du tout d''accord"},
    {"value": 2, "label": "Plutôt pas d''accord"},
    {"value": 3, "label": "Neutre"},
    {"value": 4, "label": "Plutôt d''accord"},
    {"value": 5, "label": "Tout à fait d''accord"}
  ]',
  15,
  true,
  NULL,
  '{"dimension": "E/I", "pole": "E", "weight": 1}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DIMENSION 2: SENSING (S) vs INTUITION (N) - 15 questions
-- ============================================================================

-- Note: Due to length constraints, I'll create a summary comment here
-- The full migration would include 45 more questions (15 for S/N, 15 for T/F, 15 for J/P)
-- Each following the same pattern with appropriate metadata

-- For now, this migration includes the E/I dimension as a template
-- Additional dimensions should be added in separate INSERT statements following the same structure

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE assessment_questions IS 'Stores assessment questions including MBTI personality test questions';

-- ============================================================================
-- MIGRATION COMPLETE (PARTIAL - E/I DIMENSION ONLY)
-- ============================================================================
-- TODO: Add remaining 45 questions for S/N, T/F, and J/P dimensions



-- ============================================================================
-- DIMENSION 2: SENSING (S) vs INTUITION (N) - 15 questions
-- ============================================================================

INSERT INTO assessment_questions (id, assessment_id, step_number, section, question_text, question_type, options, "order", required, metadata) VALUES
('mbti-sn-001'::uuid, NULL, 1, 'mbti_personality', 'Je me concentre sur les faits et les détails concrets', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 16, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-002'::uuid, NULL, 1, 'mbti_personality', 'Je préfère explorer les possibilités et les significations cachées', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 17, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-003'::uuid, NULL, 1, 'mbti_personality', 'Je suis pragmatique et réaliste dans mon approche', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 18, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-004'::uuid, NULL, 1, 'mbti_personality', 'J''aime imaginer des scénarios futurs et des possibilités', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 19, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-005'::uuid, NULL, 1, 'mbti_personality', 'Je préfère suivre des méthodes éprouvées', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 20, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-006'::uuid, NULL, 1, 'mbti_personality', 'J''aime innover et essayer de nouvelles approches', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 21, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-007'::uuid, NULL, 1, 'mbti_personality', 'Je remarque les petits détails que d''autres peuvent manquer', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 22, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-008'::uuid, NULL, 1, 'mbti_personality', 'Je vois facilement les connexions entre des idées apparemment sans rapport', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 23, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-009'::uuid, NULL, 1, 'mbti_personality', 'Je préfère les instructions étape par étape', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 24, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-010'::uuid, NULL, 1, 'mbti_personality', 'Je préfère comprendre la vue d''ensemble avant les détails', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 25, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-011'::uuid, NULL, 1, 'mbti_personality', 'Je me fie à mon expérience passée pour prendre des décisions', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 26, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-012'::uuid, NULL, 1, 'mbti_personality', 'Je me fie à mon intuition pour prendre des décisions', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 27, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-013'::uuid, NULL, 1, 'mbti_personality', 'Je suis bon(ne) pour me souvenir de faits et de chiffres', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 28, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb),
('mbti-sn-014'::uuid, NULL, 1, 'mbti_personality', 'Je suis bon(ne) pour voir des modèles et des tendances', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 29, true, '{"dimension": "S/N", "pole": "N", "weight": 1}'::jsonb),
('mbti-sn-015'::uuid, NULL, 1, 'mbti_personality', 'Je préfère vivre dans le présent plutôt que d''imaginer le futur', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 30, true, '{"dimension": "S/N", "pole": "S", "weight": 1}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DIMENSION 3: THINKING (T) vs FEELING (F) - 15 questions
-- ============================================================================

INSERT INTO assessment_questions (id, assessment_id, step_number, section, question_text, question_type, options, "order", required, metadata) VALUES
('mbti-tf-001'::uuid, NULL, 1, 'mbti_personality', 'Je prends des décisions basées sur la logique et l''analyse', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 31, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-002'::uuid, NULL, 1, 'mbti_personality', 'Je prends des décisions basées sur mes valeurs et l''impact sur les autres', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 32, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-003'::uuid, NULL, 1, 'mbti_personality', 'Je valorise l''objectivité et l''équité', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 33, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-004'::uuid, NULL, 1, 'mbti_personality', 'Je valorise l''harmonie et la compassion', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 34, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-005'::uuid, NULL, 1, 'mbti_personality', 'Je peux facilement critiquer les idées sans me soucier des sentiments', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 35, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-006'::uuid, NULL, 1, 'mbti_personality', 'Je fais attention à ne pas blesser les sentiments des autres', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 36, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-007'::uuid, NULL, 1, 'mbti_personality', 'Je préfère être franc(he) même si cela peut être dur', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 37, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-008'::uuid, NULL, 1, 'mbti_personality', 'Je préfère être diplomate et tactful', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 38, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-009'::uuid, NULL, 1, 'mbti_personality', 'Je me concentre sur les faits et la vérité', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 39, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-010'::uuid, NULL, 1, 'mbti_personality', 'Je me concentre sur les relations et les émotions', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 40, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-011'::uuid, NULL, 1, 'mbti_personality', 'Je suis doué(e) pour résoudre des problèmes complexes', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 41, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-012'::uuid, NULL, 1, 'mbti_personality', 'Je suis doué(e) pour comprendre les émotions des autres', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 42, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-013'::uuid, NULL, 1, 'mbti_personality', 'Je préfère les débats intellectuels', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 43, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb),
('mbti-tf-014'::uuid, NULL, 1, 'mbti_personality', 'Je préfère les conversations sur les sentiments et les expériences personnelles', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 44, true, '{"dimension": "T/F", "pole": "F", "weight": 1}'::jsonb),
('mbti-tf-015'::uuid, NULL, 1, 'mbti_personality', 'Je pense que la justice est plus importante que la miséricorde', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 45, true, '{"dimension": "T/F", "pole": "T", "weight": 1}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DIMENSION 4: JUDGING (J) vs PERCEIVING (P) - 15 questions
-- ============================================================================

INSERT INTO assessment_questions (id, assessment_id, step_number, section, question_text, question_type, options, "order", required, metadata) VALUES
('mbti-jp-001'::uuid, NULL, 1, 'mbti_personality', 'Je préfère planifier à l''avance et suivre un horaire', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 46, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-002'::uuid, NULL, 1, 'mbti_personality', 'Je préfère rester flexible et spontané(e)', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 47, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-003'::uuid, NULL, 1, 'mbti_personality', 'J''aime avoir des choses décidées et réglées', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 48, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-004'::uuid, NULL, 1, 'mbti_personality', 'J''aime garder mes options ouvertes', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 49, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-005'::uuid, NULL, 1, 'mbti_personality', 'Je fais des listes de tâches et les suis', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 50, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-006'::uuid, NULL, 1, 'mbti_personality', 'Je préfère improviser plutôt que planifier', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 51, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-007'::uuid, NULL, 1, 'mbti_personality', 'Je me sens mal à l''aise avec les tâches inachevées', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 52, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-008'::uuid, NULL, 1, 'mbti_personality', 'Je travaille mieux sous pression de dernière minute', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 53, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-009'::uuid, NULL, 1, 'mbti_personality', 'J''aime avoir un espace de travail organisé', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 54, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-010'::uuid, NULL, 1, 'mbti_personality', 'Mon espace de travail est souvent en désordre créatif', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 55, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-011'::uuid, NULL, 1, 'mbti_personality', 'Je préfère terminer un projet avant d''en commencer un autre', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 56, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-012'::uuid, NULL, 1, 'mbti_personality', 'J''aime jongler avec plusieurs projets en même temps', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 57, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-013'::uuid, NULL, 1, 'mbti_personality', 'Je respecte toujours les délais', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 58, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb),
('mbti-jp-014'::uuid, NULL, 1, 'mbti_personality', 'Je trouve que les délais sont flexibles', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 59, true, '{"dimension": "J/P", "pole": "P", "weight": 1}'::jsonb),
('mbti-jp-015'::uuid, NULL, 1, 'mbti_personality', 'Je préfère avoir une routine quotidienne structurée', 'likert_scale', '[{"value": 1, "label": "Pas du tout d''accord"},{"value": 2, "label": "Plutôt pas d''accord"},{"value": 3, "label": "Neutre"},{"value": 4, "label": "Plutôt d''accord"},{"value": 5, "label": "Tout à fait d''accord"}]', 60, true, '{"dimension": "J/P", "pole": "J", "weight": 1}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE - ALL 60 MBTI QUESTIONS
-- ============================================================================

