import express from 'express'
import { request } from 'undici'
import { definition, router as OASRouter, validation } from '../../src'

describe('Basic express router', () => {
  let server
  let app
  const port = 10000 + Math.round(Math.random() * 10000)

  beforeEach(() => {
    server = OASRouter(express(), {})
  })

  afterEach(() => {
    if (app) app.close()
  })

  describe('with a non-augmented route', () => {
    beforeEach((done) => {
      server.get('/foo', (req, res, next) => {
        res.status(200).json({ data: 'Hello world' })
        return next()
      })

      app = server.listen(port, (err) => {
        if (err) throw err
        done()
      })
    })

    test('should reply normally', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo`)
      const response = await body.json()

      expect(statusCode).toEqual(200)
      expect(response.data).toEqual('Hello world')
    })
  })

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
          default: { schema: { $ref: '#/components/schemas/user' } },
        },
      }), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' })
        return next()
      })

      app = server.listen(port, (err) => {
        if (err) throw err
        done()
      })
    })

    test('should reply normally', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo`)
      const response = await body.json()

      expect(statusCode).toEqual(200)
      expect(response.data).toEqual('Hello world')
    })
  })

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
          default: { schema: { $ref: '#/components/schemas/user' } },
        },
      }), validation(), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' })
        return next()
      })

      app = server.listen(port, (err) => {
        if (err) throw err
        done()
      })
    })

    test('should reply normally', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo/test`)
      const response = await body.json()

      expect(statusCode).toEqual(200)
      expect(response.data).toEqual('Hello world')
    })
  })

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
          default: { schema: { $ref: '#/components/schemas/user' } },
        },
      }), validation(), (req, res, next) => {
        res.status(200).json({ data: 'Hello world' })
        return next()
      })

      app = server.listen(port, (err) => {
        if (err) throw err
        done()
      })
    })

    test('should print a default html error page', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/foo/test`)
      const response = await body.text()

      expect(statusCode).toEqual(400)
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
`)
    })
  })
})
