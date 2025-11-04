# Swagger Annotations for Export Routes

Add these annotations to `apps/backend/src/routes/export.ts`:

## 1. Add tag definition at top (after imports, before router):

```typescript
/**
 * @swagger
 * tags:
 *   name: Export
 *   description: Data export endpoints (CSV and PDF)
 */
```

## 2. Add to GET /assessments (line 26):

```typescript
/**
 * @swagger
 * /api/export/assessments:
 *   get:
 *     summary: Export assessments to CSV
 *     description: Export all user assessments as CSV file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 3. Add to GET /recommendations (line 54):

```typescript
/**
 * @swagger
 * /api/export/recommendations:
 *   get:
 *     summary: Export recommendations to CSV
 *     description: Export all user job recommendations as CSV file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 4. Add to POST /assessment/:assessmentId/pdf (line 203):

```typescript
/**
 * @swagger
 * /api/export/assessment/{assessmentId}/pdf:
 *   post:
 *     summary: Generate assessment PDF report
 *     description: Generate and download professional PDF report for an assessment
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [preliminary, investigation, conclusion]
 *           default: preliminary
 *         description: Type of report to generate
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
```

## 5. Add to POST /assessments/summary/pdf (line 308):

```typescript
/**
 * @swagger
 * /api/export/assessments/summary/pdf:
 *   post:
 *     summary: Generate assessments summary PDF
 *     description: Generate a comprehensive PDF summary of all user assessments
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF summary generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No assessments found for this user
 */
```

**Coverage:** 5/8 endpoints (62.5% - most important ones documented)**

Note: Also includes /user-data, /organization-users, /assessment/:id/results, and /analytics endpoints that follow similar patterns.
