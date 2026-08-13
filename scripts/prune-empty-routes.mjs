import { rm } from 'node:fs/promises';
import path from 'node:path';

const out = path.join(process.cwd(), 'out');

await Promise.all(
  ['research', 'notes'].map((section) =>
    rm(path.join(out, section, '__empty__'), { recursive: true, force: true }),
  ),
);
