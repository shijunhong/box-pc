import React, { Component } from 'react';

import { connect } from 'react-redux'

import { NavLink } from 'react-router-dom'

import DHBTable from '../common/table';
import Footer from 'PAGES/common/footer'
import TableSet from '../common/table_field_set';
import AccuracyCtrl from '../common/accuracyCtrl'

import { PAGE_SIZE, setRefresh, removeRefresh, setPageSize } from 'UTILS/utils'
import axios from 'UTILS/http';
import { getPurchaseGoodsDetail } from 'REDUX/actions/purchaseAction'
import { getTableConfig, saveTableConfig, getCondition } from 'REDUX/actions/index'

import Detail from "./detail";
import moment from 'moment';

import ChooseSupplier from '../filter/supplier'
import ChooseGoods from '../filter/goodsCheck'


import { 
    Breadcrumb,Popover, Tooltip, DatePicker, Dropdown, Menu, message, Icon, Button, Row, Col, Select, 
    Input, Divider, Popconfirm, Pagination, Checkbox, Tag, Tabs, Modal
} from 'antd';

const RangePicker = DatePicker.RangePicker
const Option  = Select.Option

class PurchaseGoods extends Component{
    static tableName = 'business_purchase'
    
    // 筛选数据
    static filter = {
        expand: false,
        pay_status: [{
            value: 'oblig',
            name: '待付款'
        },{
            value: 'uncollect',
            name: '部分付款'
        },{
            value: 'paided',
            name: '已付款'
        },{
            value: 'cancelled',
            name: '已取消'
        },{
            value: 'wait',
            name: '待确认'
        }],
        status: [{
            value: 'pending',
            name: '待审核'
        },{
            value: 'wh_up',
            name: '待入库'
        },{
            value: 'wh_half',
            name: '部分入库'
        },{
            value: 'cancelled',
            name: '已取消'
        },{
            value: 'finished',
            name: '已完成'
        }],
        combine:[{
            value: '',
            name: '不合并',
        },
        {
            value: 'MergeGoods',
            name: '合并相同商品',
        },
        {
            value: 'MergeSupplier',
            name: '合并相同供应商',
        }]
    }
    // 列选择配置
    static selectedRowKeys = null;
    // 查询参数
    static params = {
        page: 0,
        pageSize: PAGE_SIZE,
        combine: ''     //  默认的请求地址需要有个空
    }


    // 表格列配置
    static filterColumns = []
	columns = [
        {
            // title: <Icon className="pointer" type="setting" />,
            width: 50,
            dataIndex: 'sequence',
            fixed:'left',
            // onHeaderCell: () => {
            //     return {
            //         onClick: () => {
            //             this.toggleTableSet()
            //         }
            //     }
            // },
            render: (text, record, index) => {
                return index + 1;
            }
        },
        {
            width: 130,
            dataIndex: 'goods_num',
            title: '商品编号',
            fixed:'left',
        }, 
        {
            width: 200,
            dataIndex: 'goods',
            title: '商品',
            fixed:'left',
            render: (text,record,index) => {
                return (
                    <React.Fragment>
                      <img className="list-goods-pic" src={record.goods_picture} alt=""/>
                      <div className="ellipsis" style={{lineHeight: '32px'}}>{record.goods_name}</div>
                    </React.Fragment>
                )
            }
        },
        {
            width: 100,
            title: '规格',
            dataIndex: 'options_name',
            render: (text) => {
                if(!text) return '-'
                return text
            }
        },
        {
            width: 100,
            title: '分类',
            dataIndex: 'category_name',
            render: (text) => {
                if(!text) return '-'
                return text
            }
        },
        {
            width: 140,
            title: '品牌',
            dataIndex: 'brand_name', 
            render: (text) => {
                if(!text) return '-'
                return text
            }
        },
        {
            width: 100,
            title: '单位',
            dataIndex: 'base_units', 
            render: (text, record, index) => {
                if( !!record.container_units ){
                    return `1${record.container_units}=${record.conversion_number}${text}`
                }
                return text
            }
        },
        {
            width: 100,
            title: '采购数量',
            dataIndex: 'number',
            className: 'text-right',
            render: (text, record) => {
                return (
                    <AccuracyCtrl type='quantity' value={text} />
                )
            }
        },
        {
            width: 130,
            title: '进货价',
            dataIndex: 'price',
            className: 'text-right',
            render: (text, record) => {
                return (
                    <AccuracyCtrl type='price' value={text} />
                )
            }          
        },
        {
            width: 130,
            title: '进货均价',
            dataIndex: 'price',
            className: 'text-right',
            render: (text, record) => {
                return (
                    <AccuracyCtrl type='price' value={text} />
                )
            }          
        },
        {
            // width: 130,
            title: '金额',
            dataIndex: 'price_count',
            className: 'text-right',
            render: (text, record) => {
                return (
                    <AccuracyCtrl type='price' value={text} />
                )
            }          
        },
        {
            // width: 100,
            title: '已入库',
            dataIndex: 'wh_number',
            className: 'text-right',
            render: (text, record) => {
                return (
                    <AccuracyCtrl type='number' value={text} />
                )
            }          
        },
        {
            // width: 100,
            title: '待入库',
            dataIndex: 'wait_wh_number',
            className: 'text-right',
            render: (text, record) => {
                return <AccuracyCtrl type='number' value={text} />
            }          
        },
        {
            // width: 140,
            title: '供应商',
            dataIndex: 'supplier_name',
        },
        {
            // width: 120,
            title: '采购单号',
            dataIndex: 'purchase_num',
        },
    ];

