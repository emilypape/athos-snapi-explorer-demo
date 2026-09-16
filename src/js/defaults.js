const searchRequest = {
	search: {
		query: {
			string: '',
		},
		subQuery: '',
	},
	filters: [],
	sorts: [],
	pagination: {
		page: 1,
		pageSize: 30,
	},
	facets: {
		exclude: [],
		include: [],
	},
	merchandising: {
		disabled: false,
		segments: [],
		landingPage: '',
	},
	tracking: {
		loggedInUserId: 'explorer@athoscommerce.com',
	},
};

const autocompleteRequest = {
	suggestions: {
		count: 5,
	},
	...searchRequest,
	search: {
		query: {
			string: '',
			spellCorrection: true,
		},
		subQuery: '',
	},
	facets: {
		exclude: [],
		include: [],
		limit: 10,
		valueLimit: 5,
	},
};

const recommendRequest = {
	tag: 'similar',
	// A known-good product id on atdtdp, verified to return real "similar"
	// results (8 items) - so the Recommendations tab works out of the box
	// with zero prior steps, not just via "Use product ID from last search".
	product: '52079573827950',
	limit: 10,
};

const globals = {
	siteId: 'atdtdp',
};

export const defaults = {
	autocompleteRequest: JSON.stringify(autocompleteRequest, null, 2),
	searchRequest: JSON.stringify(searchRequest, null, 2),
	recommendRequest: JSON.stringify(recommendRequest, null, 2),
	globals: JSON.stringify(globals, null, 2),
};

// Toggleable filter presets - each is a single filter you can click on/off.
// Presets sharing the same `group` are mutually exclusive (only one category
// at a time); presets in different groups combine freely. Every preset and
// every combination below is verified against the atdtdp demo catalog to
// never return 0 results - see project memory for the full combo matrix
// (notably: "Jackets" + the background filter DOES return 0, which is why
// it's not in this list; Sweatshirts/Joggers/Leggings all are safe).
//
// `filter.background: true` marks a REAL background filter (server param
// `bgfilter.*` - silently narrows results, never appears in the transformed
// `search.filters`/facet-active state). Everything else here is a plain,
// customer-visible `filter.*` - the UI tags background ones distinctly so
// the two are never confused. See docs/Libraries/library-snap-client.md
// ("Global Config") and reference/Search/search-result-pages.md
// ("Background Filters") in the Athos docs.
export const filterPresets = {
	// Applied to the Client's `globals`, so it's concatenated onto EVERY
	// request made with this client (search, autocomplete, category, finder) -
	// not just the current one. This is the documented "global background
	// filter" pattern, e.g. scoping an entire storefront to one vendor/brand.
	globals: [
		{
			id: 'global-bg-vendor',
			group: 'vendor',
			// Labeled "Brand" for the demo narrative - but the field MUST stay
			// `vendor`. Tested live: `field: 'brand'` doesn't error, it just
			// silently returns the full unfiltered count (127), identical to a
			// made-up field name - `brand` only exists as a display-only field
			// on results (mappings.core.brand), it isn't actually indexed as a
			// filterable facet on this catalog. `vendor` is the real one.
			label: 'Background filter: Brand (VersaWearCo)',
			description:
				'Adds a background filter to the client globals, so every request made with this client is silently scoped to that brand - not just the current one. Requires re-instantiating the client. Note: the underlying indexed field on this catalog is "vendor", not "brand" - "brand" exists on results for display but isn’t filterable, so it silently no-ops if used as the filter field.',
			filter: { field: 'vendor', type: 'value', value: 'VersaWearCo', background: true },
		},
	],
	searchRequest: [
		{
			id: 'bg-inventory-deny',
			group: 'inventory_policy',
			label: 'Background filter',
			description:
				'Silently excludes items with a "deny" inventory policy via a background filter (127 results drop to 23) without it showing up as an active facet.',
			filter: { field: 'inventory_policy', type: 'value', value: 'deny', background: true },
		},
		{
			id: 'cat-sweatshirts',
			group: 'tags_category',
			label: 'Category: Sweatshirts',
			description: 'Filters to the Sweatshirts product type (23 results alone).',
			filter: { field: 'tags_category', type: 'value', value: 'Sweatshirts' },
		},
		{
			id: 'cat-leggings',
			group: 'tags_category',
			label: 'Category: Leggings',
			description: 'Filters to the Leggings product type (10 results alone).',
			filter: { field: 'tags_category', type: 'value', value: 'Leggings' },
		},
		{
			id: 'price-20-100',
			group: 'price',
			label: 'Price $20–$100',
			description: 'Range filter on price (89 results alone).',
			filter: { field: 'price', type: 'range', value: { low: 20, high: 100 } },
		},
	],
};

