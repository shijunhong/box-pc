import React, { Component } from 'react';

import { connect } from 'react-redux'

import { NavLink } from 'react-router-dom'

import DHBTable from '../common/table';
import Footer from 'PAGES/common/footer'
import TableSet from '../common/table_field_set';

import { PAGE_SIZE, setRefresh, removeRefresh, setPageSize } from 'UTILS/utils'
import axios from 'UTILS/http';
import { getPurchaseList } from 'REDUX/actions/purchaseAction'
import { getTableConfig, saveTableConfig, getCondition} from 'REDUX/actions/index'

import Detail from "./detail";
import ChooseSupplier from '../filter/supplier'
import ChooseStaff from 'PAGES/filter/staff'
import OperateModal from './operateModal'
import moment from 'moment';

import Pagination from 'PAGES/common/pagination'

import { 
    Breadcrumb,Popover, Tooltip, DatePicker, Dropdown, Menu, message, Icon, Button, Row, Col, Select, 
    Input, Divider, Popconfirm, Checkbox, Tag, Tabs, Modal
} from 'antd';

const RangePicker = DatePicker.RangePicker
const Option  = Select.Option
const TextArea = Input.TextArea

class PurchaseIndex extends Component{
    static tableName = 'business_purchase'
    static filter = {
        expand: false
    }
    // 列选择配置
    static selectedRowKeys = null;
    // 查询参数
    static params = {
        page: 0,
        pageSize: PAGE_SIZE
    }
    // 表格列配置
	columns = [
        {
            title: <Icon className="pointer" type="setting" />,
            width: 50,
            dataIndex: 'sequence',
            onHeaderCell: () => {
                return {
                    onClick: () => {
                        this.toggleTableSet()
                    }
                }
            },
            render: (text, record, index) => {
                return index + 1;
            }
        },
        {
            width: 130,
            dataIndex: 'purchase_num',
            className: 'stop-bubble pointer',
            onCell: (record) => {
                return {
                    onClick: (e) => {
                        this.getInfo(record)
                    }
                }
            },
        }, 
        { width: 120, dataIndex: 'create_date'}, 
        { width: 200, dataIndex: 'supplier_name'}, 
        { width: 120, dataIndex: 'staff_name' }, 
        { width: 120, dataIndex: 'stock_name' }, 
        { width: 120, dataIndex: 'status_name' }, 
        { width: 120, dataIndex: 'pay_status_name' }, 
        { className: 'text-right', dataIndex: 'total' }, 
        {
            // fixed: 'right',
            dataIndex: 'operate',
            render: (text, record) => {
                return (
                    <div>
                        <a className="list-link stop-bubble" onClick={() => {this.getInfo(record)}}>查看</a>
                        <Divider type="vertical" />
                        {record.status === 'pending' ?
                            <React.Fragment>
                                <a className="list-link" onClick={this.getCheck.bind(this, 'approved', {main: record})}>审核</a>
                                <Divider type="vertical" />
                                <a className="list-link" onClick={this.getCheck.bind(this, 'cancel', {main: record})}>取消</a>
                            </React.Fragment>
                            : null
                        }
                        
                        {/* <Dropdown placement="bottomRight" overlay={
                            <Menu>
                                <Menu.Item key="1">付款</Menu.Item>
                                <Menu.Item key="2">收货</Menu.Item>
                                <Menu.Item key="3">取消</Menu.Item>
                            </Menu>
                            }
                        >
                            <a className="list-link">更多<Icon type="down" /></a>
                        </Dropdown> */}
                    </div>
                );
            }
        }
    ];

    state = {
        showInfo: false,
        comfirmLoading: false,
        pageSize: PAGE_SIZE,
        visibleTableSet: false,
        expandFilter: PurchaseIndex.filter.expand,
        selectedRowKeys: PurchaseIndex.selectedRowKeys,
        kw: PurchaseIndex.params.kw,
        status: PurchaseIndex.params.status,
        pay_status: PurchaseIndex.params.pay_status,
        supplier_id: PurchaseIndex.params.supplier_id,
        staff_id: PurchaseIndex.params.staff_id,
        stock_id: PurchaseIndex.params.stock_id,
        delivery_date: PurchaseIndex.params.delivery_date || null,
        delivery_date_end: PurchaseIndex.params.delivery_date_end || null,
        showCheck: false,
        modalType: 'cancel',
    };

