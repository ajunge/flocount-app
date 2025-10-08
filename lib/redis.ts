import Redis from 'ioredis';

const CHANNEL_NAME = 'counters-updates';

// Check if Vercel KV is available (production)
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Check if local Redis is available (development)
const hasLocalRedis = process.env.REDIS_URL;

// Create Redis clients for pub/sub (only for local Redis)
let publisher: Redis | null = null;
let subscriber: Redis | null = null;

if (hasLocalRedis && !hasKV) {
  publisher = new Redis(process.env.REDIS_URL!);
  subscriber = new Redis(process.env.REDIS_URL!);
}

export { publisher, subscriber, CHANNEL_NAME, hasLocalRedis };
