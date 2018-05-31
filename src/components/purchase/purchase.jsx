import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'

import axios from 'UTILS/http'

import { closeTab } from 'REDUX/actions/index';

import { 
    Breadcrumb, Row, Col, DatePicker, Input, InputNumber, Icon, Select, Tooltip,
    Table, Button, Divider, Modal, message
} from 'antd'

import { getCondition } from 'REDUX/actions/index'
import ChooseGoods from 'PAGES/filter/goods'
import ChooseSupplier from 'PAGES/filter/supplier'
import ChooseStaff from 'PAGES/filter/staff'
import Remark from 'PAGES/common/remark'
import Footer from 'PAGES/common/footer'

const Option = Select.Option
const { TextArea } = Input;

const renderContent = (value, row, index) => {
    const obj = {
      children: value,
      props: {},
    };
    if (row.last) {
      obj.props.colSpan = 0;
    }
    return obj;
};

class PurchaseManager extends Component{

    static _list = [{key: 'auto'},{key: 'last', last: true}]
    // 表格列配置
	columns = [
        {
            width: 50,
            dataIndex: 'sequence',
            render: (text, record, index) => {
                return record.last ? '合计' : index + 1;
            }
        },
        {
            width: 80,
            title: '操作',
            dataIndex: 'operate',
            render: (text, row, index) => {
                if(row.last) return null;
                return (
                    <div>
                        <Icon onClick={this.plus} className="tr-plus" type="plus" />
                        <Icon onClick={this.minus.bind(this, index)} type="minus" />
                    </div>
                )
            }
        }, 
        { width: 240, title: '商品', dataIndex: 'goods_name', render: (text, record) => {
            if(record.last){
                return this.state.list.filter(item => !!item.goods_name).length + '种'
            }else if(!this.state.supplier_id){
                return <div style={{color: '#ccc'}}>请先选择供应商</div>
            }

            return record.goods_name ? 
                (<div>
                    <img className="list-goods-pic" src={record.goods_picture} alt=""/>
                    <div className="ellipsis">{record.goods_name}</div>
                </div>)
                : <ChooseGoods choosed={this.choosed} onChange={this.goodsMultiChoose} />
        }}, 
        { width: 120, title: '规格', dataIndex: 'options_name', render: (text, row, index) => {
            const obj = {
                children: text,
                props: {}
            };

            if (row.last) {
                obj.props.colSpan = 4;
            }
            return obj;
        }}, 
        { width: 120, title: '单位（负）', dataIndex: 'base_units', render: renderContent }, 
        { width: 120, title: '可售库存', dataIndex: 'stock_name', render: renderContent }, 
        { width: 120, title: '辅助数量', dataIndex: 'status_name',
            render: (text, record, index) => {
                if(record.last){
                    return renderContent(text, record, index);
                }
                if(!record.base_units || !record.num){
                    return ''
                }
   
                if(record.container_units){
                    return Math.floor(record.num / record.conversion_number) + record.container_units + '+' + (record.num % record.conversion_number) + record.base_units
                }
                return record.num + record.base_units;
            } 
        }, 
        { width: 120, title: '订购数量', dataIndex: 'num', render: (text, row) => row.last ? null : <InputNumber min={0} onChange={this.numChange.bind(this, row)} value={row.num} /> }, 
        { width: 120, title: '单价', dataIndex: 'price' }, 
        { width: 120, title: '小计', className: "text-right", dataIndex: 'total', render: (text, record) => {
            return record.last || !record.goods_name ? null : record.num * record.price
        } }, 
        {
            title: '备注',
            dataIndex: 'remark',
            render: (text, record) => {
                return record.last || !record.goods_name ? null : <Remark text={record.remark} onSure={this.goodsRemark.bind(this, record)} />
            
            }
        }
    ];
    choosed = []
    
    state = {
        showModal: true,
        showRemark: false,
        isLoading: false,
        stock_id: undefined,
        detail: {},
        list: PurchaseManager._list
    }
    params = {}

    refArr = []

    setRefs = (ref) => {
        if(this.refArr.findIndex(item => item === ref) === -1){
            this.refArr.push(ref)
        }
    }
    goodsRemark(row, value){
        const list = [...this.state.list]
        row.remark = value;
        this.setState({
            list
        })
    }
    numChange(row, value){
        const list = [...this.state.list]
        row.num = value;
        this.setState({
            list
        })
    }
    plus = () => {
        const list = [...this.state.list]
        list.splice(list.length - 1, 0 , {key: 'auto' + list.length + ''})
        this.setState({ list })
    }
    minus(index){
        const list = [...this.state.list]
        if(list.length > 2){
            if(index < this.choosed.length){
                this.choosed.splice(index, 1)
            }
            list.splice(index, 1)
            this.setState({ list })
        }
    }
    goodsMultiChoose = (choosed) => {
        this.choosed = choosed;
        const list = [...choosed];
        
        list.push({ key: 'auto' })
        list.push({ key: 'last',last: true })

        //PurchaseManager._list = list

        this.setState({list})
    }

