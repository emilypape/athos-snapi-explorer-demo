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

	onLoad = (editor) => {
		this.editor = editor;
		this.applyAutoFold();
		this.applyHighlightKeys();
	};

	componentDidUpdate(prevProps) {
		window.dispatchEvent(new Event('resize'));

		if (this.props.value !== prevProps.value) {
			this.applyAutoFold();
		}

		if (this.props.value !== prevProps.value || this.props.highlightKeys !== prevProps.highlightKeys) {
			this.applyHighlightKeys();
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
