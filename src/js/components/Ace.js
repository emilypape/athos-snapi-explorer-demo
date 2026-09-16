import { h, Component } from 'preact';

import AceEditor from 'react-ace';

import jsonWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-json';
ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-tomorrow_night';

export class Ace extends Component {
	componentDidUpdate() {
		window.dispatchEvent(new Event('resize'));
	}
	render() {
		return (
			<AceEditor
				placeholder=""
				mode="json"
				theme={this.props.dark ? 'tomorrow_night' : 'textmate'}
				onChange={this.props.onChange}
				readOnly={this.props.readOnly}
				fontSize={12}
				width={'100%'}
				height={'100%'}
				showPrintMargin={false}
				showGutter={true}
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
