// Prepares a release: sets the library version and turns "## Unreleased" in CHANGELOG.md into the version heading.
// Usage: npm run version:patch | version:minor | version:major, or npm run release:prepare -- 1.2.3
import { readFileSync, writeFileSync } from 'node:fs';

const PKG = 'projects/ngx-gallery-media/package.json';
const LOG = 'CHANGELOG.md';
const arg = process.argv[2];
const fail = (msg) => {
  console.error(`release: ${msg}`);
  process.exit(1);
};

if (!arg) fail('give patch, minor, major or a version such as 1.2.3');
const pkg = JSON.parse(readFileSync(PKG, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
const next =
  arg === 'patch'
    ? `${major}.${minor}.${patch + 1}`
    : arg === 'minor'
      ? `${major}.${minor + 1}.0`
      : arg === 'major'
        ? `${major + 1}.0.0`
        : arg;
if (!/^\d+\.\d+\.\d+$/.test(next)) fail(`"${next}" is not a version (x.y.z)`);
const newer = next.split('.').map(Number);
const isNewer = newer[0] !== major ? newer[0] > major : newer[1] !== minor ? newer[1] > minor : newer[2] > patch;
if (!isNewer) fail(`${next} is not newer than ${pkg.version}`);

const log = readFileSync(LOG, 'utf8');
const match = log.match(/^## Unreleased\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
if (!match || !match[1].trim()) fail('add the changes under "## Unreleased" in CHANGELOG.md first');
const today = new Date().toISOString().slice(0, 10);
writeFileSync(LOG, log.replace(/^## Unreleased\s*$/m, `## ${next} (${today})`));
pkg.version = next;
writeFileSync(PKG, `${JSON.stringify(pkg, null, 2)}\n`);
// The workspace version follows the library, so `npm run` shows the version being worked on.
const root = JSON.parse(readFileSync('package.json', 'utf8'));
root.version = next;
writeFileSync('package.json', `${JSON.stringify(root, null, 2)}\n`);

console.log(`Version ${next} prepared. Next:
  npm run check
  git add package.json ${PKG} ${LOG}
  git commit -m "chore(release): ${next}"
  git tag v${next}
  git push origin main v${next}`);
