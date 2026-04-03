# BTC-Visualizer

BTC-Visualizer is a recruiter-facing open-source dashboard that explains Bitcoin through a small, curated set of public-data views. Instead of treating BTC as only a price chart, the app connects market structure, halvings, network activity, and supply scarcity in a calm, readable interface.

It is built to feel like a real portfolio project: focused scope, clean architecture, thoughtful UI hierarchy, practical API handling, and readable code.

## Why this project works as a portfolio piece

- It turns multiple public APIs into one coherent product story instead of a collection of widgets.
- It shows Astro used intentionally: server-rendered page shell, React islands only for charts, minimal client JavaScript elsewhere.
- It demonstrates judgment through scoped features, graceful fallbacks, short TTL caching, strong formatting, and clean explanatory copy.
- It is easy for another engineer to review because the data adapters, transformations, components, and layout concerns are separated cleanly.

## Feature set

- Market snapshot cards for price, market cap, volume, and circulating supply
- Main BTC price chart with timeframe switching
- Halving-aware timeline with approximate price context
- Network section combining hashrate, fee pressure, and live fee recommendations
- Scarcity view showing mined supply progress toward 21M
- Drawdown analysis for a more honest risk lens
- Short explanatory insight text in each section
- Partial-data and unavailable-source handling

## Tech stack

- Astro
- TypeScript
- Tailwind CSS
- React islands for interactive charts
- Recharts for visualization
- Zod for external response validation

## Architecture

```text
src/
  components/
    charts/        React chart islands
    ui/            Reusable Astro presentation primitives
  layouts/         Page layout and SEO shell
  lib/
    api/           API adapters and dashboard aggregation
    constants/     Bitcoin milestones and source metadata
    formatters/    UI-safe number and date formatters
    types/         Shared TypeScript contracts
    utils/         Small utilities
  pages/           Astro routes
  styles/          Global theme and Tailwind layers
```

### Data-fetching approach

- The app uses Astro server rendering so external APIs are fetched on the server, not directly from the browser.
- `src/lib/api` contains thin adapters per source plus a dashboard aggregator that combines and transforms the responses.
- External responses are parsed with Zod where shape stability matters.
- A short in-memory TTL cache reduces repeated upstream calls during local development or server traffic bursts.
- Each section can fail independently, so one flaky source does not collapse the whole page.

## Chosen views and why they are strong

- Price history is the obvious anchor, but the timeframe selector and halving markers make it more analytical than a generic chart.
- Halving context helps non-crypto readers understand that Bitcoin has a protocol clock, not just market cycles.
- Network pulse gives the app a second dimension beyond market data by showing miner commitment and blockspace demand.
- Scarcity progress provides a simple visual for Bitcoin’s fixed-supply narrative without hype language.
- Drawdowns demonstrate derived thinking: it is not just raw API output, it is transformed into a clearer risk story.

## Data sources

- Blockchain.com Charts: register-less price, supply, trade volume, hashrate, and fee history
- mempool.space: recommended fees and difficulty adjustment context
- mempool/mempool on GitHub: open-source project behind mempool.space

These were chosen because they are public, stable enough for a portfolio project, and do not require a paid service or a user account. Where possible, the stack leans on open infrastructure, with `mempool.space` serving as the clearest open-source source in the mix.

## Deployment

The app is intended to run as Astro SSR on Netlify.

- Adapter: `@astrojs/netlify`
- Build command: `npm run build`
- Node version: `20+`

If Netlify shows a plain `dist/client` and `dist/server` output, the project is usually still being built with the generic Node adapter or with the wrong deployment target. This repo should use the Netlify adapter because the dashboard fetches live public data on the server.

## Tradeoffs and simplifications

- The app intentionally does not include dozens of BTC indicators. The goal is a clean product story, not feature volume.
- A small server-side cache was added instead of a persistent store because the project should stay easy to run locally.
- The UI uses custom Astro primitives instead of bringing in the full shadcn/ui surface area. That keeps the dependency footprint and client complexity lower while preserving consistency.
- The app uses one excellent light theme instead of adding dark mode for its own sake.
- The network section uses a small set of practical signals instead of trying to mirror a full mining dashboard.
- The market layer now favors no-key public charts over richer commercial APIs. That keeps the app easier to run and more open-source friendly, at the cost of some metric precision and source variety.

## Open-source notes

- The codebase is structured for extension: new sources can be added in `src/lib/api` without rewriting the page.
- Comments are intentionally sparse and only added where architecture or math would otherwise be easy to misread.
- Section-level fallbacks are explicit so contributors can see how partial data is handled.

## Screenshots

Add screenshots here after the first local run:

- `docs/screenshot-home.png`
- `docs/screenshot-network.png`

## Future improvements

- Add a compact cycle-comparison view normalized from each halving date
- Introduce per-section stale timestamps if source freshness becomes important
- Add visual regression snapshots for the main dashboard route
- Offer an alternate BTC-denominated reading mode for selected metrics

## Assumptions

- Blockchain.com Charts continues exposing the public JSON chart endpoints used for price, supply, volume, hashrate, and fee history.
- mempool.space continues exposing public fee and difficulty endpoints.

If one of those assumptions changes, the adapter layer is the only place that should need significant updates.
