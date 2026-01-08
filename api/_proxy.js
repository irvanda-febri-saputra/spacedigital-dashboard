// Shared proxy utility for all API routes
export async function proxyRequest(req, res, endpoint) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
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

  try {
    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL || 'https://spacedigital.czel.me/api';
    const apiSecret = process.env.API_SECRET;

    // Get authorization token from request
    const token = req.headers.authorization;

    // Build request headers
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    // Add API secret for extra security
    if (apiSecret) {
      headers['X-API-Secret'] = apiSecret;
    }

    // Build request options
    const options = {
      method: req.method,
      headers,
    };

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // Proxy to backend
    const url = `${backendUrl}${endpoint}`;
    console.log(`[Proxy] ${req.method} ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();

    // Return response with same status
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('[Proxy Error]', error);
    return res.status(500).json({
      success: false,
      error: 'Proxy error',
      message: error.message
    });
  }
}
