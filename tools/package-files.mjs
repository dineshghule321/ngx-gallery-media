// Copies the files that live outside the library project into the built package.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const dist = 'dist/ngx-gallery-media';
const files = [
  ['LICENSE', 'LICENSE'],
  ['CHANGELOG.md', 'CHANGELOG.md'],
  ['docs/USAGE.md', 'docs/USAGE.md'],
];

if (!existsSync(join(dist, 'package.json'))) {
  console.error(`${dist} is missing: build the library first.`);
  process.exit(1);
}
for (const [from, to] of files) {
  const target = join(dist, to);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(from, target);
  console.log(`copied ${from} -> ${target}`);
}
