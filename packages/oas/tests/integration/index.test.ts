import express from 'express';
import exampleSpec from '../static/exampleSpec';
import { request } from 'undici';
import { definition, documentation, response as OASResponse, router as OASRouter, validation } from '../../src';

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

  describe('with an augmented route, passing the route object', () => {
    beforeEach((done) => {
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
      } = await request(`http://localhost:${port}/foo/test`);
      const response = await body.json();

      expect(statusCode).toEqual(200);
      expect(response.data).toEqual('Hello world');
    });
  });

  describe('with errored validation', () => {
    beforeEach((done) => {
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
<pre>Error: Request object does not match the specification for this route: [{&quot;error&quot;:&quot;Value is not a number&quot;,&quot;cursor&quot;:&quot;path.id&quot;}]</pre>
</body>
</html>
`);
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
      expect(response.paths['/foo/{id}']).toEqual({
        get: {
          description: 'Get a User by Id',
          parameters: [
            {
              in: 'path',
              name: 'id',
              type: 'string',
              required: true
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
      }), OASResponse(), (req, res, next) => {
        res.status(200).json({ id: 'test', name: 'bar', age: 99 });
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
      expect(response).toEqual({ id: 'test', name: 'bar', age: 99 });
    });
  });

  describe('with response formatting on invalid body', () => {
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
      }), OASResponse(), (req, res, next) => {
        res.status(200).json({ id: 'test', name: 'bar', age: 'michael' });
        return next();
      });

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
<pre>Error: Response body does not match the specification for this route: [{&quot;error&quot;:&quot;Value is not an integer&quot;,&quot;cursor&quot;:&quot;:user.age&quot;}]</pre>
</body>
</html>
`);
    });
  });
});