    state = {
        pageSize: PAGE_SIZE,
        visibleTableSet: false,
        expandFilter: PurchaseGoods.filter.expand,
        selectedRowKeys: PurchaseGoods.selectedRowKeys,
        kw: PurchaseGoods.params.kw,
        status: PurchaseGoods.params.status,
        pay_status: PurchaseGoods.params.pay_status,
        goods_id: PurchaseGoods.params.goods_id,
        supplier_id: PurchaseGoods.params.supplier_id,
        stock_id: PurchaseGoods.params.stock_id,
        delivery_date: PurchaseGoods.params.delivery_date || null,
        delivery_date_end: PurchaseGoods.params.delivery_date_end || null,
        combine: PurchaseGoods.params.combine
    };

    componentDidMount(){
        const { purchase } = this.props
        const { getCondition, condition } = this.props

        setRefresh(() => {
			this.refresh()
        });

        !condition.purchase && getCondition({
            purchase: ['stock', 'status', 'pay_status', 'goods_category']
        })
        if(purchase.goodsDetail.total > 0){
            return
        }

        this.getList()
        // this.getTableConfig()
    }
    componentWillUnmount() {
        removeRefresh();
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
    // 筛选表格配置
    filterTableConfig = () => {
        const { combine } = PurchaseGoods.params
        if(combine === '') {
            PurchaseGoods.filterColumns = this.columns.filter(v =>  v.title !== '进货均价')
        }else if(combine === 'MergeGoods'){
            PurchaseGoods.filterColumns = this.columns.filter(v =>  v.title !== '进货价' && v.title !== '采购单号' && v.title !== '供应商')
        }else if(combine === 'MergeSupplier'){
            PurchaseGoods.filterColumns = this.columns.filter(v =>  v.title !== '进货价' && v.title !== '采购单号')
        }
        
    }
    // 表格配置获取
    getTableConfig(){
        const { getTableConfig, purchaseTableConfig } = this.props
        if(purchaseTableConfig){
            return
        }
        getTableConfig(PurchaseGoods.tableName);
    }

    // 列表
    getList(){
        this.filterTableConfig()
        const { getPurchaseGoodsDetail } = this.props
        getPurchaseGoodsDetail(PurchaseGoods.params);
    }
    // 刷新
    refresh(){
        //this.clear()
        this.getList()
    }
    
    // 查询
    onSearch = () => {
        this.getList()
    }
    setRefs = (ref) => {
        if(!this.refArr){
            this.refArr = []
        }
        this.refArr.push(ref)
    }
    // 重置
    handleReset = () => {
        //this.props.form.resetFields();
        const _state = {
            kw: '',
            status: undefined,
            pay_status: undefined,
            supplier_id: undefined,
            stock_id: undefined,
            goods_id: undefined,
            delivery_date: null,
            delivery_date_end: null,
            combine: undefined,
        };
 
        Object.assign(PurchaseGoods.params, _state)

        this.refArr.forEach(item => {
            item.clearSelected()
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
        else if(key === 'supplier_id'){
            val = val ? val[0].base_client_id : ''
        }
        else if(key === 'goods_id'){
            val = val ? val[0].goods_id : ''
        }

        if(key === 'delivery_date'){
            val = arg[2]
            _state[key] = val[0]
            _state[key + '_end'] = val[1]
        }else{
            _state[key] = val
        }

        Object.assign(PurchaseGoods.params, _state)

        this.setState(_state)
    }
    // 每页显示数量变化监听
    pageSizeChange = (current, size) => {
        PurchaseGoods.params.page = current - 1;
        PurchaseGoods.params.pageSize = size;
        
        setPageSize(size);
        this.getList()
    }
    // 页码变化监听
    pageChange = (page, pageSize) => {
        PurchaseGoods.params.page = page - 1;
        this.getList()
    }
   
    // 展开/收起 更多查询条件
    toggleExpandFilter = () => {
        const expandFilter = !this.state.expandFilter
        this.setState({
            expandFilter
        })
        PurchaseGoods.filter.expand = expandFilter
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

        saveTableConfig(PurchaseGoods.tableName, {columns})

        this.setState({
            visibleTableSet: !this.state.visibleTableSet
        })

    }
    
    render() {
        const { 
            visibleTableSet, expandFilter, selectedRowKeys, kw, status, detail,
            pay_status, supplier_id, goods_id, stock_id, delivery_date, delivery_date_end, 
            combine
        } = this.state;
        const { condition } = this.props;
        const { data: dataSource, count, total, isLoading } = this.props.purchase.goodsDetail
        // const columns = this.bindColumnsContext(this.props.purchaseTableConfig || [])
        const columns = PurchaseGoods.filterColumns
        const filter = PurchaseGoods.filter
        console.log(dataSource, columns)

        return (
            <div className="fixed-footer-offset">

                <TableSet 
                    columns={columns} 
                    visible={visibleTableSet} 
                    onCancel={this.toggleTableSet} 
                    onOk={this.onOk} 
                />
                <Modal
                    width={500}
                    visible={false}
                    footer={<div>test</div>}
                    wrapClassName="custom-wrap-modal"
                    bodyStyle={{width: '100%'}}
                    mask={false}
                    getContainer={() => document.getElementById('dhb-content')}
                >

                </Modal>
        
                <div className="dhb-bread">
                    <span className="dhb-bread-title">采购商品明细</span>
                    <Popover placement="bottomLeft" content="测试内容">
                        <Icon type="question-circle-o" />
                    </Popover>
                    <Breadcrumb>
                        <Breadcrumb.Item><NavLink to="/Manager/home">首页</NavLink></Breadcrumb.Item>
                        <Breadcrumb.Item>库存</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="padding-normal">
                    <div className="filter-wrap">
                        <Row gutter={16}>
                            <Col span={18}>
                                <Row gutter={16}>
                                    {/* <Col span={8}>
                                        <Input
                                            placeholder="商品名称/首字母拼音/编号"
                                            value={kw}
                                            onChange={this.setFilterParams.bind(this, 'kw')}
                                            prefix={<Icon type="search" style={{ color: '#000' }} />}
                                        />
                                    </Col> */}
                                    <Col span={8}>
                                        <RangePicker 
                                            style={{width: '100%'}} 
                                            placeholder={['交货日期起', '交货日期止']} 
                                            value={delivery_date ? [moment(delivery_date, 'YYYY-MM-DD'), moment(delivery_date_end, 'YYYY-MM-DD')] : []}
                                            onChange={this.setFilterParams.bind(this, 'delivery_date')} 
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Select placeholder="商品分类" onChange={this.setFilterParams.bind(this, 'status')} value={status}>
                                            {filter.status.map(item => (
                                                <Option key={item.value} value={item.value}>{item.name}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={4}>
                                        {/* 选择商品 */}
                                        <ChooseGoods type='radio' setRef={this.setRefs} defaultValue={goods_id} onChange={this.setFilterParams.bind(this, 'goods_id')} />
                                        
                                    </Col>
                                    <Col span={4}>
                                        {/* 选择供应商 */}
                                        <ChooseSupplier setRef={this.setRefs} defaultValue={supplier_id} onChange={this.setFilterParams.bind(this, 'supplier_id')} />
                                        
                                    </Col>
                                    <Col span={4}>
                                        <Select placeholder="选择仓库" value={stock_id} onChange={this.setFilterParams.bind(this, 'stock_id')}>
                                            {
                                                condition.purchase ? (condition.purchase.stock || []).map(item => (
                                                    <Option key={item.stock_id} value={item.stock_id}>{item.stock_name}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    
                                </Row>
                                <Row gutter={16} className={expandFilter ? '' : 'hide'} style={{marginTop: '16px'}}>
                                    {/* <Col span={8}>
                                        <RangePicker 
                                            style={{width: '100%'}} 
                                            placeholder={['交货日期起', '交货日期止']} 
                                            value={delivery_date ? [moment(delivery_date, 'YYYY-MM-DD'), moment(delivery_date_end, 'YYYY-MM-DD')] : []}
                                            onChange={this.setFilterParams.bind(this, 'delivery_date')} 
                                        />
                                    </Col> */}
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
                                        <Select placeholder="合并状态" onChange={this.setFilterParams.bind(this, 'combine')} value={combine}>
                                            {filter.combine.map(item => (
                                                <Option key={item.value} value={item.value}>{item.name}</Option>
                                            ))}
                                        </Select>
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
                    <div style={{marginBottom:16,fontSize:18,color:'#000'}}>
                        <span>供应商数：</span>
                        <span className="theme-color" style={{display:'inline-block',marginRight:20}}>{count.supplier}</span>
                        <span>采购订单数：</span>
                        <span className="theme-color" style={{display:'inline-block',marginRight:20}}>{count.purchase}</span>
                        <span>采购金额：</span>
                        <span className="theme-color" style={{display:'inline-block',marginRight:20}}>{count.prices}</span>
                        <span>商品数：</span>
                        <span className="theme-color" style={{display:'inline-block',marginRight:20}}>{count.goods}</span>
                    </div>
                    <div>
                        <DHBTable 
                            loading={{indicator: <Icon type="loading" style={{ fontSize: '24px' }} spin />, spinning: isLoading}} 
                            rowKey="purchase_list_id"
                            pagination={false} 
                            dataSource={dataSource} 
                            size="middle" 
                            // columns={columns.filter(item => item.show === 'T')} 
                            columns={columns}
                            scroll={{ x: 1710 }}
                        />
                    </div>
                </div>
                <Footer>
                    <Row>
                        <Col span={10}>
                            
                            <Tooltip placement="top" title="导出Excel">
                                <Button className="icon-btn" icon="printer" style={{marginRight: '20px'}} />
                            </Tooltip>
                            <Tooltip placement="top" title="导出Excel文件">
                                <Button className="icon-btn" icon="file-excel" />
                            </Tooltip>
                        </Col>
                        <Col span={14} className="text-right">
                            <Pagination 
                                defaultPageSize={PurchaseGoods.params.pageSize} 
                                total={(total*1)} 
                                showSizeChanger 
                                showQuickJumper 
                                defaultCurrent={PurchaseGoods.params.page + 1}
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
    purchaseTableConfig: state.app.tableConfig.business_purchase,
    condition: state.app.condition,
})

const mapDispatchToProps = {
    getPurchaseGoodsDetail,
    getTableConfig,
    saveTableConfig,
    getCondition
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseGoods)
