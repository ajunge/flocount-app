import { NextRequest } from 'next/server';
import { subscriber, CHANNEL_NAME, hasLocalRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only support SSE for local development with Redis
  if (!hasLocalRedis || !subscriber) {
    return new Response('SSE not available', { status: 503 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Subscribe to Redis channel
      subscriber!.subscribe(CHANNEL_NAME);

      // Handle messages from Redis
      subscriber!.on('message', (channel, message) => {
        if (channel === CHANNEL_NAME) {
          const data = `data: ${message}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      });

      // Send keepalive every 30 seconds
      const keepalive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepalive);
        subscriber!.unsubscribe(CHANNEL_NAME);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
