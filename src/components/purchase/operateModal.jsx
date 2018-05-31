
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import axios from 'UTILS/http';

import { Modal, Input, Icon, message } from 'antd'

const TextArea = Input.TextArea

export default class extends Component{
    static defaultProps = {
        visible: false
    }
    static propTypes = {
        visible: PropTypes.bool.isRequired
    }

    state = {
        modalRemark: ''
    }

    // 审核弹框配置
    modalcfg(type, detail) {
        const { modalRemark } = this.state
        const {refresh} = this.props
        switch (type) {
            case 'approved':
                return {
                    title:'通过审核',
                    head: `确定要通过审核订单：${detail.main.purchase_num}？并填写操作日志备注`,
                    onOk: ()=> {
                        axios.post(`Api/v1/purchases/${detail.main.purchase_id}/throughed`,{
                            id: detail.main.purchase_id,
                            remark: modalRemark
                        })
                            .then( res => {
                                console.log('res',res)
                                if(res.status === 'T') {
                                    message.success(res.data.message)
                                    this.cancel()
                                    refresh(detail.main)
                                }
                            })
                    }
                }
                break;
            case 'cancel':
                return {
                    title:'取消订单',
                    head: `请输入取消原因，不少于4个字`,
                    onOk: () => {
                        if(modalRemark.length < 4) {
                            message.error('原因不能少于4个字')
                            return false
                        }
                        axios.post(`Api/v1/purchases/${detail.main.purchase_id}/cancel`,{
                            id: detail.main.purchase_id,
                            remark: modalRemark
                        })
                            .then( res => {
                                console.log('res',res)
                                if(res.status === 'T') {
                                    message.success(res.data.message)
                                    this.cancel()
                                    refresh(detail.main)
                                }
                            })
                    }
                }
                break;
            case 'undo':
                return {
                    title:'撤销审核',
                    head: `请输入撤销原因，不少于4个字`,
                    onOk: () => {
                        if(modalRemark.length < 4) {
                            message.error('原因不能少于4个字')
                            return false
                        }
                        axios.post(`Api/v1/purchases/${detail.main.purchase_id}/unthroughed`,{
                            id: detail.main.purchase_id,
                            remark: modalRemark
                        })
                            .then( res => {
                                console.log('res',res)
                                if(res.status === 'T') {
                                    message.success(res.data.message)
                                    this.cancel()
                                    refresh(detail.main)
                                }
                            })
                    }
                }
                break;
            default:
                return null
                break;
        }
    }

    // 审核框 input
    textInput = (e) => {
        let value = e ? e.target.value : ''
        this.setState({
            modalRemark: value
        })
    }

    cancel = () => {
        const { onCancel } = this.props
        this.textInput()
        onCancel()
    }

    render(){
        const { visible, modalType, detail } = this.props
        const modalcfg = this.modalcfg(modalType, detail)
        return (
            <Modal 
                title={modalcfg.title}
                visible={visible}
                onCancel={this.cancel}
                onOk={modalcfg.onOk}
            >
                <p>
                    <Icon type="exclamation-circle" style={{color: '#FAAD14'}} />
                    &nbsp;
                    <span>
                        {modalcfg.head}
                    </span>
                </p>
                <div>
                    <TextArea onChange={this.textInput} value={this.state.modalRemark} autosize={{ minRows: 3, maxRows: 3 }} />
                </div>
            </Modal>
        )
    }
}


