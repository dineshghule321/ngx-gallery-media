# Releasing ngx-gallery-media (step by step)

Public package on npmjs.com: `ngx-gallery-media`. Follow the part that matches what you are doing:

- [A. One-time setup](#a-one-time-setup) (once)
- [B. First release: 1.0.0](#b-first-release-100) (once)
- [C. Every next release: 1.0.1, 1.1.0, 2.0.0](#c-every-next-release)
- [D. Updating the apps](#d-updating-the-apps)
- [E. Something went wrong](#e-something-went-wrong)
- [F. Things to remember](#f-things-to-remember)

The repository is a private GitHub repository; the package is public on npm. Releases after 1.0.0 publish from
GitHub Actions with **npm trusted publishing**: npm checks that the publish comes from your repository's
`release.yml` workflow, so no npm token is created, stored or renewed. From your own computer, `npm login` gives a
2-hour session and publishing always asks for two-factor authentication.

## A. One-time setup

1. **npm account**: sign in at https://www.npmjs.com with the account that will own the package. Account >
   Two-Factor Authentication: on (authenticator app or security key).
2. **Node 22.17** on your computer (`node -v`). In the repository: `npm ci`.
3. **GitHub repository**: on github.com create a **private** repository named `ngx-gallery-media`, empty (no
   README, no licence, no .gitignore). Then push:

   ```bash
   git remote add origin git@github.com:<your-github-name>/ngx-gallery-media.git
   git push -u origin main
   ```

4. **Actions**: they are on by default. The push runs the `CI` workflow (repository > Actions); it must be green.
   A private repository on GitHub Free has 2,000 Actions minutes a month; one run takes about 5 minutes.
5. **Trusted publisher** (after the first release, B, because the package must exist on npm):
   1. npmjs.com > `ngx-gallery-media` > Settings > **Trusted publishing** > GitHub Actions.
   2. Organization or user: `<your-github-name>`; Repository: `ngx-gallery-media`; Workflow filename:
      `release.yml`; Environment: leave empty.
   3. Save. From now on only that workflow can publish new versions; no token exists to leak or expire.
   4. Recommended, same page: Publishing access > **Require two-factor authentication and disallow tokens**. Trusted
      publishing still works; stolen tokens cannot publish.
6. **Second owner** (so the package never depends on one person): `npm owner add <npm-user> ngx-gallery-media`.
7. **Protect main** (optional, needs GitHub Pro or a public repository): Settings > Branches > rule for `main`,
   require the `CI` check before merging. On GitHub Free with a private repository, keep the habit of merging pull
   requests only when `CI` is green.

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

Then mark the release in the repository (the `Release` workflow sees 1.0.0 is already on npm and does not publish
again), and do A.5:

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

1. Work on a branch (`fix/preview-swipe`), commit with conventional messages, open a pull request on GitHub; the
   `CI` check must be green; merge to `main`.
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

5. The `Release` workflow (repository > Actions) runs the check, makes sure the tag equals the package version, and
   publishes through trusted publishing (about 5 minutes).
6. Check: `npm view ngx-gallery-media version` prints the new version.
7. Update the apps (D).

If GitHub Actions is not available, publish from your computer after step 4 (2FA asked):

```bash
npm login
npm run build
cd dist/ngx-gallery-media && npm publish --access public
```

Pre-releases, to try a version in the apps before everyone gets it: `npm run release:prepare -- 1.1.0-rc.1`
is refused (only x.y.z), so set `"version": "1.1.0-rc.1"` in `projects/ngx-gallery-media/package.json` by hand,
commit, tag `v1.1.0-rc.1` and push the tag. The workflow publishes it under the `next` tag:
`npm install ngx-gallery-media` keeps giving the last normal version, `npm install ngx-gallery-media@next` gives the
pre-release.

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

| Message or problem                                                                      | Cause                                                                                                       | Fix                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E403 ... You do not have permission to publish` (your computer)                        | Not signed in, wrong account, or the name is taken                                                          | `npm whoami`; `npm login` with the owner account; `npm view ngx-gallery-media` to see the owner.                                                                                             |
| `EOTP` or "requires two-factor authentication" (your computer)                          | 2FA code needed                                                                                             | Run again and enter the code, or `npm publish --otp 123456`.                                                                                                                                 |
| `Release` workflow: `E404 Not Found - PUT https://registry.npmjs.org/ngx-gallery-media` | Trusted publisher not set, or set with another user, repository or workflow name (npm answers 404, not 403) | Check A.5 letter by letter: GitHub user or organisation, repository `ngx-gallery-media`, workflow `release.yml`. Then re-run the failed job.                                                 |
| `Release` workflow: `ENEEDAUTH` or "need auth"                                          | npm older than 11.5.1, or `id-token: write` missing                                                         | The workflow installs npm 11 and sets `id-token: write`; if someone edited it, restore both.                                                                                                 |
| `E403 ... cannot publish over the previously published versions`                        | That version is already on npm                                                                              | Versions are permanent: prepare the next patch (`release:prepare -- patch`).                                                                                                                 |
| Workflow: `Tag v1.0.2 does not match package version 1.0.1`                             | Tagged without running `release:prepare`, or wrong tag                                                      | `git push --delete origin v1.0.2 && git tag -d v1.0.2`; prepare the version; tag again.                                                                                                      |
| Workflow: `already on npm; nothing to publish`                                          | The tag points at a version already published                                                               | Nothing to do; this is how v1.0.0 behaves after B.                                                                                                                                           |
| Workflow does not start on a tag                                                        | Tag pushed before the workflow file was on GitHub, or Actions turned off                                    | Settings > Actions: allow; push the tag again (delete it first as above).                                                                                                                    |
| `CI` fails only on GitHub                                                               | Something your computer has and the runner has not                                                          | Open the failed step; run `npm ci && npm run check` locally on a clean clone.                                                                                                                |
| Out of Actions minutes                                                                  | Over 2,000 minutes this month (private repository on GitHub Free)                                           | Wait for next month, publish from your computer (C), or make the repository public (unlimited minutes).                                                                                      |
| Apps: `EINTEGRITY` on `npm ci`                                                          | npm holds different bytes than the app lockfile expects                                                     | Only after a 1.0.0 that was rebuilt instead of publishing the delivered file. Run `npm install ngx-gallery-media@1.0.0 --save-exact --legacy-peer-deps` in each app and commit the lockfile. |
| Apps: `ERESOLVE` peer dependencies                                                      | The apps' other packages, not this one                                                                      | Use `--legacy-peer-deps`, as the app pipelines do.                                                                                                                                           |
| Apps: `404 Not Found - ngx-gallery-media`                                               | Not published yet, or a typo in the version                                                                 | `npm view ngx-gallery-media versions`.                                                                                                                                                       |
| A released version is broken                                                            | -                                                                                                           | Publish a fixed patch at once. Then `npm deprecate ngx-gallery-media@1.0.1 "Broken preview, use 1.0.2"`.                                                                                     |
| Published by mistake, minutes ago                                                       | -                                                                                                           | `npm unpublish ngx-gallery-media@1.0.1` works within 72 hours if no other package depends on it; the number can never be used again. Prefer deprecate.                                       |
| Tests do not start: `No binary for ChromeHeadless`                                      | Chrome not found (your computer)                                                                            | Set `CHROME_BIN` to Chrome or Chromium (`export CHROME_BIN=/usr/bin/chromium`).                                                                                                              |

## F. Things to remember

- A version number is published once, for ever. Never reuse or overwrite one; publish the next.
- No npm token is needed anywhere: GitHub Actions publishes through trusted publishing. Never put a token in the
  repository; `.npmrc` is ignored by git on purpose.
- The workflow file name `release.yml` is part of the npm setting (A.5); renaming it stops publishing until A.5 is
  updated.
- `npm login` sessions last 2 hours; sign in again when a publish says you are not authorised.
- Apps that share pages or a design move to the same version together.
- Keep `CHANGELOG.md` true: it is what the apps read before updating.
