import express from 'express';
import { request } from 'undici';
import { definition, documentation, router as OASRouter, validation } from '../../src';

describe('Nested express router', () => {
  let server;
  let app;
  let root;
  let port;

  beforeEach(() => {
    port = 10000 + Math.round(Math.random() * 10000);
    
    root = express();
    server = OASRouter(express.Router(), { basePath: '/api', components: { user: {
      description: 'User model',
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        name: { type: 'string' },
        age: { type: 'integer' },
      },
    } } });

    root.use('/api', server);
  });

  afterEach(() => {
    if (app) app.close();
    server = null;
    app = null;
    root = null;
  });

  describe('with a non-augmented route', () => {
    beforeEach((done) => {
      server.get('/foo', (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      server.scan();
      app = root.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200 when calling with the basepath', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/foo`);
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });

    test('should reply with a 404 when calling without the basepath', async () => {
      const {
        statusCode,
      } = await request(`http://localhost:${port}/foo`);

      expect(statusCode).toEqual(404);
    });
  });

  describe('with an augmented route, passing the method object', () => {
    beforeEach((done) => {
      server.get('/foo', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      server.scan();
      app = root.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/foo`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });
  describe('with validation', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), validation(), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      server.scan();
      app = root.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/foo/test`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });
  describe('description endpoint', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      server.get('/docs', documentation());

      server.scan();
      app = root.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should return a valid openapi spec that includes definition overrides', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/docs`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response).toEqual({
        basePath: '/api',
        components: {
          user: {
            description: 'User model',
            properties: {
              age: {
                type: 'integer',
              },
              id: {
                required: true,
                type: 'string',
              },
              name: {
                type: 'string',
              },
            },
            type: 'object',
          },
        },
        info: {},
        openapi: '3.1.0',
        paths: {
          '/foo/{id}': {
            get: {
              description: 'Get a User by Id',
              parameters: [
                {
                  in: 'path',
                  name: 'id',
                  required: true,
                  type: 'string',
                },
              ],
              responses: {
                default: {
                  schema: {
                    $ref: '#/components/user',
                  },
                },
              },
            },
          },
        },
        servers: [],
        tags: [],

      });
    });
  });
});

describe('Flat express router', () => {
  let server;
  let app;
  const port = 10000 + Math.round(Math.random() * 10000);

  beforeEach(() => {
    server = OASRouter(express(), { basePath: '/api', components: { } });
  });

  afterEach(() => {
    if (app) app.close();
  });

  describe('with a non-augmented route', () => {
    beforeEach((done) => {
      server.get('/api/foo', (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200 when calling with the basepath', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/foo`);
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });

    test('should reply with a 404 when calling without the basepath', async () => {
      const {
        statusCode,
      } = await request(`http://localhost:${port}/foo`);

      expect(statusCode).toEqual(404);
    });
  });

  describe('with an augmented route, passing the method object', () => {
    beforeEach((done) => {
      server.get('/api/foo', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/foo`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });
  describe('with validation', () => {
    beforeEach((done) => {
      server.get('/api/foo/:id', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), validation(), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/api/foo/test`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });

  describe('description endpoint', () => {
    beforeEach((done) => {
      server.get('/api/foo/bar/:id', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      server.get('/docs', documentation());

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should return a valid openapi spec that includes definition overrides', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/docs`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response).toEqual({
        basePath: '/api',
        components: {},
        info: {},
        openapi: '3.1.0',
        paths: {
          '/foo/bar/{id}': {
            get: {
              description: 'Get a User by Id',
              parameters: [
                {
                  in: 'path',
                  name: 'id',
                  required: true,
                  type: 'string',
                },
              ],
              responses: {
                default: {
                  schema: {
                    $ref: '#/components/user',
                  },
                },
              },
            },
          },
        },
        servers: [],
        tags: [],
      },
      );
    });
  });
});
