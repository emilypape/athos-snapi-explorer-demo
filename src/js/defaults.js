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

// Preset requests for demo purposes - one-click, known-good examples.
// Field/value names below (tags_category: "Jackets", inventory_policy: "deny",
// price) are verified against the atdtdp demo catalog - swap them if you point
// this at a different site.
export const presets = {
	searchRequest: [
		{
			label: 'Background filter',
			description:
				'Silently excludes items with a "deny" inventory policy via a background filter (127 results drop to 23) without it showing up as an active facet.',
			value: {
				...searchRequest,
				search: { query: { string: '' }, subQuery: '' },
				filters: [{ field: 'inventory_policy', type: 'value', value: 'deny', background: true }],
			},
		},
		{
			label: 'Category + price + sort',
			description: 'Product-type facet (Jackets), a price range filter, and a price sort - the standard faceted search demo.',
			value: {
				...searchRequest,
				search: { query: { string: '' }, subQuery: '' },
				filters: [
					{ field: 'tags_category', type: 'value', value: 'Jackets' },
					{ field: 'price', type: 'range', value: { low: 20, high: 100 } },
				],
				sorts: [{ field: 'price', direction: 'asc' }],
			},
		},
	],
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
