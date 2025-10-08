import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

const CHANNEL_NAME = 'counters-updates';

// Check if Vercel KV is available (production)
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Check if local Redis is available (development)
// Only use local Redis if REDIS_URL is set AND we're NOT using Vercel KV
const hasLocalRedis = process.env.REDIS_URL && !hasKV;

// Create Redis clients for pub/sub
let publisher: Redis | UpstashRedis | null = null;
let subscriber: Redis | null = null;

if (hasKV) {
  // Use Upstash Redis for production
  publisher = new UpstashRedis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  // Note: Upstash doesn't support traditional pub/sub over REST, will use polling instead
} else if (hasLocalRedis) {
  // Use local Redis for development
  publisher = new Redis(process.env.REDIS_URL!);
  subscriber = new Redis(process.env.REDIS_URL!);
}

export { publisher, subscriber, CHANNEL_NAME, hasLocalRedis, hasKV };
