/**
 * 所有公共action
 */
// 示例
export const USER_REQUEST = 'user_request';
export const USER_REQUEST_SUCC = 'user_request_succ';
export const USER_REQUEST_FAIL = 'user_request_fail';

// 选项卡
export const ADD_TAB = 'add_tab';
export const CLOSE_TAB = 'close_tab';

// 表格列配置
export const TABLE_COLUMN_REQ_SUCC = 'purchase_column_req_cucc';
export const TABLE_COLUMN_REQ_FAIL = 'purchase_column_req_fail';

export const TABLE_COLUMN_SAVE_SUCC = 'purchase_column_save_cucc';
export const TABLE_COLUMN_SAVE_FAIL = 'purchase_column_save_fail';

// 供应商
export const SUPPLIER_REQ_SUCC = 'supplier_req_cucc';
export const SUPPLIER_REQ_FAIL = 'supplie_req_fail';

// 客户
export const CLIENT_REQ_SUCC = 'client_req_cucc';
export const CLIENT_REQ_FAIL = 'client_req_fail';

// 员工
export const STAFF_REQ_SUCC = 'STAFF_REQ_SUCC';
export const STAFF_REQ_FAIL = 'STAFF_REQ_FAIL';

// 商品
export const GOODS_REQ_SUCC = 'GOODS_REQ_SUCC';
export const GOODS_REQ_FAIL = 'GOODS_REQ_FAIL';

// 系统配置数据
export const SETTING_REQ_SUCC = 'setting_req_cucc';
export const SETTING_REQ_FAIL = 'setting_req_fail';

// 获取筛选项默认数据
export const CONDITION_REQ_SUCC = 'CONDITION_REQ_SUCC';
export const CONDITION_REQ_FAIL = 'CONDITION_REQ_FAIL';


export const addTab = (tab, scrollTop) => {
	return {
		type: ADD_TAB,
		tab,
		scrollTop
	}
}
export const closeTab = (tab, history, notPush) => {
	return {
		type: CLOSE_TAB,
		tab,
		history,
        notPush
	}
}

// 筛选项默认数据
export const getCondition = (params = {}) => {
    return {
        types: [null, CONDITION_REQ_SUCC, CONDITION_REQ_FAIL],
		promise: axios => axios.get('Api/v1/search/conditions', { params })
    }
}

// 表格配置
export const getTableConfig = (tableName) => {
    return {
        types: [null, TABLE_COLUMN_REQ_SUCC, TABLE_COLUMN_REQ_FAIL],
		promise: axios => axios.get(`Api/v1/setting/columns/${tableName}`),
		tableName: tableName
    }
}
// 表格配置更新
export const saveTableConfig = (tableName, data = {}) => {
    return {
        types: [null, TABLE_COLUMN_SAVE_SUCC, TABLE_COLUMN_SAVE_FAIL],
		promise: axios => axios.post(`Api/v1/setting/columns/${tableName}`, data),
		tableName: tableName,
		columns: JSON.parse(data.columns)
    }
}

// 获取弹窗供应商
export const getSuppliers = ( params = {}) => {
    return {
        types: [null, SUPPLIER_REQ_SUCC, SUPPLIER_REQ_FAIL],
		promise: axios => axios.get(`Api/v1/suppliers/dialogLists`, { params })
    }
}

// 获取客户
export const getClient = ( params = {}) => {
    return {
        types: [null, CLIENT_REQ_SUCC, CLIENT_REQ_FAIL],
		promise: axios => axios.get('Api/v1/client', { params })
    }
}

// 获取员工
export const getStaff = ( params = {}) => {
    return {
        types: [null, STAFF_REQ_SUCC, STAFF_REQ_FAIL],
		promise: axios => axios.get('Api/v1/staffs/dialogLists', { params })
    }
}

// 获取商品
export const getGoods = ( params = {}) => {
    return {
        types: [null, GOODS_REQ_SUCC, GOODS_REQ_FAIL],
		promise: axios => axios.get('Api/v1/goods/dialogLists', { params })
    }
}

// 获取系统设置 配置项
export const getSetting = ( params = {}) => {
    return {
        types: [null, SETTING_REQ_SUCC, SETTING_REQ_FAIL],
		promise: axios => axios.get(`Api/v1/setting`, { params })
    }
}

export const getUser = () => {
    return {
        types: [USER_REQUEST, USER_REQUEST_SUCC, USER_REQUEST_FAIL],
        promise: axios => axios.get(`user.json`)
    }
}
