
import { combineReducers } from 'redux';

import * as types from '../actions/index';

const initGlobalStage = {
	mode: 'vertical',
	theme: 'light',
}

const initAuth = {
	isAuthenticated: true
}

const globalData = (state = initGlobalStage, action) => {
	switch(action.type){
		default:
			return state
	}
}

const initTableConfig = {}
const tableConfig = (state = initTableConfig, action) => {
	const { tableName } = action;
	switch(action.type){
		case types.TABLE_COLUMN_REQ_SUCC:
			return {
				...state,
				[tableName]: action.data.data
			}

		case types.TABLE_COLUMN_SAVE_SUCC:
			return {
				...state,
				[tableName]: action.columns
			}

		default:
			return state
	}
}

/**
 * 筛选项数据
 */
const initConditionState = {}
const condition = (state = initConditionState, action) => {

	switch(action.type){
		case types.CONDITION_REQ_SUCC:
			return {
				...state,
				...action.data.data
			}

		case types.CONDITION_REQ_FAIL:
			return {}

		default:
			return state
	}
}

/**
 * 供应商弹窗数据
 */
const initDialogSupplier = {
	list: [],
	count: 0,
	isLoading: false,
	msg: ''
}
const dialogSupplier = (state = initDialogSupplier, action) => {

	switch(action.type){
		case types.SUPPLIER_REQ_SUCC:
			return {
				...state,
				...action.data.data,
				count: Number(action.data.data.count || 0),
				isLoading: false
			}

		case types.SUPPLIER_REQ_FAIL:
			return {
				list: [],
				count: 0,
				isLoading: false
			}

		default:
			return state
	}
}
/**
 * 客户数据
 */
const initClientState = {
	list: [],
	count: 0,
	isLoading: false,
	msg: ''
}
const client = (state = initClientState, action) => {

	switch(action.type){
		case types.CLIENT_REQ_SUCC:
			return {
				...state,
				...action.data.data,
				count: Number(action.data.data.count || 0),
				isLoading: false
			}

		case types.CLIENT_REQ_FAIL:
			return {
				list: [],
				count: 0,
				isLoading: false
			}

		default:
			return state
	}
}
/**
 * 员工数据
 */
const initStaffState = {
	list: [],
	count: 0,
	isLoading: false,
	msg: ''
}
const staff = (state = initStaffState, action) => {

	switch(action.type){
		case types.STAFF_REQ_SUCC:
			return {
				...state,
				...action.data.data,
				count: Number(action.data.data.count || 0),
				isLoading: false
			}

		case types.STAFF_REQ_FAIL:
			return {
				list: [],
				count: 0,
				isLoading: false
			}

		default:
			return state
	}
}
/**
 * 商品数据
 */
const initGoodsState = {
	list: [],
	count: 0,
	isLoading: false,
	msg: ''
}
const goods = (state = initGoodsState, action) => {

	switch(action.type){
		case types.GOODS_REQ_SUCC:
			return {
				...state,
				...action.data.data,
				count: Number(action.data.data.count || 0),
				isLoading: false
			}

		case types.GOODS_REQ_FAIL:
			return {
				list: [],
				count: 0,
				isLoading: false
			}

		default:
			return state
	}
}

const initSysConfig = {}
const sysConfig = (state = initSysConfig, action) => {

	switch(action.type){
		case types.SETTING_REQ_SUCC:
			return {
				...state,
				...action.data.data
			}

		case types.SETTING_REQ_FAIL:
			return {
				list: {}
			}

		default:
			return state
	}
}

/**
 * @Author zyt
 * @Date   2018-01-08
 * @param  {[type]}   tabs [description]
 * @param  {[type]}   tab  [description]
 * @return {[type]}        [description]
 */
const addTab = (tabs, tab, scrollTop) => {
	let index = tabs.findIndex(item => item.path === tab.path);

	tabs.find(item => {
		
		if(item.isActive){
			item.isActive = false;
			item.scrollTop = scrollTop;
			return true;
		}
	});

	if(index > -1){
		tabs[index].isActive = true;
		Object.assign(tabs[index], tab)
		return [...tabs];
	}

	return [...tabs, tab];
}
/**
 * @Author zyt
 * @Date   2018-01-08
 * @param  {[type]}   tabs [description]
 * @param  {[type]}   key  [description]
 * @return {[type]}        [description]
 */
const closeTab = (tabs, tab, history, notPush) => {

	let _index = 0;

	if( tab === 'close_all' ){
		history.push('/Manager/home');
		return initTabs;
	}
	if(typeof tab === 'string'){
		tab = tabs.find(item => item.path === tab)
	}
	const _tabs = [...tabs.filter((item, index) => {
		if(item.path !== tab.path){
			return true
		}
		_index = index;
		return false;
	})];

	// Reducers may not dispatch actions.
	if(tab.isActive && !notPush){
		let nextTab/*, search*/; //
		const _location = {}
		if(_index > 1){
			nextTab = tabs[_index - 1]
		}
		else if(_index === 1 && _tabs.length > 1){
			nextTab = tabs[_index + 1]
		}
		else{
			nextTab = {url: '/Manager/home'}
		}
		nextTab.isActive = true
		history.push(nextTab.url)
	}
	
	return _tabs;
}

const initTabs = [{isActive: true,name: "",path: "/Manager/home",url: "/",scrollTop: 0}];
const tabs = (state = initTabs, action) => {
	switch(action.type){
		case types.ADD_TAB:
			const _tabs1 = addTab(state, action.tab, action.scrollTop);

			window.localStorage.setItem('_tabs_', JSON.stringify(_tabs1))
			
			return _tabs1

		case types.CLOSE_TAB:
			const _tabs2 = closeTab(state, action.tab, action.history, action.notPush)
			window.localStorage.setItem('_tabs_', JSON.stringify(_tabs2))
			return _tabs2

		default:
			return state
	}
}

const auth = (state = initAuth, action) => {
	return state;
}


export default combineReducers({globalData, condition, sysConfig, dialogSupplier, client, staff, goods, tableConfig, auth, tabs});