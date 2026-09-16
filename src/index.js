import 'preact/debug';
import { h, render } from 'preact';
import { App } from './js/components/App.js';
import './styles/base.scss';

render(<App />, document.getElementById('container'));
