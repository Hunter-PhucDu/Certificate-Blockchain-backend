// Rate limiting constants
export const RATE_LIMIT_TTL = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX = 100; // maximum 100 requests per TTL

// Subdomain constants
export const SYSTEM_SUBDOMAINS = ['www', 'api', 'admin'];
export const SUBDOMAIN_REGEX = /^[a-z0-9-]+$/;
