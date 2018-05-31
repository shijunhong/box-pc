
import React from 'react';
import ReactDom from 'react-dom';

import RouterConfig from './router/router'
import { Provider } from 'react-redux';

import store from './redux/store';

import "antd/dist/antd.less";
import './assets/css/animate.css';
import './assets/css/style.less';
import './assets/css/media.less';


const render = () => {
	ReactDom.render(
		<Provider store={store}>
			<RouterConfig />
		</Provider>
		,
		document.getElementById('app')
	);

}
render();