    setParams(prop, value){
        if(prop === 'supplier_id'){
            this.setState({
                supplier_id: value ? value[0].base_client_id : '',
                // 清空已选择商品
                list: PurchaseManager._list
            })
        }else if(prop === 'staff_id'){
            this.setState({
                staff_id: value ? value[0].staff_id : ''
            })
        }
        
        if(value){
            this.params[prop] = value[0][prop] || value[0].base_client_id
            return
        }
        delete this.params[prop]
    }

    dateChange = (date, dateString) => {
        this.params.delivery_date = dateString
    }
    getTableFooter = () => {
        let total = 0;
        this.choosed.forEach(item => {
            total += (item.num * item.price)
        })
        return (
            <div className="text-right">本单总额：<span className="theme-color">￥{total.toFixed(2)}</span></div>
        )
    }
    handleCancel = () => {
        this.setState({showModal: false})
    }
    handlerGoods(){
        const goods = []
        this.choosed.forEach(item => {
            goods.push({
                goods_id: item.goods_id,
                options_id: item.isSpec ? '0' : item.options_id, // 不是多规格商品 传入0
                num: item.num,
                remark: item.remark,
                price: item.price
            })
        })
        return goods;
    }
    jump(){
        const { history, match, closeTab } = this.props
        closeTab(match.path, history, true)
        history.push('/Manager/Purchase/lists')
    }
    save = () => {
        const type = this.props.match.params.id
        if(type === 'add' && !this.params.supplier_id){
            message.warn('请选择供应商')
            return;
        }
        if(type === 'add' && !this.params.staff_id){
            message.warn('请选择采购员')
            return;
        }

        if(this.choosed.length === 0){
            message.warn('商品不能为空')
            return;
        }
        this.toggleLoading()
        if(type !== 'add'){
            this.update()
            return;
        }
        
        

        this.params.goods = JSON.stringify(this.handlerGoods())

        axios.post('Api/v1/purchases', this.params)
        .then(res => {
            if(res.status === 'T'){
                message.info('保存成功')
                this.jump()
            }
        })
        .catch(() => {
            this.toggleLoading()
        })
    }
    toggleLoading(){
        this.setState({isLoading: !this.state.isLoading})
    }
    update(){
        const { detail, remark, internal_comtion } = this.state
        const params = {
            goods: JSON.stringify(this.handlerGoods()),
            remark, 
            internal_comtion
        }

        axios.post(`Api/v1/purchases/${detail.purchase_id}/updateGoods`, params)
        .then(res => {
            if(res.status === 'T'){
                message.info('修改成功')
                this.jump()
            }
        })
        .catch(() => {
            this.toggleLoading()
        })
  
    }
    onSelectChange(prop, value) {
        this.params[prop] = value;
        this.setState({
            [prop]: value
        })
    }
    toggleRemark(remarkType){
        this.setState({
            remarkType,
            showRemark: !this.state.showRemark
        })
    }
    remarkChange = (e) => {
        const { value } = e.target
        const { remarkType } = this.state // remark // internal_comtion
        
        this[remarkType] = value
    }
    sureRemark = () => {
        const { remarkType } = this.state

        this.params[remarkType] = this[remarkType]
        this.setState({
            [remarkType]: this[remarkType],
            showRemark: false
        })
    }
    // 获取详情
    getInfo(id){
        axios.get(`Api/v1/purchases/${id}`)
        .then((res) => {
            this.choosed = res.data.list;
            this.choosed.forEach(item => {
                item.num = item.number * 1
                if(item.options_id === '0'){
                    item.options_id = item.goods_id
                    item.isSpec = true
                }
            })

            const list = [...this.choosed];
            const detail = res.data.main
            
            list.push({ options_id: 'auto' })
            list.push({ options_id: 'last',last: true })

            this.setState({
                supplier_id: res.data.main.supplier_id,
                list,
                detail,
                remark: detail.remark,
                internal_comtion: detail.internal_comtion
            })
        })
        
    }
    componentDidMount(){
        const { getCondition, condition, match } = this.props
        if(match.params.id !== 'add'){
            this.getInfo(match.params.id)
            return
        }
        !condition.purchase && getCondition({
            purchase: ['stock', 'status', 'pay_status', 'goods_category']
        })
    }

