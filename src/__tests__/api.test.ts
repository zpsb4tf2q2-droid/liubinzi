import http from 'http';
import type { RequestOptions, Server } from 'http';
import type { AddressInfo } from 'net';
import { createServer } from '../index';
import { DEMO_SESSION_TOKEN } from '../lib/session';

interface ApiResponse {
  statusCode: number;
  body: string;
}

interface ApiRequestOptions extends RequestOptions {
  body?: string;
}

const listen = (server: Server): Promise<AddressInfo> =>
  new Promise((resolve, reject) => {
    const onError = (error: Error) => {
      server.removeListener('listening', onListening);
      reject(error);
    };

    const onListening = () => {
      server.removeListener('error', onError);
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Unable to determine server address'));
        return;
      }

      resolve(address);
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(0, '127.0.0.1');
  });

const closeServer = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const makeRequest = (options: ApiRequestOptions): Promise<ApiResponse> =>
  new Promise((resolve, reject) => {
    const request = http.request(options, (response) => {
      let data = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve({
          statusCode: response.statusCode ?? 0,
          body: data,
        });
      });
    });

    request.on('error', reject);

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });

describe('API routes', () => {
  let server: Server | null = null;

  afterEach(async () => {
    if (server) {
      await closeServer(server);
      server = null;
    }
  });

  it('GET /api/health responds with service status data', async () => {
    server = createServer();
    const address = await listen(server);

    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: address.port,
      method: 'GET',
      path: '/api/health',
    });

    expect(response.statusCode).toBe(200);

    const payload = JSON.parse(response.body) as {
      status: string;
      commitHash: string;
      timestamp: string;
    };

    expect(payload.status).toBe('ok');
    expect(typeof payload.commitHash).toBe('string');
    expect(payload.commitHash.length).toBeGreaterThan(0);
    expect(Number.isNaN(new Date(payload.timestamp).getTime())).toBe(false);
  });

  it('GET /api/me returns 401 when the request is unauthenticated', async () => {
    server = createServer();
    const address = await listen(server);

    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: address.port,
      method: 'GET',
      path: '/api/me',
    });

    expect(response.statusCode).toBe(401);

    const payload = JSON.parse(response.body) as {
      error: {
        message: string;
        statusCode: number;
      };
    };

    expect(payload.error.message).toBe('Unauthorized');
    expect(payload.error.statusCode).toBe(401);
  });

  it('GET /api/me returns the authenticated user when a valid token is provided', async () => {
    server = createServer();
    const address = await listen(server);

    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: address.port,
      method: 'GET',
      path: '/api/me',
      headers: {
        Authorization: `Bearer ${DEMO_SESSION_TOKEN}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const payload = JSON.parse(response.body) as {
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    };

    expect(payload.user).toEqual({
      id: 'user-1',
      email: 'demo.user@example.com',
      name: 'Demo User',
      role: 'member',
    });
  });
});
