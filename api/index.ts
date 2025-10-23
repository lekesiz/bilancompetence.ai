import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const jwtSecret = process.env.JWT_SECRET || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

if (!jwtSecret) {
  console.error('Missing JWT_SECRET environment variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Helper: Get user by email
async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

// Helper: Create user
async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' = 'BENEFICIARY'
) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper: Create session
async function createSession(userId: string, refreshToken: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper: Update last login
async function updateUserLastLogin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the path from the request
  const path = req.url || '';
  
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
  // Default 404 for unknown endpoints
  // ============================================
  return res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path,
    available_endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
    ],
  });
}

