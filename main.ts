import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

// The local process driver supplies directory aliases for the sandbox mounts.
const input = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const documents = JSON.parse(readFileSync(join(input, 'cases.json'), 'utf8'));
const rendered = documents.map(({ markdown }) => parse(markdown));
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'html.json'), JSON.stringify(rendered));
