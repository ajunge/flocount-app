import { NextRequest } from 'next/server';
import Redis from 'ioredis';
import { CHANNEL_NAME, hasLocalRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only support SSE for local development with Redis
  if (!hasLocalRedis) {
    return new Response('SSE not available', { status: 503 });
  }

  // Create a new subscriber for this connection
  const subscriber = new Redis(process.env.REDIS_URL!);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      // Subscribe to Redis channel
      await subscriber.subscribe(CHANNEL_NAME);

      // Send initial connection message so client knows SSE is working
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Handle messages from Redis
      const messageHandler = (channel: string, message: string) => {
        if (channel === CHANNEL_NAME && !isClosed) {
          try {
            const data = `data: ${message}\n\n`;
            controller.enqueue(encoder.encode(data));
          } catch (e) {
            console.error('Error enqueueing message:', e);
          }
        }
      };

      subscriber.on('message', messageHandler);

      // Send keepalive every 30 seconds
      const keepalive = setInterval(() => {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(': keepalive\n\n'));
          } catch (e) {
            clearInterval(keepalive);
          }
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', async () => {
        isClosed = true;
        clearInterval(keepalive);
        subscriber.off('message', messageHandler);
        await subscriber.unsubscribe(CHANNEL_NAME);
        await subscriber.quit();
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
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
