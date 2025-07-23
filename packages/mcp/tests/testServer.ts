import express from 'express';
import { definition, router as MCPRouter, validation } from '../src/index.ts';

const server = MCPRouter(express(), {
    serverInfo: {
        name: "brave_search",
        title: "Search the web with brave",
        version: "1.0.0"
    }
});

server.get(
    '/web/search', 
    definition({
        name: "brave_web_search",
        description:
            "Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. " +
            "Use this for broad information gathering, recent events, or when you need diverse web sources. " +
            "Supports pagination, content filtering, and freshness controls. " +
            "Maximum 20 results per request, with offset for pagination. ",
        inputSchema: {
            type: "object",
            properties: {
            query: {
                type: "string",
                description: "Search query (max 400 chars, 50 words)"
            },
            count: {
                type: "number",
                description: "Number of results (1-20, default 10)",
                default: 10
            },
            offset: {
                type: "number",
                description: "Pagination offset (max 9, default 0)",
                default: 0
            },
            },
            required: ["query"],
        },
    }),
    (req, res, next) => {
        console.log('Got called! Req:', req)

        return { content: [{ type: "text", text: `${req.params.query} is a type of bird.`}] };
    }
);

server.listen(9001, () => {
    console.log('listening on port 9001');
});
