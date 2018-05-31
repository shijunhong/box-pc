import { combineReducers } from 'redux';
import * as types from '../actions/purchaseAction'

const initIndexState = {
	list: [],
	count: 0,
	isLoading: false,
	msg: ''
};


const index =  (state = initIndexState, action) => {
	switch(action.type){
		case types.PURCHASE_LIST_REQ:
			return {
				...state,
				list: [],
				count: 0,
				isLoading: true
			}

		case types.PURCHASE_LIST_REQ_SUCC:

			return {
				...state,
				...action.data.data,
				count: Number(action.data.data.count),
				isLoading: false
			}

		case types.PURCHASE_LIST_REQ_FAIL:
			return {
				...state,
				list: [],
				count: 0,
				msg: '请求失败',
				isLoading: false
			}

		default:
			return state
	}
}


const initGoodsDetailState = {
	data: [],
	count: {},
	isLoading: false,
	msg: '',
	total: 0,
};
const goodsDetail = (state = initGoodsDetailState, action) => {
	switch (action.type) {
		case types.PURCHASE_GOODS_DETAIL_REQ:
			return {
				...state,
				data:[],
				total: 0,
				isLoading: true
			}
		case types.PURCHASE_GOODS_DETAIL_REQ_SUCC:
			return {
				...state,
				...action.data.data,
				isLoading: false,
			}
		case types.PURCHASE_GOODS_DETAIL_REQ_FAIL:
			return {
				...state,
				data: [],
				count: {},
				total: 0,
				msg: '请求失败',
				isLoading: false
			}
		default:
			return state
	}
}


export default combineReducers({index, goodsDetail})