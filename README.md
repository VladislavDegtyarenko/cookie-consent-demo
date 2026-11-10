# Cookie Consent Demo

A one-page Next.js demo that shows how a site remembers a cookie choice and starts or stops optional analytics. The local analytics script processes sample events in the browser. The build exports an entirely static site.

## Run locally

Use Node.js 22.13 or later and the pnpm version pinned in `package.json`. GitHub Actions uses Node.js 24.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Cookie settings** in the footer to revisit your choice.

## Build and preview

```sh
pnpm build
pnpm preview
```

Open the URL printed by `pnpm preview`. The files in `out/` can be hosted by any static server at the root of a domain. If you host the project at a path such as `/cookie-consent-demo/` on GitHub Pages, set Next.js's `basePath` to that path before building.

## Preview builds on GitHub

The **Static preview** workflow runs on pull requests and pushes to `main`. You can also start it from **Actions > Static preview > Run workflow**. The workflow checks Biome and TypeScript, builds the site, runs the Playwright suite, and saves the static files as the `cookie-consent-preview` artifact for 14 days.

To view a build, download the artifact from the workflow run, extract it, and run this command from the directory containing `index.html`.

```sh
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173). The artifact is a downloadable build. A public preview URL requires a static host such as GitHub Pages.

## Verify the consent flow

1. Open **Network** in DevTools, enable **Disable cache**, and filter for `demo-analytics.js`. In **Application > Storage > Cookies** (or **Storage > Cookies** in Firefox), clear the demo's cookies and reload.
2. Before making a choice, check that there is no script request. Click **Reject optional** and reload. There is still no request, and the only demo cookie is `cookie_demo_consent=v1.rejected`.
3. Open **Cookie settings**, turn on **Analytics**, and click **Save preferences**. The script appears in Network, and the browser stores `cookie_demo_analytics=active`. Click **Send test event** and check that the processed event count rises by one.
4. Turn **Analytics** off and save. The test cookie disappears, the event button is disabled, and **Live status** reports the withdrawal. Clear the Network log and reload to confirm there is no new script request.
5. Enable **Analytics** again and send one event. The count rises by exactly one. Within the same page, the browser can reuse the loaded script.

You can also run the checks locally.

```sh
pnpm check:biome
pnpm check:types
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright serves the production files from `out/`. The Husky pre-commit hook checks staged files with Biome through lint-staged. Run `pnpm fix:biome` to apply fixes before staging.

## Project layout

- `src/app/` defines the page and global styles. `src/components/ui/` contains the shadcn/ui components.
- `src/features/consent/` reads the versioned consent cookie, activates analytics after opt-in, and updates the live status. An unknown cookie version or value is treated as no choice.
- `public/demo-analytics.js` creates the test cookie and attaches its event handler on activation. Withdrawal removes both. A response that arrives after withdrawal cannot activate analytics.
- `tests/consent.spec.ts` checks network requests, cookies, the preferences dialog, and event handling. The event count belongs to the current page and resets on reload.
