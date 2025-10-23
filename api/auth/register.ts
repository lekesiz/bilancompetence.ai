import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    });
  }

  try {
    // Extract request body
    const { email, password, full_name, role } = req.body;

    // Log request for debugging
    console.log('Registration request received:', {
      email,
      full_name,
      role,
      timestamp: new Date().toISOString(),
    });

    // Return 501 Not Implemented - Backend integration in progress
    return res.status(501).json({
      status: 'error',
      message: 'Backend integration in progress - registration endpoint not yet implemented',
      debug: {
        received: { email, full_name, role },
        timestamp: new Date().toISOString(),
        note: 'Full Supabase integration coming soon',
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
}

