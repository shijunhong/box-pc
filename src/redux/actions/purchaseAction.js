export const PURCHASE_LIST_REQ = 'purchase_list_req';
export const PURCHASE_LIST_REQ_SUCC = 'purchase_list_req_cucc';
export const PURCHASE_LIST_REQ_FAIL = 'purchase_list_req_fail';

export const PURCHASE_GOODS_DETAIL_REQ = 'purchase_goods_detail_req'
export const PURCHASE_GOODS_DETAIL_REQ_SUCC = 'purchase_goods_detail_req_succ'
export const PURCHASE_GOODS_DETAIL_REQ_FAIL = 'purchase_goods_detail_req_fail'

export const getPurchaseList = (params = {}) => {
    return {
        types: [PURCHASE_LIST_REQ, PURCHASE_LIST_REQ_SUCC, PURCHASE_LIST_REQ_FAIL],
        promise: axios => axios.get('Api/v1/purchases', {params})
    }
}

export const getPurchaseGoodsDetail = ( params = {}) => {
    return {
        types: [PURCHASE_GOODS_DETAIL_REQ, PURCHASE_GOODS_DETAIL_REQ_SUCC, PURCHASE_GOODS_DETAIL_REQ_FAIL],
        promise: axios => axios.get(`/Api/v1/purchases/goodsDetail${params.combine}`,{params})
    }
}