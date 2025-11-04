# Swagger Annotations for AI Routes

Add these annotations to `apps/backend/src/routes/ai.ts`:

## 1. Add tag definition at top (after imports, before router):

```typescript
/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered career analysis and recommendations using Google Gemini API
 */
```

## 2. Add to POST /analyze-cv (line 43):

```typescript
/**
 * @swagger
 * /api/ai/analyze-cv:
 *   post:
 *     summary: Analyze CV using AI
 *     description: Upload and analyze CV to extract skills, experiences, education, languages, and soft skills using Google Gemini API
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (Word document preferred, max 5MB. PDF temporarily unavailable)
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional assessment ID to save analysis results
 *     responses:
 *       200:
 *         description: CV analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     competences:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["JavaScript", "React", "Project Management"]
 *                     experiences:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           poste:
 *                             type: string
 *                           entreprise:
 *                             type: string
 *                           duree:
 *                             type: string
 *                           description:
 *                             type: string
 *                     formations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           diplome:
 *                             type: string
 *                           etablissement:
 *                             type: string
 *                           annee:
 *                             type: string
 *                     langues:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Français", "Anglais"]
 *                     soft_skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Communication", "Leadership"]
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       501:
 *         description: PDF analysis temporarily unavailable (Node.js 20+ required)
 */
```

## 3. Add to POST /job-recommendations (line 129):

```typescript
/**
 * @swagger
 * /api/ai/job-recommendations:
 *   post:
 *     summary: Get AI-powered job recommendations
 *     description: Generate personalized job recommendations based on competences, interests, and values using Google Gemini
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - competences
 *             properties:
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional assessment ID to save recommendations
 *               competences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user competences
 *                 example: ["JavaScript", "React", "Node.js", "SQL"]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User interests (optional)
 *                 example: ["Web development", "UX design", "Data visualization"]
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User values (optional)
 *                 example: ["Innovation", "Team work", "Work-life balance"]
 *     responses:
 *       200:
 *         description: Job recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: object
 *                   properties:
 *                     metiers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           description:
 *                             type: string
 *                           match_score:
 *                             type: integer
 *                           competences_requises:
 *                             type: array
 *                             items:
 *                               type: string
 *                           competences_manquantes:
 *                             type: array
 *                             items:
 *                               type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 4. Add to POST /analyze-personality (line 176):

```typescript
/**
 * @swagger
 * /api/ai/analyze-personality:
 *   post:
 *     summary: Analyze personality using MBTI/RIASEC
 *     description: Generate personality analysis based on MBTI type and/or RIASEC scores
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mbti_type:
 *                 type: string
 *                 example: "INTJ"
 *               riasec_scores:
 *                 type: object
 *                 example: { "R": 45, "I": 70, "A": 30, "S": 60, "E": 40, "C": 55 }
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Personality analyzed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 5. Add to POST /generate-action-plan (line 217):

```typescript
/**
 * @swagger
 * /api/ai/generate-action-plan:
 *   post:
 *     summary: Generate personalized career action plan
 *     description: Create detailed action plan to reach target job with steps, formations, and timeline
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_job
 *             properties:
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *               target_job:
 *                 type: string
 *                 example: "Full Stack Developer"
 *               current_competences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["HTML", "CSS", "JavaScript"]
 *               gap_analysis:
 *                 type: string
 *                 example: "Need to learn React, Node.js, and databases"
 *     responses:
 *       200:
 *         description: Action plan generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action_plan:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## Implementation:

1. Add the tag definition after line 14 (after imports)
2. Replace each route's comment with the corresponding Swagger annotation
3. Keep the rest of the code unchanged

**Coverage:** 4/4 endpoints (100%)
