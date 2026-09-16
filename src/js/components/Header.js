import { h, Component } from 'preact';
import athosLogo from '../../../public/images/athos_logo.svg';

export class Header extends Component {
	render() {
		return (
			<div class="header">
				<span class="logo">
					<img src={athosLogo} />
					<span class="subtitle">Snap API Explorer</span>
				</span>

				<div class="links">
					<a href="https://github.com/AthosCommerce/snap/tree/main/packages/snap-client" target="_blank">
						<span class="icon large readme">i</span>
					</a>
				</div>
			</div>
		);
	}
}
