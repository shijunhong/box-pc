import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom'
import Bundle from '../router/bundle';

import { Icon } from 'antd'

import { addTab } from 'REDUX/actions/index'

let refreshCallback = null;
let HOST = window.location.protocol + '//' + window.location.host

if(NPM_SCRIPT === 'start'){
  HOST = 'http://feature-4.newdhb.com'
}
if(NPM_SCRIPT === 'build'){
	HOST = 'http://feature-4.newdhb.com'
}

/* if(document.referrer && document.referrer.includes('grayscale')){
  HOST = 'http://grayscale.newdhb.com'
} */
else if(document.referrer && document.referrer.includes('optimizetest')){
  HOST = 'http://optimizetest.newdhb.com'
}
else if(document.referrer && document.referrer.includes('optimize')){
  HOST = 'http://optimize.newdhb.com'
}
else if(document.referrer && document.referrer.includes('wechat')){
  HOST = 'http://wechat.newdhb.com'
}

if(window.location.host === 'ym.dhb168.com'){
	HOST = 'https://yadmin.dhb168.com'
}
else if(window.location.host === 'm.dhb168.com'){
	HOST = 'https://admin.dhb168.com'
}

// iframe 地址
export const PRE_URL = HOST + '/Manager/Home/index';

// 接口地址
export const DHB_API = HOST + '/';

export const setRefresh = (refresh) => {
  if(typeof refresh !== 'function'){
    throw new error('参数错误');
  }
  refreshCallback = refresh;
}

export const triggerRefresh = () => {
  if(typeof refreshCallback !== 'function'){
    return;
  }
  refreshCallback();
}

export const removeRefresh = () => {
  refreshCallback = null;
}

export let PAGE_SIZE = Number(window.localStorage._pageSize_ || 10);

export const setPageSize = (size) => {
  window.localStorage._pageSize_ = size;
  PAGE_SIZE = size;
}

export const getCookie = (c_name) => {
  if (document.cookie.length>0){　　
    let c_start=document.cookie.indexOf(c_name + "=")　　
      if (c_start!=-1){ 
        c_start=c_start + c_name.length+1　　
        let c_end=document.cookie.indexOf(";",c_start)　　
        if (c_end==-1) c_end=document.cookie.length　　
        return unescape(document.cookie.substring(c_start,c_end))　　
      } 
    }
　return ""
}

const Loading = () => (
	<div className="padding-normal text-center">
      <div><Icon type="loading" style={{ fontSize: 24 }} spin /></div>
      <div style={{marginTop: '20px'}}>加载中...</div>
  </div>
)

export const loadComponent = (component) => route => (
	<Bundle load={component}>
        {
            (Component) => Component ? <Component {...route} /> : <Loading/>
        }
    </Bundle>
)



class PrivateRoute extends React.Component {
  componentDidMount() {
    this.addTab();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.path !== nextProps.path
  }
  componentDidUpdate(){
    this.addTab();
  }


  addTab(){
    //if(props.component.name !== 'App'){
      const props = this.props
      const content = document.getElementById('dhb-wrap');
      const scrollTop = content ? content.scrollTop : '';// Math.max(document.body.scrollTop, document.documentElement.scrollTop);

      props.dispatch(addTab({
        // key: props.location.key,
        isActive: true,
        name: props.name,
        path: props.path === '/' ? '/Manager/home' : props.path,
        url: props.location.pathname
      }, scrollTop))
    //}
  }


  render(){
    const {
      isAuthenticated = true,
      component: Component,
      dispatch,
      ...props
    } = this.props;


    return (
      <Route
        {...props}
        render={props =>
          isAuthenticated
            ? <Component {...props} />
            : (
            <Redirect to={{
              pathname: '/login',
              state: { from: props.location }
            }} />
          )
        }
      />
    )
  }
}

export const AuthRoute = connect(state => ({
  isAuthenticated: state.app.auth.isAuthenticated
}))(PrivateRoute)