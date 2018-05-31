import axios from 'axios';
import qs from 'qs'
import { message } from 'antd';
import { triggerRefresh, DHB_API } from 'UTILS/utils';

let loginData = JSON.parse(window.sessionStorage.getItem('_loginData') || window.localStorage.getItem('loginData') || '{"accounts":{},"company":{}}')
let access_token = loginData.access_token ? loginData.access_token.access_token : '';
let refresh_token = loginData.access_token ? loginData.access_token.refresh_token : '';

let _hideMessage;
let is_refresh_token = false;

let count = 0

if(navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")){
	window.localStorage.setItem('loginData', JSON.stringify(loginData))
}


const instance = axios.create({
	timeout: 30000,
	baseURL: DHB_API,

	// withCredentials: true,
	data: {
		access_token: access_token
	},
	params: {
		access_token: access_token
	},
	headers: { 
		'Content-Type': 'application/x-www-form-urlencoded', 
		//'Authorization': access_token, // loginData.access_token.access_token
		// 'X-Requested-With': 'XMLHttpRequest'
	},

	transformRequest: [function (data, headers) {
		// console.log(arguments)
    	return qs.stringify(data);
	}]
})

const refreshToken = () => {
	return instance.post('Auth/OAuth2/managerToken', {
		client_id: '2',
		grant_type: 'refresh_token',
		client_secret: 's123oXiFY7wrjZiUQ658el4DSrtcWz9SZqBfX5Pw',
		refresh_token
	}, {
		baseURL: LOGIN_API
	})
	.then(res => {
		console.log('refresh success',res)

		is_refresh_token = false;
		access_token = loginData.access_token.access_token  = res.access_token;
		refresh_token = loginData.access_token.refresh_token = res.refresh_token;

		instance.defaults.data.access_token = access_token;
		instance.defaults.params.access_token = access_token;

		if(triggerRefresh){
			count === 0 && triggerRefresh()
			count++
		}

		window.localStorage.setItem('loginData', JSON.stringify(loginData))
	})
	.catch(error => {
		/* for (let key of Object.keys(error)) {
			console.log('refresh fail',key,error[key])
		} */
		const { response } = error;
		if(error.response && error.response.status === 400){
			//window.localStorage.removeItem('loginData')
			window.location.href = response.data.error.redirect_url;
		}
	})
}

instance.interceptors.request.use(config => {
	if(!_hideMessage){
		_hideMessage = message.loading(config.method === 'get' ? '加载中...' : '执行中...', 0);
	}
	/*if(is_refresh_token && !config.isRefresh){
		
	}*/
	
	return config
}, error => {
	return Promise.reject(error)
})


instance.interceptors.response.use(res => {
	_hideMessage && _hideMessage()
	_hideMessage = null;
	if(typeof res.data === 'string'){
		document.documentElement.innerHTML = res.data
	}
	return res.data
}, error => {
	const { response = {} } = error
	const { data, status } = response;

	if(status === 401 && !is_refresh_token){
		is_refresh_token = true;
		refreshToken();
	}
	if(status === 400 && data.error && data.error.redirect_url){
		//window.localStorage.removeItem('loginData')
		window.location.href = data.error.redirect_url;
	}

	if(data && data.error && data.error.message){
		message.error(data.error.message, 3)
	}

	_hideMessage && _hideMessage()
	_hideMessage = null;
	return Promise.reject(error)
})

export default instance