    refArr = []

    componentDidMount(){
        const { purchase } = this.props
        const { getCondition, condition } = this.props

        setRefresh(() => {
			this.refresh()
        });

        
        !condition.purchase && getCondition({
            purchase: ['stock', 'status', 'pay_status', 'goods_category']
        })

        if(purchase.index.count > 0){
            return
        }

        this.getList()
        this.getTableConfig()
    }
    componentWillUnmount() {
        removeRefresh();
    }

    setRefs = (ref) => {
        if(this.refArr.findIndex(item => item === ref) === -1){
            this.refArr.push(ref)
        }
    }
    // 审核弹框
    getCheck( type, record ) {
        const { detail } = this.props
        console.log(detail)
        this.setState({
            showCheck: true,
            modalType: type,
            record
        })
    }
    closeModal = () => {
        this.setState({
            showCheck: false,
        })
    }

    bindColumnsContext(purchaseTableConfig){
        let temp;
        purchaseTableConfig.forEach((item, index) => {
            item.dataIndex = item.column;
            temp = this.columns.find(item2 => item.column === item2.dataIndex);
            if(temp){
                Object.assign(item, temp)
            }
            //item.fixed = item.fixed === 'T'
        })
        return purchaseTableConfig
    }
    // 表格配置获取
    getTableConfig(){
        const { getTableConfig, purchaseTableConfig } = this.props
        if(purchaseTableConfig){
            return
        }
        getTableConfig(PurchaseIndex.tableName);
    }
    
    // 列表
    getList(){
        const { getPurchaseList } = this.props
        getPurchaseList(PurchaseIndex.params);
    }
    // 刷新
    refresh = (detailMain) =>{
        //this.clear()
        debugger
        this.getList()
        if(detailMain){
            this.getInfo(detailMain)
        }
    }
    
    // 获取详情
    getInfo = (record) => {
        axios.get(`Api/v1/purchases/${record.purchase_id}`)
        .then((res) => {
            this.setState({
                detail: res.data,
                showInfo: true
            })
        })
        
    }
    // 查询
    onSearch = () => {
        this.getList()
    }
    // 重置
    handleReset = () => {
        //this.props.form.resetFields();
        const _state = {
            kw: '',
            status: undefined,
            pay_status: undefined,
            supplier_id: undefined,
            staff_id: undefined,
            stock_id: undefined,
            delivery_date: null,
            delivery_date_end: null,
        };

        Object.assign(PurchaseIndex.params, _state)

        this.refArr.forEach(ref => {
            ref.clearSelected()
        })

        this.setState(_state)
    }
    // 设置查询参数
    setFilterParams(...arg){
        let key = arg[0], val = arg[1];

        const _state = {}
        
        if(key === 'kw'){
            val = val.target.value
        }
        
        else if(key === 'staff_id'){
            val = val ? val[0].staff_id : ''
        }

        else if(key === 'supplier_id'){
            val = val ? val[0].base_client_id : ''
        }
        
        if(key === 'delivery_date'){
            val = arg[2]
            _state[key] = val[0]
            _state[key + '_end'] = val[1]
        }else{
            _state[key] = val
        }

        Object.assign(PurchaseIndex.params, _state)

        this.setState(_state)
    }

