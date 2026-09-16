# Athos snAPI Explorer - Demo Fork

A client-demo fork of the [Athos snAPI Explorer](https://github.com/AthosCommerce/athos-snapi-explorer), a small Preact app for exploring the Athos Snap API using the [`@athoscommerce/snap-client`](https://github.com/AthosCommerce/snap/tree/main/packages/snap-client) SDK.

This fork adds:

- **Show Raw Response** - toggles the response panel between the SDK's transformed result and the untouched API payload, so you can show clients exactly what the transform layer does. Hover the 👁 icon for a quick peek overlay without leaving the transformed view.
- **Recommendations tab** - demos `client.recommend({ tag, product, ... })` alongside search/autocomplete. Use the "Use product ID from last search" preset to pull a real product id out of your last search run.
- **Pairable filter presets** - toggleable one-click filter chips (next to "reset") instead of typing JSON. Presets for the same facet (e.g. the category options) are mutually exclusive; presets for different facets combine freely (e.g. background filter + a category + a price range, all at once). Autocomplete keeps a single "Spell correction" preset since query text isn't something you pair.

Create an instance of the client with a `siteId`, edit the request params for `search`, `autocomplete`, or `recommend`, and view the raw + transformed `search`/`meta` responses.

## Usage

```
npm install
npm run dev
```

Then open http://localhost:3000. A test `siteId` (`atdtdp`) is pre-filled in the `globals` panel.

## Presets

Preset field/value names (`tags_category`, `inventory_policy: "deny"`, `price`) are verified against the `atdtdp` demo catalog - every preset, and every combination of presets, is confirmed to return more than 0 results. If you point this at a different site, re-verify combinations before relying on them live: some plausible-looking pairs (e.g. a "Jackets" category filter combined with the background filter here) return 0 results even though each works fine alone.

## Build

```
npm run build
```

Outputs a static bundle to `docs/`, which GitHub Pages serves from on this repo.
