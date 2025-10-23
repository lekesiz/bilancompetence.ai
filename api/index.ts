import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from './emailHelper';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL || '';
const jwtSecret = process.env.JWT_SECRET || '';

if (!databaseUrl) {
  console.error('Missing DATABASE_URL environment variable');
}

if (!jwtSecret) {
  console.error('Missing JWT_SECRET environment variable');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper: Generate JWT tokens
function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' },
    jwtSecret,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    jwtSecret,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
}

// Helper: Verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
}

// Helper: Get user by email
async function getUserByEmail(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Helper: Create user
async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' = 'BENEFICIARY'
) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [email, passwordHash, fullName, role]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Helper: Create session
async function createSession(userId: string, refreshToken: string) {
  const client = await pool.connect();
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const result = await client.query(
      `INSERT INTO auth_sessions (user_id, refresh_token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, refreshToken, expiresAt.toISOString()]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Helper: Update last login
async function updateUserLastLogin(userId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE users 
       SET last_login = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the path and method from the request
  const path = req.url || '';
  const method = req.method || 'GET';
  
  console.log('API Request:', {
    method: req.method,
    path,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract and verify auth token
  let authUser: any = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    authUser = verifyToken(token);
  }

  // ============================================
  // POST /api/auth/register
  // ============================================
  if (path.includes('/auth/register') || path.includes('register')) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
      });
    }

    try {
      const { email, password, full_name, role } = req.body;

      console.log('Registration request received:', {
        email,
        full_name,
        role: role || 'BENEFICIARY',
        timestamp: new Date().toISOString(),
      });

      // Validation
      if (!email || !password || !full_name) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: email, password, full_name',
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email format',
        });
      }

      // Password strength validation (min 12 chars)
      if (password.length < 12) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 12 characters long',
        });
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await createUser(
        email,
        passwordHash,
        full_name,
        role || 'BENEFICIARY'
      );

      console.log('User created successfully:', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user.id,
        user.email,
        user.role
      );

      // Create session
      await createSession(user.id, refreshToken);

      console.log('Session created successfully for user:', user.id);

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.full_name).catch((error) => {
        console.error('Welcome email failed (non-blocking):', error.message);
      });

      // Return success response
      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            email_verified: !!user.email_verified_at,
            created_at: user.created_at,
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '7d',
          },
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // ============================================
  // POST /api/auth/login
  // ============================================
  if (path.includes('/auth/login') || path.includes('login')) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
      });
    }

    try {
      const { email, password } = req.body;

      console.log('Login request received:', {
        email,
        timestamp: new Date().toISOString(),
      });

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: email, password',
        });
      }

      // Get user by email
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      console.log('Password verified successfully for user:', user.id);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user.id,
        user.email,
        user.role
      );

      // Create session
      await createSession(user.id, refreshToken);

      // Update last login
      await updateUserLastLogin(user.id);

      console.log('Login successful for user:', user.id);

      // Return success response
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            email_verified: !!user.email_verified_at,
            last_login_at: new Date().toISOString(),
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '7d',
          },
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // ============================================
  // GET /api/auth/verify
  // ============================================
  if (path.includes('/auth/verify') || path.includes('verify')) {
    if (req.method !== 'GET') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed',
      });
    }

    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'Missing or invalid authorization header',
        });
      }

      const token = authHeader.slice(7);
      
      // Verify JWT token
      const decoded = verifyToken(token);
      
      if (!decoded || decoded.type !== 'access') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token',
        });
      }

      console.log('Token verified successfully for user:', decoded.userId);

      // Return success response with user info
      return res.status(200).json({
        status: 'success',
        message: 'Token is valid',
        data: {
          user: {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          },
        },
      });
    } catch (error: any) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }
  }

  // ============================================
  // POST /api/assessments
  // Create new assessment
  // ============================================
  if (path.includes('/assessments') && req.method === 'POST') {
    try {
      if (!authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const { title, description, assessment_type } = req.body;

      // Validation
      if (!assessment_type || !['career', 'skills', 'comprehensive'].includes(assessment_type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid assessment_type. Must be one of: career, skills, comprehensive',
        });
      }

      const client = await pool.connect();
      try {
        // Get user's organization_id
        const userResult = await client.query(
          'SELECT organization_id FROM users WHERE id = $1',
          [authUser.userId]
        );
        
        const organizationId = userResult.rows[0]?.organization_id;
        
        if (!organizationId) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'User must be associated with an organization to create assessments' 
          });
        }

              // Insert into assessments table (Claude's new schema)
        const result = await client.query(
          `INSERT INTO assessments (beneficiary_id, organization_id, title, assessment_type, status, current_step, progress_percentage, started_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
           RETURNING *`,
          [authUser.userId, organizationId, 'New Assessment', 'career', 'DRAFT', 0, 0]
        );

        console.log('Assessment created:', result.rows[0].id);

        return res.status(201).json({
          status: 'success',
          message: 'Assessment created successfully',
          data: result.rows[0],
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Create assessment error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create assessment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // ============================================
  // GET /api/assessments
  // Get user's assessments
  // ============================================
  if (path.includes('/assessments') && req.method === 'GET' && !path.match(/\/assessments\/[a-f0-9-]+/)) {
    try {
      if (!authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM assessments 
           WHERE beneficiary_id = $1 AND deleted_at IS NULL
           ORDER BY created_at DESC`,
          [authUser.userId]
        );

        return res.status(200).json({
          status: 'success',
          data: result.rows,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Get assessments error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch assessments',
      });
    }
  }

  // ============================================
  // GET /api/assessments/:id
  // Get assessment details
  // ============================================
  const assessmentIdMatch = path.match(/\/assessments\/([a-f0-9-]+)/);
  if (assessmentIdMatch && req.method === 'GET') {
    try {
      if (!authUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const assessmentId = assessmentIdMatch[1];
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM assessments 
           WHERE id = $1 AND deleted_at IS NULL`,
          [assessmentId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            status: 'error',
            message: 'Assessment not found',
          });
        }

        const assessment = result.rows[0];

        // Check authorization
        if (assessment.beneficiary_id !== authUser.userId && assessment.consultant_id !== authUser.userId) {
          return res.status(403).json({
            status: 'error',
            message: 'Unauthorized access to this assessment',
          });
        }

        return res.status(200).json({
          status: 'success',
          data: assessment,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Get assessment error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch assessment',
      });
    }
  }

  // ============================================
  // SCHEDULING API ENDPOINTS
  // ============================================

  // POST /api/scheduling/availability - Create availability slot
  if (method === 'POST' && path === '/api/scheduling/availability') {
    const authUser = verifyToken(req.headers.authorization?.split(' ')[1] || '');
    if (!authUser) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Only consultants can create availability slots
    if (authUser.role !== 'CONSULTANT') {
      return res.status(403).json({ status: 'error', message: 'Only consultants can create availability slots' });
    }

    try {
      const { day_of_week, date_specific, start_time, end_time, duration_minutes, is_recurring } = req.body;

      if (!start_time || !end_time) {
        return res.status(400).json({ status: 'error', message: 'start_time and end_time are required' });
      }

      const client = await pool.connect();
      try {
        // Get user's organization_id
        const userResult = await client.query(
          'SELECT organization_id FROM users WHERE id = $1',
          [authUser.userId]
        );
        
        const organizationId = userResult.rows[0]?.organization_id;
        
        if (!organizationId) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'User must be associated with an organization to create availability slots' 
          });
        }

        const result = await client.query(
          `INSERT INTO availability_slots 
           (consultant_id, organization_id, day_of_week, date_specific, start_time, end_time, duration_minutes, is_recurring) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [
            authUser.userId,
            organizationId,
            day_of_week || null,
            date_specific || null,
            start_time,
            end_time,
            duration_minutes || 120,
            is_recurring || false
          ]
        );

        console.log('Availability slot created:', result.rows[0].id);

        return res.status(201).json({
          status: 'success',
          message: 'Availability slot created successfully',
          data: result.rows[0],
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Create availability error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create availability slot',
      });
    }
  }

  // GET /api/scheduling/availability/:consultantId - Get consultant's availability
  if (method === 'GET' && path.startsWith('/api/scheduling/availability/')) {
    const consultantId = path.split('/')[4];

    if (!consultantId) {
      return res.status(400).json({ status: 'error', message: 'Consultant ID is required' });
    }

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM availability_slots 
           WHERE consultant_id = $1 AND is_available = true 
           ORDER BY date_specific ASC, day_of_week ASC, start_time ASC`,
          [consultantId]
        );

        return res.status(200).json({
          status: 'success',
          data: result.rows,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Get availability error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch availability',
      });
    }
  }

  // POST /api/scheduling/bookings - Create a booking
  if (method === 'POST' && path === '/api/scheduling/bookings') {
    const authUser = verifyToken(req.headers.authorization?.split(' ')[1] || '');
    if (!authUser) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    try {
      const { 
        bilan_id, 
        consultant_id, 
        scheduled_date, 
        scheduled_start_time, 
        scheduled_end_time,
        duration_minutes,
        session_type,
        meeting_format
      } = req.body;

      if (!bilan_id || !consultant_id || !scheduled_date || !scheduled_start_time || !scheduled_end_time) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'bilan_id, consultant_id, scheduled_date, scheduled_start_time, and scheduled_end_time are required' 
        });
      }

      const client = await pool.connect();
      try {
        // Get user's organization_id
        const userResult = await client.query(
          'SELECT organization_id FROM users WHERE id = $1',
          [authUser.userId]
        );
        
        const organizationId = userResult.rows[0]?.organization_id;
        
        if (!organizationId) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'User must be associated with an organization to create bookings' 
          });
        }

        const result = await client.query(
          `INSERT INTO session_bookings 
           (bilan_id, consultant_id, beneficiary_id, organization_id, scheduled_date, scheduled_start_time, scheduled_end_time, duration_minutes, session_type, meeting_format) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
           RETURNING *`,
          [
            bilan_id,
            consultant_id,
            authUser.userId,
            organizationId,
            scheduled_date,
            scheduled_start_time,
            scheduled_end_time,
            duration_minutes || 120,
            session_type || 'FOLLOW_UP',
            meeting_format || 'VIDEO'
          ]
        );

        console.log('Booking created:', result.rows[0].id);

        return res.status(201).json({
          status: 'success',
          message: 'Booking created successfully',
          data: result.rows[0],
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Create booking error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create booking',
      });
    }
  }

  // GET /api/scheduling/bookings - Get user's bookings
  if (method === 'GET' && path === '/api/scheduling/bookings') {
    const authUser = verifyToken(req.headers.authorization?.split(' ')[1] || '');
    if (!authUser) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM session_bookings 
           WHERE beneficiary_id = $1 OR consultant_id = $1 
           ORDER BY scheduled_date DESC, scheduled_start_time DESC`,
          [authUser.userId]
        );

        return res.status(200).json({
          status: 'success',
          data: result.rows,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Get bookings error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch bookings',
      });
    }
  }

  // ============================================
  // Default 404 for unknown endpoints
  // ============================================
  return res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path,
    available_endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/verify',
      'POST /api/assessments',
      'GET /api/assessments',
      'GET /api/assessments/:id',
      'POST /api/scheduling/availability',
      'GET /api/scheduling/availability/:consultantId',
      'POST /api/scheduling/bookings',
      'GET /api/scheduling/bookings',
    ],
  });
}


