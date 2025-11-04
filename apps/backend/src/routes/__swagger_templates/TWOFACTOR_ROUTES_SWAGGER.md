# Swagger Annotations for Two-Factor Authentication Routes

Add these annotations to `apps/backend/src/routes/twoFactor.ts`:

## 1. Add tag definition at top (after imports, before router):

```typescript
/**
 * @swagger
 * tags:
 *   name: 2FA
 *   description: Two-Factor Authentication management
 */
```

## 2. Add to POST /setup (line 11):

```typescript
/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user
 *     description: Generate 2FA secret, QR code, and backup codes for the authenticated user
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Secret 2FA généré avec succès"
 *                 secret:
 *                   type: string
 *                   description: TOTP secret key
 *                 qrCode:
 *                   type: string
 *                   description: Base64 encoded QR code image
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of backup codes for account recovery
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 3. Add to POST /enable (line 37):

```typescript
/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Enable 2FA
 *     description: Enable 2FA after verifying the first TOTP token
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP token from authenticator app
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid token
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 4. Add to POST /verify (line 67):

```typescript
/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     description: Verify a 2FA token during login (public endpoint)
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP token
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid token
 */
```

## 5. Add to POST /disable (line 92):

```typescript
/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     description: Disable 2FA for the authenticated user (requires password confirmation)
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password for security verification
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

## 6. Add to GET /status (line 121):

```typescript
/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Check 2FA status
 *     description: Check if 2FA is enabled for the authenticated user
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isEnabled:
 *                   type: boolean
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

**Coverage:** 5/5 endpoints (100%)
