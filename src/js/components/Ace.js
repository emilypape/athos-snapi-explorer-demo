import { h, Component } from 'preact';

import AceEditor from 'react-ace';

import jsonWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-json';
ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-tomorrow_night';

export class Ace extends Component {
	editor = null;

	highlightMarkerIds = [];
	newKeyMarkerIds = [];

	onLoad = (editor) => {
		this.editor = editor;
		this.applyAutoFold();
		this.applyHighlightKeys();
		this.applyHighlightKeyNames();
	};

	componentDidUpdate(prevProps) {
		window.dispatchEvent(new Event('resize'));

		if (this.props.value !== prevProps.value) {
			this.applyAutoFold();
		}

		if (this.props.value !== prevProps.value || this.props.highlightKeys !== prevProps.highlightKeys) {
			this.applyHighlightKeys();
		}

		if (this.props.value !== prevProps.value || this.props.highlightKeyNames !== prevProps.highlightKeyNames) {
			this.applyHighlightKeyNames();
		}
	}

	// When `autoFoldExcept` is set, collapses every top-level object/array key
	// EXCEPT the ones named, leaving them expanded (e.g. `results`) - so a long
	// response opens with the noisy bits (pagination, facets, sorting, etc.)
	// tucked away and the part you actually care about front and center. Folds
	// are always still manually togglable via the gutter regardless.
	applyAutoFold = () => {
		if (!this.editor || !this.props.autoFoldExcept) {
			return;
		}

		const session = this.editor.getSession();
		session.unfold();

		const lines = (this.props.value || '').split('\n');

		lines.forEach((line, row) => {
			const match = line.match(/^ {2}"([^"]+)":/);

			if (match && !this.props.autoFoldExcept.includes(match[1])) {
				const range = session.getFoldWidgetRange(row);

				if (range) {
					session.addFold('...', range);
				}
			}
		});
	};

	// When `highlightKeys` is set (a map of raw key -> transformed key name),
	// highlights each top-level line whose key is a map key - i.e. the raw
	// fields that actually survive into the transformed response. Anything
	// NOT highlighted at the top level (e.g. `breadcrumbs`, `features` in a
	// real search response) is silently dropped by the transform - that
	// contrast is the point.
	applyHighlightKeys = () => {
		if (!this.editor) {
			return;
		}

		const session = this.editor.getSession();

		this.highlightMarkerIds.forEach((id) => session.removeMarker(id));
		this.highlightMarkerIds = [];

		if (!this.props.highlightKeys) {
			return;
		}

		const { Range } = ace.require('ace/range');
		const lines = (this.props.value || '').split('\n');

		lines.forEach((line, row) => {
			const match = line.match(/^ {2}"([^"]+)":/);

			if (match && this.props.highlightKeys[match[1]]) {
				const id = session.addMarker(new Range(row, 0, row, 1), 'rawSurvives', 'fullLine');
				this.highlightMarkerIds.push(id);
			}
		});
	};

	// When `highlightKeyNames` is set (a plain array of key names), highlights
	// every line whose key matches, AT ANY DEPTH - unlike `highlightKeys`,
	// which only looks at the true top level. Used on the TRANSFORMED view to
	// show structure the transform newly introduces per result (e.g.
	// `mappings`/`core`/`attributes`, which recur once per item in `results`
	// and don't exist as keys anywhere in the raw result at all).
	applyHighlightKeyNames = () => {
		if (!this.editor) {
			return;
		}

		const session = this.editor.getSession();

		this.newKeyMarkerIds.forEach((id) => session.removeMarker(id));
		this.newKeyMarkerIds = [];

		if (!this.props.highlightKeyNames || !this.props.highlightKeyNames.length) {
			return;
		}

		const { Range } = ace.require('ace/range');
		const pattern = new RegExp(`^\\s*"(${this.props.highlightKeyNames.join('|')})":`);
		const lines = (this.props.value || '').split('\n');

		lines.forEach((line, row) => {
			if (pattern.test(line)) {
				const id = session.addMarker(new Range(row, 0, row, 1), 'transformNew', 'fullLine');
				this.newKeyMarkerIds.push(id);
			}
		});
	};

	render() {
		return (
			<AceEditor
				placeholder=""
				mode="json"
				theme={this.props.dark ? 'tomorrow_night' : 'textmate'}
				onChange={this.props.onChange}
				onLoad={this.onLoad}
				readOnly={this.props.readOnly}
				fontSize={12}
				width={'100%'}
				height={'100%'}
				showPrintMargin={false}
				showGutter={true}
				showFoldWidgets={true}
				highlightActiveLine={true}
				defaultValue=""
				value={this.props.value}
				setOptions={{
					tabSize: 2,
				}}
			/>
		);
	}
}
