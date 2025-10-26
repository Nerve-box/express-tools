import express from 'express';
import { definition, router as MCPRouter } from '@express-tools/mcp/src/index';
import * as PI from './pi/model';
import { calculate } from './pi/controller';

const server = MCPRouter(express(), {
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

server.listen(9001, () => {
  console.log('listening on port 9001');
});
