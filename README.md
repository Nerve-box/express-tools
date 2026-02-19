# Express tools

*Bring your Express API to the modern web*

## Key features

The goal of these plugins is to make it dead simple to add protocol interop on existing applications, reducing new-framework fatigue.

- Plugin system to bridge [OpenAPI](./packages/oas/), [JSONRPC / MCP](./packages/mcp/), [GraphQL]() and others to your existing app.
- Auto-generated documentation endpoints.
- Core utils for graceful shutdowns, healthcheck endpoints, etc.

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## Special thanks

The concept, which is not new and has been attempted a few times- even by myself has been thouroughly battle-tested over the last decade.

I want to give credit to Fastify and other frameworks for the inspiration.

A very special shoutout to [@drawm](https://github.com/drawm), [@mats852](https://github.com/mats852), [@emeraldsanto](https://github.com/emeraldsanto) and the many others that helped me write the early iterations of this.

## Roadmap

** Version 0.1.0 - Early router implementation **
- [ ] First draft of selected routers 
  - [X] OAS
  - [ ] JSON-RPC
  - [ ] GraphQL
  - [ ] Websockets
  - [X] MCP
- [ ] Add examples for common routers
  - [X] OAS
  - [ ] JSON-RPC
  - [ ] GraphQL
  - [ ] Websockets
  - [X] MCP
- [ ] Beta testing

** Version 0.2.0 - Early tooling **

- [ ] First draft of core helpers
  - [ ] Graceful shutdown


## License

Apache-2.0 - 2026
