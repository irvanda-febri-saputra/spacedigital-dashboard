import { proxyRequest } from '../_proxy.js';

export default async function handler(req, res) {
  // Get the full path from URL
  // Example: /api/dashboard/products/123 → /dashboard/products/123
  const path = req.url.replace(/^\/api/, '');
  
  return proxyRequest(req, res, path);
}
