# Express tools

*Bring your Express API to the modern web*

## Key features

The goal of these plugins is to make it dead simple to add protocol interop on existing applications, reducing new-framework fatigue.

- Plugin system to bridge [OpenAPI](./packages/oas/), [JSONRPC / MCP](), [GraphQL]() and others to your existing app.
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

** Version 0.1.0 - Concepts **

- [ ] Finish the conceptual design of common routers and align on global approach
- [ ] Add examples for common routers
- [ ] Write user stories to validate examples and design
- [ ] Survey developers (interest, most anticipated routers, pain points, etc.)

** Version 0.2.0 - Early router implementation **

- [ ] First draft of prioritized routers
  - [ ] OAS
  - [ ] JSON-RPC
  - [ ] GraphQL
  - [ ] Websockets
  - [ ] Event-driven
  - [ ] MCP
- [ ] First draft of core helpers
  - [ ] Graceful shutdown

** Version 0.3.0 - Validation **

- [ ] Build testing and deployment systems
- [ ] Establish bounds and rules (plugins per router, plugin compatibility, error handling)
- [ ] Documentation
- [ ] Types

** Initial launch **

## License

Apache-2.0 - 2025
