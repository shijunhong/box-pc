
import {USER_REQUEST, USER_REQUEST_SUCC, USER_REQUEST_FAIL} from '../actions/index'

const initState = {
	list: [],
	isLoading: false,
	msg: ''
};


export default (state = initState, action) => {
	switch(action.type){
		case USER_REQUEST:

			return {
				...state,
				isLoading: true
			}

		case USER_REQUEST_SUCC:

			return {
				...state,
				list: action.data.list,
				isLoading: false
			}

		case USER_REQUEST_FAIL:
			return {
				...state,
				list: [],
				msg: '请求失败',
				isLoading: false
			}

		default:
			return state
	}
}