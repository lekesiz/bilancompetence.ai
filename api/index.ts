import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the path from the request
  const path = req.url || '';
  
  console.log('API Request:', {
    method: req.method,
    path,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  // Handle /api/auth/register
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

  // Default 404 for unknown endpoints
  return res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path,
    available_endpoints: ['/api/auth/register'],
  });
}

