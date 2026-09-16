# Athos snAPI Explorer - Demo Fork

A client-demo fork of the [Athos snAPI Explorer](https://github.com/AthosCommerce/athos-snapi-explorer), a small Preact app for exploring the Athos Snap API using the [`@athoscommerce/snap-client`](https://github.com/AthosCommerce/snap/tree/main/packages/snap-client) SDK.

This fork adds:

- **Show Raw Response** - toggles both the main response panel *and* the meta data panel between the SDK's transformed result and the untouched API payload (they're two separate API calls, so both flip together), so you can show clients exactly what the transform layer does. Hover the 👁 icon for a quick peek overlay without leaving the transformed view. (In practice, `meta` has no transform layer in the SDK at all, so raw and transformed meta are legitimately identical - that's the SDK's behavior, not a bug here.)
- **New-structure highlighting** (transformed view, all tabs) - purple-highlights `mappings`, `core`, and `attributes` wherever they appear (per result, and per variant, since variants get the same treatment) - structure the transform newly introduces. Verified none of those three names exist anywhere in a raw result's ~40 flat fields.
- **Auto-folded responses** - every top-level key in a response is collapsed by default except `results`, so a 30-result response opens with the noisy bits (pagination, facets, sorting, etc.) tucked away. Every object/array anywhere is still manually foldable via the gutter arrows.
- **Scroll-to-top/bottom buttons** on the response and meta data panels - jumps straight to either end of a response that can run thousands of lines long.
- **Recommendations tab** - demos `client.recommend({ tag, product, ... })` alongside search/autocomplete. Defaults to a verified-good product id so it works with zero prior steps; click "Use product ID from last search" to pull a real product id out of your last search run instead.
- **Pairable filter presets** - toggleable one-click filter chips, in their own row above the api dropdown/reset (so a long list of them never crowds those out) instead of typing JSON. Presets for the same facet (e.g. the category options) are mutually exclusive; presets for different facets combine freely (e.g. a category + a price range, all at once). Shared between search and autocomplete. Autocomplete additionally has two single-shot presets ("Spell correction", "Prefix completion") since query text isn't something you pair.
- **Query preset** - a toggleable `Query` chip, kept separate from the filter presets (filters combine freely; a query baked into each one would get silently overwritten by the next filter clicked). Search uses `"tops"`; autocomplete uses `"hoodie"` instead, since "tops" never populates the autocomplete-only `suggested`/`alternatives` fields (verified: no product name in this catalog literally contains "top"/"tops") while "hoodie" populates both. Also means a bare filter chip can run standalone on the autocomplete tab, which otherwise requires a non-empty query.
- **Sort preset** - a toggleable `Sort: Price low-high` chip, verified to genuinely reorder results without affecting result count.
- **Exclude-facet presets** (search) - toggleable `facets.exclude` entries (tagged with a **hide** badge: currently `collection_name`), distinct from filtering: they never change results/count, only which facets the response even bothers returning.
- **Globals-level background filter** - a toggleable preset in the `globals` panel itself (per the snap-client docs' "Global Config" pattern), which is concatenated onto *every* request the client makes, not just one. Requires re-instantiating, same as any other globals edit. Labeled "Brand" for the demo narrative, though the actual indexed field is `vendor` - see the Presets section below.
- **Global pagination preset** - sets a default `pageSize` in `globals` (mirroring the documented per-controller pagination pattern), and clears pagination from the search/autocomplete requests so the global default actually takes effect (a request's own pagination always wins otherwise).
- Presets that are true background filters (`background: true` - a silent, server-side `bgfilter.*` param that never shows up as an active/customer-visible filter) are tagged with a dashed orange **bg** badge, so they're never confused with the plain, customer-visible filter presets (category, price). The only remaining background-filter preset lives in the globals panel; there's no per-request one anymore.

Create an instance of the client with a `siteId`, edit the request params for `search`, `autocomplete`, or `recommend`, and view the raw + transformed `search`/`meta` responses. The response panel opens fully expanded and the meta data panel starts collapsed - click either heading to toggle.

## Usage

```
npm install
npm run dev
```

Then open http://localhost:3000. A test `siteId` (`atdtdp`) is pre-filled in the `globals` panel.

## Presets

Preset field/value names (`tags_category`, `inventory_policy: "deny"`, `price`, `vendor`) are verified against the `atdtdp` demo catalog - every preset, and every combination of presets (including the globals-level ones), is confirmed to return more than 0 results. If you point this at a different site, re-verify combinations before relying on them live: some plausible-looking pairs (e.g. a "Jackets" category filter combined with the background filter here) return 0 results even though each works fine alone. Also double-check your field names are actually indexed/filterable - an unrecognized field name (e.g. `brand` on this catalog) doesn't error, it just silently filters nothing, which is easy to mistake for "it worked."

## Build

```
npm run build
```

Outputs a static bundle to `docs/`, which GitHub Pages serves from on this repo.
