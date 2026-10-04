# Releasing ngx-gallery-media (step by step)

Public package on npmjs.com: `ngx-gallery-media`. Follow the part that matches what you are doing:

- [A. One-time setup](#a-one-time-setup) (once)
- [B. First release: 1.0.0](#b-first-release-100) (once)
- [C. Every next release: 1.0.1, 1.1.0, 2.0.0](#c-every-next-release)
- [D. Updating the apps](#d-updating-the-apps)
- [E. Something went wrong](#e-something-went-wrong)
- [F. Things to remember](#f-things-to-remember)

npm rules this guide follows (since November and December 2025): classic tokens no longer exist; `npm login`
gives a 2-hour session and publishing from your computer always asks for two-factor authentication; tokens that can
publish are granular tokens that expire after at most 90 days, and a CI token needs the **Bypass 2FA** option.

## A. One-time setup

1. **npm account**: sign in at https://www.npmjs.com with the account that will own the package. Account >
   Two-Factor Authentication: on (authenticator app or security key).
2. **Node 22.17** on your computer (`node -v`). In the repository: `npm ci`.
3. **Push the repository** to Bitbucket (empty repository named `ngx-gallery-media`):

   ```bash
   git remote add origin git@bitbucket.org:<workspace>/ngx-gallery-media.git
   git push -u origin main
   ```

4. **Pipelines**: Repository settings > Pipelines > Settings: enable. The first push runs the check on `main`.
5. **CI publish token** (needed from release 1.0.1 on; can wait until then):
   1. npmjs.com > your avatar > Access Tokens > Generate New Token > **Granular Access Token**.
   2. Name `bitbucket-ngx-gallery-media`; Expiration: 90 days (the maximum for publishing tokens).
   3. Packages and scopes: Read and write, **Only select packages**: `ngx-gallery-media` (after 1.0.0 exists).
   4. Tick **Bypass two-factor authentication (2FA)**; without it every CI publish fails with `EOTP`.
   5. Bitbucket: Repository settings > Pipelines > Repository variables > Add `NPM_TOKEN` = the token,
      **Secured** ticked.
   6. Put a reminder in your calendar 80 days ahead: the token expires and publishing stops working (see E).
6. **Second owner** (so the package never depends on one person): after 1.0.0,
   `npm owner add <npm-user> ngx-gallery-media`.

## B. First release: 1.0.0

Publish the delivered file `ngx-gallery-media-1.0.0.tgz` exactly as it is. Apps that already pin 1.0.0 in their
lockfiles expect this file's checksum, so `npm ci` in those apps only works with these exact bytes. Do not rebuild
it.

```bash
# 1. Check the file is the delivered one (both lines must match)
node -e "const c=require('crypto'),f=require('fs');console.log('sha512-'+c.createHash('sha512').update(f.readFileSync('ngx-gallery-media-1.0.0.tgz')).digest('base64'))"
#    sha512-buaanWh88Uafm8j/lrjngyQoZ7oG1jlEyiZBe0vhxnuNsIY2/EUCfcm/4lUv3N3b8adbmroEdthkK6kEZdBHnQ==

# 2. Sign in (browser opens; 2-hour session) and check who you are
npm login
npm whoami

# 3. Publish the file (asks for your 2FA code or security key)
npm publish ngx-gallery-media-1.0.0.tgz --access public

# 4. Check what npm holds
npm view ngx-gallery-media version dist.integrity
#    1.0.0
#    sha512-buaanWh88Uafm8j/lrjngyQoZ7oG1jlEyiZBe0vhxnuNsIY2/EUCfcm/4lUv3N3b8adbmroEdthkK6kEZdBHnQ==
```

Then mark the release in the repository (the tag pipeline sees 1.0.0 is already on npm and does not publish again):

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then the apps: their `npm ci` now downloads 1.0.0 from npm.

## C. Every next release

Which number:

| What changed                                                       | Run                                | Example        |
| ------------------------------------------------------------------ | ---------------------------------- | -------------- |
| Bug fix, docs, inside change; nobody's code has to change          | `npm run release:prepare -- patch` | 1.0.0 to 1.0.1 |
| New option, label, CSS variable or event; old use still works      | `npm run release:prepare -- minor` | 1.0.1 to 1.1.0 |
| Renamed or removed option, changed default, new Angular major only | `npm run release:prepare -- major` | 1.1.0 to 2.0.0 |

Steps:

1. Work on a branch (`fix/preview-swipe`), commit with conventional messages, open a pull request; the pipeline
   must be green; merge to `main`.
2. While working, write what changed under `## Unreleased` at the top of `CHANGELOG.md`:

   ```markdown
   ## Unreleased

   - Fix: a swipe in the preview no longer opens a link.
   ```

3. On an up-to-date `main`:

   ```bash
   git checkout main && git pull
   npm run release:prepare -- patch      # or minor / major
   ```

   It sets the version in `projects/ngx-gallery-media/package.json`, renames `## Unreleased` to
   `## 1.0.1 (date)`, and stops with a message if something is missing (no changelog entry, version not newer).

4. Run the commands it prints:

   ```bash
   npm run check
   git add projects/ngx-gallery-media/package.json CHANGELOG.md
   git commit -m "chore(release): 1.0.1"
   git tag v1.0.1
   git push origin main v1.0.1
   ```

5. The tag pipeline runs the check, makes sure the tag equals the package version, and publishes with `NPM_TOKEN`.
   Watch it in Bitbucket > Pipelines (about 5 minutes).
6. Check: `npm view ngx-gallery-media version` prints the new version.
7. Update the apps (D).

Without the pipeline (or if npm stops accepting CI tokens), publish from your computer after step 4:

```bash
npm login
npm run build
cd dist/ngx-gallery-media && npm publish --access public
```

Pre-releases, to try a version in the apps before everyone gets it: set the version by hand to `1.1.0-rc.1`, then
`cd dist/ngx-gallery-media && npm publish --tag next --access public`. `npm install ngx-gallery-media` keeps giving
the last normal version; `npm install ngx-gallery-media@next` gives the pre-release.

## D. Updating the apps

In each app (apps that share pages or a design move together, same version):

```bash
npm install ngx-gallery-media@1.0.1 --save-exact --legacy-peer-deps
npm run lint && npm run typecheck:all && npm run test:ci && npm run build:prod
git add package.json package-lock.json
git commit -m "chore(deps): ngx-gallery-media 1.0.1"
```

Look at a page with pictures and a video, and the preview, at 1440 px and 375 px. For a major version, read its
changelog first; the steps for your code are listed there.

## E. Something went wrong

| Message or problem                                               | Cause                                                   | Fix                                                                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E403 ... You do not have permission to publish`                 | Not signed in, wrong account, or the name is taken      | `npm whoami`; `npm login` with the owner account; `npm view ngx-gallery-media` to see the owner.                                                                                             |
| `EOTP` or "requires two-factor authentication" (local)           | 2FA code needed                                         | Run again and enter the code; or `npm publish --otp 123456`.                                                                                                                                 |
| `EOTP` in the pipeline                                           | Token created without Bypass 2FA                        | New token with **Bypass two-factor authentication** ticked; replace `NPM_TOKEN`.                                                                                                             |
| `E401` / `ENEEDAUTH` in the pipeline                             | Token expired (90 days) or deleted                      | New token (A.5), replace `NPM_TOKEN`, then re-run the failed pipeline.                                                                                                                       |
| `E403 ... cannot publish over the previously published versions` | That version is already on npm                          | Versions are permanent: prepare the next patch (`release:prepare -- patch`).                                                                                                                 |
| Pipeline: `Tag v1.0.2 does not match package 1.0.1`              | Tagged without running `release:prepare`, or wrong tag  | `git push --delete origin v1.0.2 && git tag -d v1.0.2`; prepare the version; tag again.                                                                                                      |
| Pipeline: `already on npm; nothing to publish`                   | The tag points at a version already published           | Nothing to do; this is how v1.0.0 behaves after B.                                                                                                                                           |
| Apps: `EINTEGRITY` on `npm ci`                                   | npm holds different bytes than the app lockfile expects | Only after a 1.0.0 that was rebuilt instead of publishing the delivered file. Run `npm install ngx-gallery-media@1.0.0 --save-exact --legacy-peer-deps` in each app and commit the lockfile. |
| Apps: `ERESOLVE` peer dependencies                               | The apps' other packages, not this one                  | Use `--legacy-peer-deps`, as the app pipelines do.                                                                                                                                           |
| Apps: `404 Not Found - ngx-gallery-media`                        | Not published yet, or a typo in the version             | `npm view ngx-gallery-media versions`.                                                                                                                                                       |
| A released version is broken                                     | -                                                       | Publish a fixed patch at once. Then `npm deprecate ngx-gallery-media@1.0.1 "Broken preview, use 1.0.2"`.                                                                                     |
| Published by mistake, minutes ago                                | -                                                       | `npm unpublish ngx-gallery-media@1.0.1` works within 72 hours if no other package depends on it; the number can never be used again. Prefer deprecate.                                       |
| Tests do not start: `No binary for ChromeHeadless`               | Chrome not found                                        | Set `CHROME_BIN` to Chrome or Chromium (`export CHROME_BIN=/usr/bin/chromium`).                                                                                                              |

## F. Things to remember

- A version number is published once, for ever. Never reuse or overwrite one; publish the next.
- Never put a token in a file in the repository. `.npmrc` is ignored by git on purpose.
- The token for the pipeline lives only in the Bitbucket secured variable and expires after at most 90 days.
- `npm login` sessions last 2 hours; sign in again when a publish says you are not authorised.
- Admin and client always move to the same version together.
- Keep `CHANGELOG.md` true: it is what the apps read before updating.
