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
	product: '',
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
			label: 'Background filter: VersaWearCo only',
			description:
				'Adds a background filter (vendor: VersaWearCo) to the client globals, so every request made with this client is silently scoped to that vendor - not just the current one. Requires re-instantiating the client.',
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
			id: 'cat-joggers',
			group: 'tags_category',
			label: 'Category: Joggers',
			description: 'Filters to the Joggers product type (11 results alone).',
			filter: { field: 'tags_category', type: 'value', value: 'Joggers' },
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
	],
};
