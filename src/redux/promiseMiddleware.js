import axios from 'UTILS/http';

export default  store => next => action => {
    const {dispatch, getState} = store;

    // 如果action是一个function，执行该函数 参考 redux-thunk
    if (typeof action === 'function') {
        action(dispatch, getState);
        return;
    }
    // 解析action
    const { promise, types, afterSuccess, ...rest} = action;

    // 没有promise，此next就是createStore 返回的store对象的dispatch！
    if (!action.promise) {
        return next(action);
    }

    // 获取 types
    const [REQUEST, SUCCESS, FAILURE] = types;

    // 开始请求
    if(REQUEST){
        next({
            ...rest,
            type: REQUEST
        });
    }
    

    // 请求成功
    const onResolve = res => {
        next({
            ...rest,
            data: res,
            type: SUCCESS
        });
        if (afterSuccess) {
            afterSuccess(dispatch, getState, res);
        }
    };

    // 请求失败
    const onRejected = error => {
        next({
            ...rest,
            error,
            type: FAILURE
        });
    };

    return promise(axios).then(onResolve, onRejected).catch(error => {
        onRejected(error)
    })
}