// Autocomplete requests accept the exact same `filters` shape as search, and
// every one of the search-tab combinations above is verified to also work
// through `client.autocomplete()` when paired with a real query string (e.g.
// via the "Spell correction" or "Prefix completion" preset below, or just
// typing something first) - autocomplete throws if the query is empty, so a
// bare filter toggle alone isn't enough to run it.
filterPresets.autocompleteRequest = filterPresets.searchRequest;

// Toggleable `facets.exclude` presets - adds/removes a facet from the ones
// the API even bothers returning, distinct from filtering: results/count are
// completely unaffected, only which facets come back. Verified live:
// excluding "collection_name" removes it from `search.facets` while
// totalResults stays at 127 either way.
export const facetExcludePresets = {
	searchRequest: [
		{
			id: 'exclude-collection-name',
			label: 'Exclude facet: collection_name',
			description: 'Adds "collection_name" to facets.exclude - it’s omitted from the response entirely (not just hidden/collapsed); results are unaffected.',
			value: 'collection_name',
		},
	],
};

// Non-filter globals presets - these patch/remove a whole top-level key on
// `globals` rather than toggling one entry in a `filters` array. Verified:
// a request's OWN `pagination` always wins over the global default (that's
// deepmerge(globals, params) - params is the override), so this only has a
// visible effect once the search/autocomplete request stops specifying its
// own pagination - which is exactly what toggling this preset also does to
// both request tabs, so the effect is immediately visible rather than
// silently doing nothing. Mirrors the documented pattern of setting
// `globals: { pagination: { pageSize: 6 } }` once per controller instead of
// per-request (see docs/BUILD_DEPLOY_INTEGRATION_MAGENTO2.md, autocomplete
// controller config).
export const globalsPresets = [
	{
		id: 'global-pagination-6',
		group: 'pagination',
		label: 'Global pagination: 6/page',
		description:
			'Sets pageSize to 6 in the client globals as the default for every request - clears pagination from the search/autocomplete requests so the global default actually applies (a request’s own pagination always overrides the global one). Requires re-instantiating.',
		patch: { pagination: { pageSize: 6 } },
	},
];

// Single-shot request presets that replace the whole request (used where
// pairing doesn't make sense, e.g. autocomplete's query text).
export const presets = {
	autocompleteRequest: [
		{
			label: 'Spell correction',
			description: 'A misspelled query ("jaket") with spellCorrection on, showing the corrected term come back in the response.',
			value: {
				...autocompleteRequest,
				search: { query: { string: 'jaket', spellCorrection: true }, subQuery: '' },
			},
		},
		{
			label: 'Prefix completion',
			description: 'A short prefix ("leg") that completes to a full term ("legging") as you type - shows suggestion type "completed" vs. the spell-correction example’s "exact".',
			value: {
				...autocompleteRequest,
				search: { query: { string: 'leg', spellCorrection: true }, subQuery: '' },
			},
		},
	],
};

// Key names the transform newly introduces per result item, verified live
// against a real result - the raw result is ~40 flat fields (name, price,
// vendor, category, ... plus id/uid), and none of them are named "mappings",
// "attributes", or "core". The transform buckets the ~20 known/core fields
// under mappings.core and everything else under attributes - both container
// keys are pure transform output, not renamed/passthrough raw fields. Recurs
// once per item in `results` (and once per variant, since variants go through
// the same transform), so highlighting matches by key name at any depth
// rather than only the true top level. Highlighted in the transformed
// response view to show what the transform adds.
export const transformedNewKeys = ['mappings', 'attributes', 'core'];
