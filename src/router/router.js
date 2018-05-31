import React from 'react';
import {/*BrowserRouter*/HashRouter as Router, Route, Switch } from 'react-router-dom'

import { hot } from 'react-hot-loader'

// lazy load
import Login from 'bundle-loader?lazy&name=login!PAGES/login/login';

import App from '../app';

import { loadComponent, AuthRoute } from 'UTILS/utils'

import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

class RouterConfig extends React.Component{

	render() {
		return (
			<Router>
				<LocaleProvider locale={zhCN}>
					<div>
						<Switch>
							<Route exact path="/" component={App} />
							<Route path="/login" component={loadComponent(Login)}/>
							<Route path="/App" component={App}/>
							<Route path="/box" component={App}/>
							<Route render={() => (<div>404 NOT FOUND</div>)}/>
						</Switch>
					</div>
				</LocaleProvider>
			</Router>
		);
	}
}

export default hot(module)(RouterConfig)