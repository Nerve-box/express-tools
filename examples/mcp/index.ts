// import express from 'express';
import express from 'express';
import { definition, router as MCPRouter } from '@express-tools/mcp/src/index.ts';
import * as PI from './pi/model.ts';
import { calculate } from './pi/controller.ts';

const server = express();
server.use(express.json());

const MCP = MCPRouter(server, {
  serverInfo: {
    name: 'math_formulas',
    title: 'Perform complex mathematical equations',
    version: '1.0.0',
  },
});

server.get(
  '/pi/calculate',
  definition(PI.MCPDefinition),
  calculate,
);

MCP.compile();

server.listen(9001, () => {
  console.log('listening on port 9001');
});
