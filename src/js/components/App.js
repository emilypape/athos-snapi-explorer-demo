import { h, Component } from 'preact';
import { Client } from '@athoscommerce/snap-client';
import { Header } from './Header.js';
import { ApiSelector } from './ApiSelector';
import { Ace } from './Ace.js';
import { defaults, presets, filterPresets } from '../defaults.js';

window.Client = Client;
const storageKey = 'athosSnapiDemoStorage';

const clientConfig = {};

export class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedApi: 'search',
			searching: false,
			autocompleteRequest: defaults.autocompleteRequest,
			searchRequest: defaults.searchRequest,
			recommendRequest: defaults.recommendRequest,
			response: undefined,
			meta: undefined,
			rawResponse: undefined,
			showRawResponse: false,
			peekRaw: false,
			lastSearchResults: [],
			expandedResponse: undefined,
			globalsCollapse: false,
			globals: defaults.globals,
			instantiatedGlobals: undefined,
			ready: false,
			clientFail: false,
			clientReinstantiate: false,
			showInstantiatedMessage: false,
		};

		setTimeout(() => {
			this.instantiateClient();
		});
	}

	storedState = ['selectedApi', 'autocompleteRequest', 'searchRequest', 'recommendRequest', 'expandedResponse', 'globalsCollapse', 'globals'];

	apis = {
		search: {
			function: 'search',
			storageKey: 'athosSnapiSearchRequest',
		},
		autocomplete: {
			function: 'autocomplete',
			storageKey: 'athosSnapiAutocompleteRequest',
		},
		recommend: {
			function: 'recommend',
			storageKey: 'athosSnapiRecommendRequest',
		},
	};

	globalsChanged(change) {
		if (change != this.state.instantiatedGlobals) {
			if (this.state.ready) {
				this.setState({ clientReinstantiate: true, ready: false });
			}
		} else {
			this.setState({ clientReinstantiate: false, ready: true });
		}

		this.saveState({ globals: change });
	}

	// Wraps each requester's low-level `request()` so we can capture the exact
	// pre-transform JSON payload the API returned, alongside the SDK's
	// normal (transformed) result - used to power "Show Raw Response".
	wrapRawCapture = (client) => {
		const captureFor = (requester, matchMethod) => {
			if (!requester || requester.__rawCaptureWrapped) {
				return;
			}

			const original = requester.request.bind(requester);

			requester.request = async (context, cacheKey) => {
				const raw = await original(context, cacheKey);

				if (!matchMethod || context.method === matchMethod) {
					this.lastRawResponse = raw;
				}

				return raw;
			};

			requester.__rawCaptureWrapped = true;
		};

		captureFor(client.requesters.search);
		// recommend fires a GET /profile and a POST /recommend per call - we only
		// want the recommend response, not the profile lookup.
		captureFor(client.requesters.recommend, 'POST');
	};

	instantiateClient = async () => {
		try {
			if (!this.state.ready) {
				await this.loadState();
			}

			const params = JSON.parse(this.state.globals);

			this.client = new Client(params, clientConfig);
			this.wrapRawCapture(this.client);

			window.client = this.client;

			this.setState({
				ready: true,
				clientFail: false,
				response: '',
				meta: '',
				rawResponse: '',
				showInstantiatedMessage: true,
				instantiatedGlobals: this.state.globals,
				clientReinstantiate: false,
			});

			setTimeout(() => {
				this.setState({ showInstantiatedMessage: false });
			}, 3000);
		} catch (err) {
			this.setState({
				ready: false,
				clientFail: true,
				instantiatedGlobals: NaN,
			});
			console.error(err);
		}
	};

	loadState = async () => {
		try {
			const stringifiedSaveObject = window.localStorage.getItem(storageKey);
			const saveObject = JSON.parse(stringifiedSaveObject);

			await this.setState(saveObject);
		} catch (err) {
			console.error('Bad save data... failed to load.');
			console.error(err);
		}
	};

	save = () => {
		try {
			let saveObject = {};

			for (const key of this.storedState) {
				saveObject[key] = this.state[key];
			}

			const stringifiedSaveObject = JSON.stringify(saveObject);

			window.localStorage.setItem(storageKey, stringifiedSaveObject);
		} catch (err) {
			console.error('Bad save data... failed to save.');
		}
	};

	saveState = async (updates) => {
		await this.setState(updates);

		for (const key of Object.keys(updates)) {
			if (this.storedState.includes(key)) {
				this.save();
				break;
			}
		}
	};

	reset = (key) => {
		if (defaults[key]) {
			this.saveState({ [key]: defaults[key] });
		}
	};

	applyPreset = (key, value) => {
		this.saveState({ [key]: JSON.stringify(value, null, 2) });
	};

	currentFilters = () => {
		try {
			return JSON.parse(this.state[`${this.state.selectedApi}Request`] || '{}').filters || [];
		} catch (err) {
			return [];
		}
	};

	isFilterPresetActive = (preset) => {
		return this.currentFilters().some((f) => JSON.stringify(f) === JSON.stringify(preset.filter));
	};

	// Toggles a single filter on/off. Presets sharing a `group` are mutually
	// exclusive (selecting one replaces any other active filter in that group);
	// presets in different groups combine, since that's the whole point of
	// making these pairable rather than full-request swaps.
	toggleFilterPreset = (preset) => {
		const key = `${this.state.selectedApi}Request`;
		let current = {};

		try {
			current = JSON.parse(this.state[key] || '{}');
		} catch (err) {
			current = {};
		}

		const filters = Array.isArray(current.filters) ? [...current.filters] : [];
		const groupIndex = filters.findIndex((f) => f.field === preset.filter.field);
		const isActive = groupIndex !== -1 && JSON.stringify(filters[groupIndex]) === JSON.stringify(preset.filter);

		if (isActive) {
			filters.splice(groupIndex, 1);
		} else if (groupIndex !== -1) {
			filters[groupIndex] = preset.filter;
		} else {
			filters.push(preset.filter);
		}

		current.filters = filters;

		this.applyPreset(key, current);
	};

	useLastResultAsProduct = () => {
		const results = this.state.lastSearchResults || [];

		if (!results.length) {
			return;
		}

		let current = {};

		try {
			current = JSON.parse(this.state.recommendRequest || '{}');
		} catch (err) {
			current = {};
		}

		current.product = results[0].id;

		this.saveState({ recommendRequest: JSON.stringify(current, null, 2) });
	};

	expandResponse = async (focus) => {
		if (this.state.expandedResponse) {
			if (this.state.expandedResponse == focus) {
				focus = undefined;
			}
		}

		await this.saveState({ expandedResponse: focus });

		window.dispatchEvent(new Event('resize'));
	};

	runSearch = async () => {
		const api = this.apis[this.state.selectedApi];

		this.setState({ searching: true });
		let request = this.state[`${this.state.selectedApi}Request`] || '{}';

		try {
			request = JSON.parse(request);
		} catch (err) {
			this.setState({
				response: 'invalid JSON in request parameters',
				searching: false,
			});
			return;
		}

		this.lastRawResponse = undefined;

		try {
			if (this.state.selectedApi === 'recommend') {
				const { meta, ...rest } = await this.client.recommend(request);

				this.setState({
					response: JSON.stringify(rest, null, 2),
					meta: JSON.stringify(meta, null, 2),
					rawResponse: JSON.stringify(this.lastRawResponse, null, 2),
				});
			} else {
				const { meta, search } = await this.client[api.function](request);

				const newState = {
					response: JSON.stringify(search, null, 2),
					meta: JSON.stringify(meta, null, 2),
					rawResponse: JSON.stringify(this.lastRawResponse, null, 2),
				};

				if (search && Array.isArray(search.results)) {
					newState.lastSearchResults = search.results;
				}

				this.setState(newState);
			}
		} catch (err) {
			let error = err && err.error && err.error.message;

			console.log(err);

			if (err.status && err.statusText) {
				error = `${err.status}: ${err.statusText}\n${error}`;
			}

			if (err.response && err.response.text) {
				error += `\n\n${err.response.text}`;
			}

			this.setState({ response: error || JSON.stringify(err, null, 2) });
		}

		this.setState({ searching: false });
	};

	render() {
		const currentPresets = presets[`${this.state.selectedApi}Request`];
		const currentFilterPresets = filterPresets[`${this.state.selectedApi}Request`];

		return (
			<div class="App">
				<Header />

				<div class="content">
					<div class="column">
						<div class="column-wrap">
							<div class={`block small ${this.state.globalsCollapse ? 'collapse' : ''}`}>
								<div class="heading">
									<h5
										class="clickable center"
										onClick={async () => {
											await this.saveState({
												globalsCollapse: !this.state.globalsCollapse,
											});
											window.dispatchEvent(new Event('resize'));
										}}
									>
										globals
										<div class={`toggle ${this.state.globalsCollapse ? 'expand' : 'collapse'}`}></div>
									</h5>

									<span
										class="reset"
										onClick={() => {
											this.reset('globals');
										}}
									>
										{this.state.globals == defaults.globals ? '' : 'reset'}
									</span>

									<div class="grow-right">
										<pre>
											<span class="other">const</span> <span class="variable">client</span> = <span class="reserved">new</span> Client(
											<span class="variable params">globals</span>);
										</pre>
									</div>
								</div>

								<div class={`ace ${this.state.clientFail ? 'error' : ''} ${this.state.clientReinstantiate ? 'warn' : ''}`}>
									<Ace
										value={this.state.globals}
										onChange={(change) => {
											this.globalsChanged(change);
										}}
										readOnly={false}
									/>
								</div>

								<div class="footing">
									{this.state.clientFail && (
										<span class="message error grow-left">
											<span class="icon error">!</span>Instantiation Failed
										</span>
									)}

									{this.state.clientReinstantiate && (
										<span class="message warn grow-left">
											<span class="icon warn">*</span>Re-instantiation Required
										</span>
									)}

									{this.state.showInstantiatedMessage && (
										<span class="message info grow-left">
											<span class="instantiate">🔅</span> Instantiation Complete
										</span>
									)}

									<div
										onClick={this.instantiateClient}
										class={`controls clickable ${this.state.clientFail ? 'error' : ''} ${this.state.clientReinstantiate ? 'warn' : ''}`}
									>
										<span class="instantiate" title="instantiate">
											🔅
										</span>
									</div>
								</div>
							</div>

							<div class={`block large ${this.state.ready ? '' : 'disabled'}`}>
								<div class="heading">
									<div class="apiSelection">
										<ApiSelector
											value={this.state.selectedApi}
											apis={this.apis}
											onChange={(change) => {
												this.saveState({ selectedApi: change });
											}}
										/>
									</div>

									<div
										class="reset"
										onClick={() => {
											this.reset(`${this.state.selectedApi}Request`);
										}}
									>
										{this.state[`${this.state.selectedApi}Request`] == defaults[`${this.state.selectedApi}Request`] ? '' : 'reset'}
									</div>

									{(currentFilterPresets || currentPresets || this.state.selectedApi === 'recommend') && (
										<div class="presets">
											{currentFilterPresets &&
												currentFilterPresets.map((preset) => (
													<button
														type="button"
														class={`preset ${this.isFilterPresetActive(preset) ? 'active' : ''}`}
														title={preset.description}
														onClick={() => {
															this.toggleFilterPreset(preset);
														}}
													>
														{preset.label}
													</button>
												))}

											{currentPresets &&
												currentPresets.map((preset) => (
													<button
														type="button"
														class="preset"
														title={preset.description}
														onClick={() => {
															this.applyPreset(`${this.state.selectedApi}Request`, preset.value);
														}}
													>
														{preset.label}
													</button>
												))}

											{this.state.selectedApi === 'recommend' && (
												<button
													type="button"
													class="preset"
													disabled={!this.state.lastSearchResults || !this.state.lastSearchResults.length}
													title="Fill 'product' with the first result's id from your last search/autocomplete run"
													onClick={this.useLastResultAsProduct}
												>
													Use product ID from last search
												</button>
											)}
										</div>
									)}

									<div class="grow-right">
										<pre>
											<span class="other">const</span> <span class="variable">requestParams</span>
										</pre>
									</div>
								</div>

								<div class="ace">
									<Ace
										value={this.state[`${this.state.selectedApi}Request`]}
										onChange={(change) => {
											this.saveState({
												[`${this.state.selectedApi}Request`]: change,
											});
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<div class={`controls ${this.state.ready ? '' : 'disabled'}`}>
						<button disabled={this.state.searching} type="button" onClick={this.runSearch}>
							🔍 <span>&rarr;</span>
						</button>
					</div>

					<div class={`column ${this.state.ready ? '' : 'disabled'}`}>
						<div class="column-wrap">
							<div class={`block large ${this.state.expandedResponse && this.state.expandedResponse != 'search' ? 'collapse' : ''}`}>
								<div class="heading lefty">
									<h5
										class="clickable center"
										onClick={() => {
											this.expandResponse('search');
										}}
									>
										{this.state.selectedApi} response
										<div class={`toggle ${this.state.expandedResponse == 'search' ? 'collapse' : 'expand'}`}></div>
									</h5>

									<div class="rawControls">
										<span
											class={`rawToggle ${this.state.showRawResponse ? 'active' : ''}`}
											onClick={() => {
												this.setState({ showRawResponse: !this.state.showRawResponse });
											}}
										>
											{this.state.showRawResponse ? 'Show Transformed Response' : 'Show Raw Response'}
										</span>

										{!this.state.showRawResponse && (
											<span
												class="rawPeek"
												title="Hold to peek at the raw response"
												onMouseEnter={() => {
													this.setState({ peekRaw: true });
												}}
												onMouseLeave={() => {
													this.setState({ peekRaw: false });
												}}
											>
												👁
											</span>
										)}
									</div>

									<div class="grow-right">
										<pre>
											<span class="other">const</span> {'{'} <span class="variable">meta</span>, <span class="variable">search</span> {'}'}{' '}
											= <span class="reserved">await</span> <span class="variable">client</span>.{this.state.selectedApi}(
											<span class="variable params">requestParams</span>);
										</pre>
									</div>
								</div>

								<div class={`ace ${this.state.showRawResponse ? 'dark' : ''}`}>
									<Ace
										value={this.state.showRawResponse ? this.state.rawResponse : this.state.response}
										readOnly={true}
										dark={this.state.showRawResponse}
									/>

									{this.state.peekRaw && !this.state.showRawResponse && (
										<div class="rawPeekOverlay">
											<div class="rawPeekLabel">raw response</div>
											<Ace value={this.state.rawResponse} readOnly={true} dark={true} />
										</div>
									)}
								</div>
							</div>

							<div class={`block small ${this.state.expandedResponse && this.state.expandedResponse != 'meta' ? 'collapse' : ''}`}>
								<div class="heading lefty">
									<h5
										class="clickable center"
										onClick={() => {
											this.expandResponse('meta');
										}}
									>
										meta data response
										<div class={`toggle ${this.state.expandedResponse == 'meta' ? 'expand' : 'collapse'}`}></div>
									</h5>

									<div class="grow-right"></div>
								</div>

								<div class="ace">
									<Ace value={this.state.meta} readOnly={true} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
