import { h, Component } from 'preact';

export class ApiSelector extends Component {
	apiOptions = () => {
		let options = [];

		for (let api in this.props.apis) {
			options.push(
				<option value={api} selected={api == this.props.value}>
					{api}
				</option>
			);
		}

		return options;
	};

	render() {
		return (
			<span class="select">
				<select
					value={this.state.selectedApi}
					onChange={(ev) => {
						this.props.onChange(ev.target.value);
					}}
				>
					{this.apiOptions()}
				</select>
			</span>
		);
	}
}
