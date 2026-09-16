import { h, Component } from 'preact';
import athosLogo from '../../../public/images/athos_logo.svg';
import openApiLogo from '../../../public/images/openapi_logo.png';
import githubLogo from '../../../public/images/github_logo.svg';

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
					<a href="https://docs.athoscommerce.com/reference" target="_blank">
						<img class="icon img" src={openApiLogo} />
					</a>
					<a href="https://github.com/emilypape/athos-snapi-explorer-demo" target="_blank">
						<img class="icon img" src={githubLogo} />
					</a>
				</div>
			</div>
		);
	}
}