    render(){
        const { list, stock_id, showRemark, remarkType, remark, internal_comtion, supplier_id, staff_id, detail, isLoading } = this.state
        const { condition, match } = this.props
        const isAdd = match.params.id === 'add'

        return (
            <div className="fixed-footer-offset">
                <Modal
                    visible={showRemark}
                    title={remarkType === 'remark' ? '订单备注' : '内部沟通'}
                    onCancel={this.toggleRemark.bind(this)}
                    onOk={this.sureRemark}
                    destroyOnClose={true}
                > 
                    <TextArea rows={4} defaultValue={this.state[remarkType]} onChange={this.remarkChange} />
                </Modal>

                
                <div className="dhb-bread">
                    <span className="dhb-bread-title">{match.params.id === 'add' ? '新增' : '编辑'}采购单</span>
                    <Breadcrumb>
                        <Breadcrumb.Item><NavLink to="/Manager/home">首页</NavLink></Breadcrumb.Item>
                        <Breadcrumb.Item>库存</Breadcrumb.Item>
                        <Breadcrumb.Item><NavLink to="/Manager/Purchase/lists">采购订单</NavLink></Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="padding-normal">
                    {isAdd
                    ?
                    <div  className="filter-wrap">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Row>
                                    <Col span={2} className="dhb-label-text">*</Col>
                                    <Col span={22}>
                                        <Tooltip placement="top" visible={!supplier_id} title="请先选择供应商" getPopupContainer={() => document.getElementById('dhb-wrap')}>
                                            <ChooseSupplier defaultValue={supplier_id} onChange={this.setParams.bind(this, 'supplier_id')} showTip={true} />
                                        </Tooltip>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={6}>
                                <Row>
                                    <Col span={2} className="dhb-label-text">*</Col>
                                    <Col span={22}>
                                        <ChooseStaff defaultValue={staff_id} ref={this.setRefs} onChange={this.setParams.bind(this, 'staff_id')} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={6}>
                                <Select
                                    showSearch
                                    value={stock_id}
                                    placeholder="选择入库仓库"
                                    defaultActiveFirstOption={false}
                                    filterOption={false}
                                    onChange={this.onSelectChange.bind(this, 'stock_id')}
                                >
                                    {
                                        condition.purchase ? (condition.purchase.stock || []).map(item => (
                                            <Option key={item.stock_id} value={item.stock_id}>{item.stock_name}</Option>
                                        ))
                                        : null
                                    }
                                </Select>
                            </Col>
                            <Col span={6}>
                                <DatePicker onChange={this.dateChange} style={{width: '100%'}} placeholder="选择交货日期" />
                            </Col>
                        </Row>
                    </div>
                    :
                    <Row gutter={12} style={{marginBottom: '20px'}}>
                        <Col span={8}>供应商：{detail.supplier_name}</Col>
                        <Col span={4}>采购员：{detail.staff_name}</Col>
                        <Col span={6}>仓库：{detail.stock_name}</Col>
                        <Col span={6}>交货日期：{detail.delivery_date}</Col>
                    </Row>
                    }
                    <Table bordered dataSource={list} size="middle"
                        columns={this.columns} pagination={false} footer={this.getTableFooter} />

                    <Divider />
                    <div style={{fontSize: '18px'}}>单据备注</div>
                    <div className="order-remark">订单备注： <Icon className="pointer" type="edit" onClick={this.toggleRemark.bind(this, 'remark')} /> {remark}</div>
                    <div className="order-remark">内部沟通： <Icon className="pointer" type="edit" onClick={this.toggleRemark.bind(this, 'internal_comtion')} /> {internal_comtion}</div>
                </div>
                <Footer>
                    <Row>
                        <Col span={12}>
                            <Button className="icon-btn hide" icon="download">导入</Button>
                            <Tooltip placement="top" title="打印">
                                <Button className="icon-btn hide" icon="printer" />
                            </Tooltip>
                        </Col>
                        <Col span={12} className="text-right">
                            <Button className="icon-btn" onClick={this.jump.bind(this)}>取消</Button>
                            <Button type="primary" loading={isLoading} onClick={this.save}>确定</Button>
                        </Col>
                    </Row>
                </Footer>
            </div>
        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    condition: state.app.condition
})

const mapDispatchToProps = {
    getCondition,
    closeTab
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseManager)
