import { proxyRequest } from './_proxy.js';

export default async function handler(req, res) {
  const endpoint = '/dashboard/products' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  return proxyRequest(req, res, endpoint);
}
