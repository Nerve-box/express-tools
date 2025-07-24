import {PICalc} from '../utils/math.ts';

export function calculate({decimals}) {
    return PICalc(Number(decimals));
}

export const MCPDefinition = {
    name: "pi_calc",
    description: `Computes the irrational number PI up to a given amount of digits. `,
    inputSchema: {
        type: "object",
        properties: {
        decimals: {
            type: "number",
            description: "The amount of decimals to compute. (min 3, max 1000, default 10)",
            maximum: 1000,
            minimum: 3,
            default: 10,
            },
        },
        required: ["decimals"],
    },
    outputSchema: {
        type: "object",
        properties: {
            type: { type: "text" },
            text: { type: "text" }
        }
    },
    handler: calculate,
};
