# Athos snAPI Explorer - Demo Fork

A client-demo fork of the [Athos snAPI Explorer](https://github.com/AthosCommerce/athos-snapi-explorer), a small Preact app for exploring the Athos Snap API using the [`@athoscommerce/snap-client`](https://github.com/AthosCommerce/snap/tree/main/packages/snap-client) SDK.

This fork adds:

- **Show Raw Response** - toggles the response panel between the SDK's transformed result and the untouched API payload, so you can show clients exactly what the transform layer does. Hover the 👁 icon for a quick peek overlay without leaving the transformed view.
- **Recommendations tab** - demos `client.recommend({ tag, product, ... })` alongside search/autocomplete. Use the "Use product ID from last search" preset to pull a real product id out of your last search run.
- **One-click presets** - known-good example requests (background filter, category + price + sort, autocomplete spell correction) so there's no live-typing risk during a demo.

Create an instance of the client with a `siteId`, edit the request params for `search`, `autocomplete`, or `recommend`, and view the raw + transformed `search`/`meta` responses.

## Usage

```
npm install
npm run dev
```

Then open http://localhost:3000. A test `siteId` (`atdtdp`) is pre-filled in the `globals` panel.

## Presets

Preset field/value names (`tags_category: "Jackets"`, `inventory_policy: "deny"`, `price`) are verified against the `atdtdp` demo catalog. If you point this at a different site, swap them for that site's actual facet/attribute field names.

## Build

```
npm run build
```

Outputs a static bundle to `docs/`, which GitHub Pages serves from on this repo.
