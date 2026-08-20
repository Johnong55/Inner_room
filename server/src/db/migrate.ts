import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const file = fileURLToPath(new URL('./schema.sql', import.meta.url));
await pool.query(await readFile(file, 'utf8'));
await pool.end();
console.log('InnerRoom database schema is ready.');
