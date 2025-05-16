import express from 'express';
import { request } from 'undici';
import { definition, documentation, response as OASResponse, router as OASRouter, validation } from '../../src';

describe('Basic express router', () => {
  let server;
  let app;
  const port = 10000 + Math.round(Math.random() * 10000);

  beforeEach(() => {
    server = OASRouter(express(), {
      definitions: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', required: true },
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
      },
    });
  });

  afterEach(() => {
    if (app) app.close();
  });

  describe('with a non-augmented route', () => {
    beforeEach((done) => {
      server.get('/foo', (req, res, next) => {
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
      } = await request(`http://localhost:${port}/foo`);
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });

  describe('with an augmented route', () => {
    beforeEach((done) => {
      server.get('/foo', definition({
        method: 'get',
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: 'user' } },
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
      } = await request(`http://localhost:${port}/foo`);
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });

  describe('with validation', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        method: 'get',
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: 'user' } },
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
      } = await request(`http://localhost:${port}/foo/test`);
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });

  describe('with errored validation', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        method: 'get',
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'number',
          },
        ],
        responses: {
          default: { schema: { $ref: 'user' } },
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

    test('should print a default html error page', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo/test`);
      const response = await body.text();

      expect(statusCode).toEqual(400);
      expect(response).toEqual(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Error: [{&quot;error&quot;:&quot;Value is not a number&quot;,&quot;cursor&quot;:&quot;path.id&quot;}]</pre>
</body>
</html>
`);
    });
  });

  describe('description endpoint', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        method: 'get',
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
          default: { schema: { $ref: 'user' } },
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

    test('should return a valid openapi spec', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/docs`);

      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response).toEqual({ openapi: '3.1.0', info: { description: 'The <project_name> API', version: '0.0.0', title: '<project_name> API' }, servers: [{ url: '0.0.0.0' }], basePath: '/', schemes: ['http', 'https'], consumes: ['application/json', 'application/x-www-form-urlencoded'], produces: ['application/json'], paths: { '/foo/{id}': { get: { path: '/foo/:id', method: 'get', parameters: [{ name: 'id', in: 'path', type: 'string', required: true }], description: 'Get a User by Id', operationId: 'get /foo/:id', responses: { 200: { schema: { type: 'object', properties: { meta: { type: 'object' } } } }, default: { description: 'Errors', type: 'object', required: ['errors'], properties: { errors: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', format: 'int64', example: '235711131719' }, status: { type: 'string' }, code: { type: 'string' }, title: { type: 'string' }, detail: { type: 'string' }, source: { type: 'object', properties: { pointer: { type: 'string' }, parameter: { type: 'string' } } }, meta: { type: 'object', additionalProperties: true } } } } } } } } } }, definitions: {} });
    });
  });

  describe('with response formatting on valid body', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        method: 'get',
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: 'user' } },
        },
      }), OASResponse((req, res, next) => {
        res.status(200).json({ id: 'test', name: 'bar', age: 99 });
        return next();
      }));

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should reply with a 200', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo/test`);
      //const raw = await body.text();
      //console.log('RAW', raw)
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response).toEqual({ id: 'test', name: 'bar', age: 99 });
    });
  });

  describe('with response formatting on invalid body', () => {
    beforeEach((done) => {
      server.get('/foo/:id', definition({
        method: 'get',
        description: 'Get a User by Id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            type: 'string',
          },
        ],
        responses: {
          default: { schema: { $ref: 'user' } },
        },
      }), OASResponse((req, res, next) => {
        res.status(200).json({ id: 'test', name: 'bar', age: '99' });
        return next();
      }));

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should return an error page', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo/test`);
      const response = await body.text();

      expect(statusCode).toEqual(422);
      expect(response).toEqual(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Error: [{&quot;error&quot;:&quot;Value is not a number&quot;,&quot;cursor&quot;:&quot;path.id&quot;}]</pre>
</body>
</html>
`);
    });
  });
});