    // 每页显示数量变化监听
    pageSizeChange = (current, size) => {
        PurchaseIndex.params.page = current - 1;
        PurchaseIndex.params.pageSize = size;
        
        setPageSize(size);
        this.getList()
    }
    // 页码变化监听
    pageChange = (page, pageSize) => {
        PurchaseIndex.params.page = page - 1;
        this.getList()
    }
    // 详情
    showInfo = (e) => {
        e && e.stopPropagation()
        this.setState({
            showInfo: true
        })
    }
    hideInfo = () => {
        this.setState({
            showInfo: false
        })
    }
    // 展开/收起 更多查询条件
    toggleExpandFilter = () => {
        const expandFilter = !this.state.expandFilter
        this.setState({
            expandFilter
        })
        PurchaseIndex.filter.expand = expandFilter
    }
    // 显示/隐藏 表格列设置
    toggleTableSet = () => {
        this.setState({
            visibleTableSet: !this.state.visibleTableSet
        })
    }
    // 表格列设置 确定按钮点击
    onOk = (columns) => {
        const { saveTableConfig } = this.props

        saveTableConfig(PurchaseIndex.tableName, {columns})

        this.setState({
            visibleTableSet: !this.state.visibleTableSet
        })

    }
    // 全选/反选
    toggleSelect = (e) => {
        const checked = e.target.checked
        const list = this.props.purchase.index.list
        const selectedRowKeys = []
        this.selectedRows = []

        if(checked){
            list.forEach(item => {
                this.selectedRows.push(item)
                selectedRowKeys.push(item.purchase_id)
            })
        }
        PurchaseIndex.selectedRowKeys = selectedRowKeys;
        this.setState({ selectedRowKeys });
    }
    // 列表选择变化
    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.selectedRows = selectedRows
        PurchaseIndex.selectedRowKeys = selectedRowKeys;
        this.setState({ selectedRowKeys });
    }
    multiOptrate(url){
        if(!this.selectedRows || this.selectedRows.length === 0){
            message.warn('请选择需要操作的数据', 3)
            return;
        }
        

        const ids = this.selectedRows.map(item => item.purchase_id).join(',')
        axios.post(url, {ids})
        .then(res => {
            if(res.status === 'T'){
                message.info('操作成功', 3)
                this.refresh()
            }
        })
    }
    // 批量取消
    multiCancel(){
        this.multiOptrate('Api/v1/purchases/multiCancel')
    }
    // 批量通过
    multiThroughed(){
        this.multiOptrate('Api/v1/purchases/multiThroughed')
    }
    multiChange = (e) => {
        const key = e;
        e === '1' ? this.multiThroughed() : this.multiCancel()
    }
    // excel 导出
    exportExcel = () => {
        console.log(this.selectedRows)
        if(!this.selectedRows || this.selectedRows.length === 0){
            message.warn('请选择商品')
            return
        }
        const ids = []
        this.selectedRows.forEach(item => {
            ids.push(item.purchase_id)
        })
        window.open('/Manager/Purchase/listExport?purchase_id=' + ids.join(','))
    }

    render() {
        const { 
            visibleTableSet, expandFilter, selectedRowKeys, kw, status, detail, showCheck, modalType,
            pay_status, supplier_id, staff_id, stock_id, delivery_date, delivery_date_end, showInfo, record
        } = this.state;
        const { condition } = this.props;
        const { list: dataSource, count: total, isLoading } = this.props.purchase.index
        const columns = this.bindColumnsContext(this.props.purchaseTableConfig || [])
        const filter = PurchaseIndex.filter

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };

        return (
            <div className="fixed-footer-offset">
                <TableSet 
                    columns={columns} 
                    visible={visibleTableSet} 
                    onCancel={this.toggleTableSet} 
                    onOk={this.onOk} 
                />
                <Detail visible={showInfo} onClose={this.hideInfo} detail={detail} refresh={this.refresh}/>
                <OperateModal visible={showCheck} onCancel={this.closeModal} refresh={ () => this.refresh()} detail={record} modalType={modalType} />
        
                <div className="dhb-bread">
                    <span className="dhb-bread-title">采购订单</span>
                    <Popover placement="bottomLeft" content="测试内容">
                        <Icon type="question-circle-o" />
                    </Popover>
                    <Breadcrumb>
                        <Breadcrumb.Item><NavLink to="/Manager/home">首页</NavLink></Breadcrumb.Item>
                        <Breadcrumb.Item>库存</Breadcrumb.Item>
                    </Breadcrumb>
                    <Button type="primary" icon="plus" className="pull-right" href="#/Manager/Purchase/purchase/add">新增</Button>
                </div>
                <div className="padding-normal">
                    <div className="filter-wrap">
                        <Row gutter={16}>
                            <Col span={18}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Input
                                            placeholder="商品名称/首字母拼音/编号"
                                            value={kw}
                                            onChange={this.setFilterParams.bind(this, 'kw')}
                                            prefix={<Icon type="search" style={{ color: '#000' }} />}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Select placeholder="订单状态" onChange={this.setFilterParams.bind(this, 'status')} value={status}>
                                            {
                                                condition.purchase ? (condition.purchase.status || []).map(item => (
                                                    <Option key={item.name} value={item.name}>{item.title}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    <Col span={4}>
                                        <Select placeholder="付款状态" onChange={this.setFilterParams.bind(this, 'pay_status')} value={pay_status}>
                                            {
                                                condition.purchase ? (condition.purchase.pay_status || []).map(item => (
                                                    <Option key={item.name} value={item.name}>{item.title}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    <Col span={4}>
                                        <Select
                                            showSearch
                                            
                                            value={stock_id}
                                            placeholder="选择入库仓库"
                                            defaultActiveFirstOption={false}
                                            filterOption={false}
                                            onChange={this.setFilterParams.bind(this, 'stock_id')}
                                        >
                                            {
                                                condition.purchase ? (condition.purchase.stock || []).map(item => (
                                                    <Option key={item.stock_id} value={item.stock_id}>{item.stock_name}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    <Col span={4}>
                                        <ChooseSupplier defaultValue={supplier_id} setRef={this.setRefs} onChange={this.setFilterParams.bind(this, 'supplier_id')} />
                                    </Col>
                                </Row>
                                <Row gutter={16} className={expandFilter ? '' : 'hide'} style={{marginTop: '16px'}}>
                                    <Col span={8}>
                                        <RangePicker 
                                            style={{width: '100%'}} 
                                            placeholder={['交货日期起', '交货日期止']} 
                                            value={delivery_date ? [moment(delivery_date, 'YYYY-MM-DD'), moment(delivery_date_end, 'YYYY-MM-DD')] : []}
                                            onChange={this.setFilterParams.bind(this, 'delivery_date')} 
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <ChooseStaff defaultValue={staff_id} setRef={this.setRefs} onChange={this.setFilterParams.bind(this, 'staff_id')} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={6} className="filter-actions">
                                <Button type="primary" onClick={this.onSearch}>查询</Button>
                                <Button onClick={this.handleReset}>重置</Button>
                                <a className="filter-expand" onClick={this.toggleExpandFilter}>{expandFilter ? '收起' : '展开'} <Icon type={expandFilter ? 'up' : 'down'} /></a>
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <DHBTable 
                            loading={{indicator: <Icon type="loading" style={{ fontSize: '24px' }} spin />, spinning: isLoading}} 
                            rowSelection={rowSelection} rowKey="purchase_id"
                            pagination={false} 
                            dataSource={dataSource} 
                            size="middle" 
                            columns={columns.filter(item => item.show === 'T')} 
                        />
                    </div>
                </div>
                <Footer>
                    <Row>
                        <Col span={10}>
                            <Checkbox 
                                className="footer-checkall" 
                                style={{marginLeft: '23px'}} 
                                checked={selectedRowKeys && selectedRowKeys.length > 0 && selectedRowKeys.length === dataSource.length} 
                                indeterminate={selectedRowKeys && selectedRowKeys.length > 0 && selectedRowKeys.length !== dataSource.length}
                                onChange={this.toggleSelect} 
                            />
                            <Dropdown placement="topLeft" overlay={
                                <Menu onClick={this.multiChange}>
                                    <Menu.Item key="1">审核订单</Menu.Item>
                                    <Menu.Item key="2">取消订单</Menu.Item>
                                </Menu>
                                }
                            >
                                <Button>批量操作<Icon type="down" /></Button>
                            </Dropdown>
                            <Tooltip placement="top" title="打印">
                                <Button icon="printer" className="hide" />
                            </Tooltip>
                            <Tooltip placement="top" title="导出Excel文件">
                                <Button className="hide"  onClick={this.exportExcel} icon="file-excel" />
                            </Tooltip>
                        </Col>
                        <Col span={14} className="text-right">
                            <Pagination 
                                defaultPageSize={PurchaseIndex.params.pageSize} 
                                total={total} 
                                showSizeChanger 
                                showQuickJumper 
                                defaultCurrent={PurchaseIndex.params.page + 1}
                                onChange={this.pageChange}
                                onShowSizeChange={this.pageSizeChange}
                            />
                        </Col>
                    </Row>
                </Footer>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    purchase: state.purchase,
    condition: state.app.condition,
    purchaseTableConfig: state.app.tableConfig.business_purchase
})

const mapDispatchToProps = {
    getPurchaseList,
    getTableConfig,
    saveTableConfig,
    getCondition
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseIndex)
