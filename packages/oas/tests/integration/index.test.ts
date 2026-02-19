import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import exampleSpec from '../static/exampleSpec.ts';
import { definition, documentation, response as OASResponse, router as OASRouter, validation } from '../../src/index.ts';

describe('Basic express router', () => {
  let server;
  let app;
  let port;

  beforeEach(() => {
    server = OASRouter(express(), exampleSpec);
    port = 10000 + Math.round(Math.random() * 10000);
  });

  afterEach(() => {
    if (app) app.close();
    server = null;
    app = null;
  });

  describe('with a non-augmented route', () => {
    beforeEach(async () => {
      server.get('/foo', (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should reply with a 200', async () => {
      const req = await fetch(`http://localhost:${port}/foo`);
      const response = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(response.data, 'Hello world');
    });
  });

  describe('with an augmented route, passing the method object', () => {
    beforeEach(async () => {
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

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should reply with a 200', async () => {
      const req = await fetch(`http://localhost:${port}/foo`);
      const response = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(response.data, 'Hello world');
    });
  });

  describe('with an augmented route, passing the route object', () => {
    beforeEach(async () => {
      server.get('/foo', definition({ get: {
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
      } }), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should reply with a 200', async () => {
      const req = await fetch(`http://localhost:${port}/foo`);
      const response = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(response.data, 'Hello world');
    });
  });

  describe('with validation', () => {
    beforeEach(async () => {
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

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should reply with a 200', async () => {
      const req = await fetch(`http://localhost:${port}/foo/test`);
      const response = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(response.data, 'Hello world');
    });
  });

  describe('with errored validation', () => {
    beforeEach(async () => {
      server.get('/foo/:id', definition({
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'number',
          },
        ],
        responses: {
          default: { schema: { $ref: '#/components/user' } },
        },
      }), validation(), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' });
        return next();
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should print a default html error page', async () => {
      const req = await fetch(`http://localhost:${port}/foo/test`);
      const response = await req?.text();

      assert.strictEqual(req.status, 400);
      assert.strictEqual(response, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Error: Request object does not match the specification for this route: [{&quot;error&quot;:&quot;Value is not a number&quot;,&quot;cursor&quot;:&quot;path.id&quot;}]</pre>
</body>
</html>
`);
    });
  });

  describe('description endpoint', () => {
    beforeEach(async () => {
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

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should return a valid openapi spec that includes definition overrides', async () => {
      const req = await fetch(`http://localhost:${port}/docs`);

      const response = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.deepStrictEqual(response.paths['/foo/{id}'], {
        get: {
          description: 'Get a User by Id',
          parameters: [
            {
              in: 'path',
              name: 'id',
              type: 'string',
              required: true,
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
      });
    });
  });

  describe('with response formatting on valid body', () => {
    beforeEach(async () => {
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
      }), OASResponse(), (req, res, next) => {
        res.status(200).json({ id: 'test', name: 'bar', age: 99 });
        return next();
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should reply with a 200', async () => {
      const req = await fetch(`http://localhost:${port}/foo/test`);

      const response = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.deepStrictEqual(response, { id: 'test', name: 'bar', age: 99 });
    });
  });

  describe('with response formatting on invalid body', () => {
    beforeEach(async () => {
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
      }), OASResponse(), (req, res, next) => {
        res.status(200).json({ id: 'test', name: 'bar', age: 'michael' });
        return next();
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should return an error page', async () => {
      const req = await fetch(`http://localhost:${port}/foo/test`);
      const response = await req?.text();

      assert.strictEqual(req.status, 422);
      assert.strictEqual(response, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Error: Response body does not match the specification for this route: [{&quot;error&quot;:&quot;Value is not an integer&quot;,&quot;cursor&quot;:&quot;:user.age&quot;}]</pre>
</body>
</html>
`);
    });
  });
});
