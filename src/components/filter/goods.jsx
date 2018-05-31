import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getGoods, getCondition } from 'REDUX/actions/index'

import PropTypes from 'prop-types'

import FilterModal from './filterModal'
import Multi from './multi'
import Spec from './spec'


import { Input, Icon, Dropdown, Menu, Pagination, Row, Col, Button, Table, Select, message } from 'antd';

const Option = Select.Option;

let _page = 0;
/**
 * 选择客户公共组件
 */
class ChooseGoods extends Component{

    static propTypes = {
        onChange: PropTypes.func.isRequired,
        reset: PropTypes.bool
    }
    

    state = {
        visible: false,
        showDrop: false,
        kw: '',
        brand_id: undefined,
        category_id: undefined // 赋值为undefined 是因为兼容组件placeholder 赋值为null 或者 '' 都不行
    }
    // 缓存已经加载的 多规格数据
    cacheOption = {}

    // 临时存储未确定的选择商品
    tempChoosed = {}
    // 查询参数
    params = {
        page: _page,
        pageSize: 10
    }
    // 表格列配置
    columns = [
        {
            width: 50,
            dataIndex: 'sequence',
            render: (text, record, index) => {
                return index + 1;
            }
        },{
            width: '15%',
            title: '商品编号',
            dataIndex: 'goods_num'
        },{
            width: '25%',
            title: '商品名称',
            dataIndex: 'goods_name'
        },{
            width: '15%',
            title: '可售库存',
            dataIndex: 'mobile'
        },{
            title: '进货价',
            dataIndex: 'purchase_price'
        },{
            title: '单位',
            dataIndex: 'base_units'
        },{
            title: '规格',
            dataIndex: 'price_count',
            render: (text) => {
                return text + '种'
            }
        },{
            title: null,
            dataIndex: 'multi_id',
            render: (text, record) => {
                let { choosed } = this.props
                if(this.tempChoosed[record.goods_id]){
                    choosed = [...choosed, ...this.tempChoosed[record.goods_id].list]
                    choosed = [...new Set(choosed)]
                }

                return text === '0' ? 
                    <Spec onChange={this.goodsChoose} choosed={choosed} record={record} /> 
                : 
                    <Multi onChange={this.goodsChoose} cacheOption={this.cacheOption} choosed={choosed} record={record} />
            }
        }  
    ];

    goodsChoose = (chooseArr, record) => {
        this.tempChoosed[record.goods_id] = {
            list: chooseArr,
            record,
        }
        // this.props.onChange(chooseArr, record)
    }

    componentWillUnmount(){
        _page = this.params.page
    }

    /*componentWillReceiveProps(nextProps){
        if(!nextProps.defaultValue){
            this.setState({
                kw: '',
                // selectedRows: null
            })
        }
    }
    
    componentDidMount(){
        this.props.getGoods(this.params)
    }*/
    getData = () => {
        const { goods } = this.props
        goods.list.length === 0 && this.getList()

        this.tempChoosed = [];
        this.toggle()
    }
    // 列表
    getList(){
        const { getGoods, getCondition, condition } = this.props
        getGoods(this.params)
        !condition.goods && getCondition({
            goods: ['category', 'brand', 'goods_type']
        })
    }
    // 刷新
    refresh(){
        //this.clear()
        this.getList()
    }
    // 查询
    onSearch = () => {
        this.params.page = 0;
        this.getList()
    }
    // 页码变化监听
    pageChange = (page, pageSize) => {
        this.params.page = page - 1;
        this.getList()
    }

    // 输入框动态搜索
    doSearch = (e) => {
        const { value } = e.target
        const { getGoods } = this.props
        if(value){
            if(this.searchTimer){
                clearTimeout(this.searchTimer)
                this.searchTimer = null
            }
            this.searchTimer = setTimeout(() => {
                getGoods({
                    page: 0,
                    pageSize: 10,
                    kw: value
                })
            }, 650);
        }
        this.setState({
            kw: value
        })
    }
    onSelectSearch = (value) => {
        this.doSearch({target: {
            value
        }})
    }
    // 设置查询参数
    setFilterParams(...arg){
        let key = arg[0], val = arg[1];

        const _state = {}
        
        if(key === 'kw'){
            val = val.target.value
        }
        _state[key] = val

        Object.assign(this.params, _state)

        this.setState(_state)
    }

    handleMenuClick = (val) => {
        if(!val){
            this.empty('selectedRows');
            return
        }

        const { goods, onChange } = this.props
        const record = goods.list.find(item => item.goods_id == val)

        let visible = false

        if(record){
            if(record.multi_id === '0'){
                this.tempChoosed[record.goods_id] = {
                    list: [{
                        goods_id: record.goods_id,
                        options_id: record.goods_id,
                        price: record.purchase_price,
                        isSpec: true,
                        num: 1
                    }],
                    record
                }
                this.sure()
            }else{
                visible = true
            } 
        }
        this.setState({
            selectedRows: null,
            kw: '',
            visible
        })

        
    }

    onSelectChange(prop, value) {
        this.params[prop] = value;
        this.setState({
            [prop]: value
        })
    }

    sure = () => {
        /*if(!this.selectedRows){
            message.warn('请先选择数据')
            return
        }*/
        const { onChange, choosed } = this.props;
        let index = -1;

        Object.keys(this.tempChoosed).forEach(key => {
            this.tempChoosed[key].list.forEach(goods => {
                // options_id === '0' 表示没有规格，根据商品id判断
                index = choosed.findIndex(item => item.options_id === goods.options_id && item.goods_id === goods.goods_id)
                // 已选择的商品直接修改数量
                if(index > -1){
                    choosed[index].num = goods.num || 0
                    return;
                }
                choosed.push(Object.assign(goods, this.tempChoosed[key].record, {key: goods.goods_id + goods.options_id}))
            })
        })

        onChange(choosed.filter(item => item.num && item.num > 0))
        this.toggle()
    }

    reset = () => {
        this.selectedRows = null
        this.setState({
            kw: '',
            selectedRows: null,
            category_id: undefined,
            brand_id: undefined,
            goods_type: undefined
        })
        this.params = {
            page: 0,
            pageSize: 10
        }
        // this.onSearch()
    }
    empty(props){
        delete this.params[props]
        this.setState({
            [props]: null
        })
    }

    toggle = () => {
        this.setState({
            kw: '',
            visible: !this.state.visible
        })
    }
    onRow = (record) => {
        return {
            /* onClick: () => {
                this.setState({
                    selectedRows: [record],
                    selectedRowKeys: record.client_id
                })
            } */
        }
    }
    onTableSelected = (selectedRowKeys, selectedRows) => {
        this.selectedRows = selectedRows
        this.setState({
            selectedRowKeys
        })
    }
    render(){
        const { visible, showDrop, kw, selectedRows, category_id, goods_type, brand_id, selectedRowKeys } = this.state
        const { condition, goods } = this.props

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onTableSelected
        };
        return(
            <div>
                <FilterModal visible={visible} onCancel={this.toggle}>
                    <div>
                        <div className="filter-modal-header">选择商品</div>
                        <div className="filter-modal-body">
                            <div className="filter-wrap">
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Input
                                            placeholder="名称/首字母拼音/编号"
                                            onChange={this.setFilterParams.bind(this, 'kw')}
                                            value={kw}
                                            onPressEnter={this.onSearch}
                                            suffix={kw ? <Icon onClick={this.empty.bind(this, 'kw')} className="pointer" type="close-circle" /> : null}
                                            prefix={<Icon type="search" style={{ color: '#000' }} />}
                                        />
                                    </Col>
                                    <Col span={4} className="filter-actions">
                                        <Select
                                            showSearch
                                            value={category_id}
                                            placeholder="商品分类"
                                            dropdownClassName="filter-select"
                                            defaultActiveFirstOption={false}
                                            filterOption={false}
                                            onChange={this.onSelectChange.bind(this, 'category_id')}
                                        >
                                            {
                                                condition.goods ? (condition.goods.category || []).map(item => (
                                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    <Col span={4} className="filter-actions">
                                        <Select
                                            showSearch
                                            dropdownClassName="filter-select"
                                            value={brand_id}
                                            placeholder="商品品牌"
                                            defaultActiveFirstOption={false}
                                            filterOption={false}
                                            onChange={this.onSelectChange.bind(this, 'brand_id')}
                                        >
                                            {
                                                condition.goods ? (condition.goods.brand || []).map(item => (
                                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    <Col span={4} className="filter-actions">
                                        <Select
                                            showSearch
                                            dropdownClassName="filter-select"
                                            value={goods_type}
                                            placeholder="商品标签"
                                            defaultActiveFirstOption={false}
                                            filterOption={false}
                                            onChange={this.onSelectChange.bind(this, 'goods_type')}
                                        >
                                            {
                                                condition.goods ? Object.entries(condition.goods.goods_type || {}).map(item => (
                                                    <Option key={item[0]} value={item[0]}>{item[1]}</Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Col>
                                    <Col span={6} className="filter-actions">
                                        <Button type="primary" onClick={this.onSearch}>查询</Button>
                                        <Button onClick={this.reset}>重置</Button>
                                    </Col>
                                </Row>
                            </div>
                            <Table 
                                pagination={false}
                                size="small"
                                // onRow={this.onRow}
                                // rowSelection={rowSelection} 
                                columns={this.columns} 
                                rowKey="goods_id"
                                dataSource={goods.list} />

                        </div>
                    </div>

                    <div className="filter-modal-footer">
                        <Row>
                            <Col span={10}>
                                <Pagination 
                                    defaultPageSize={10} 
                                    total={goods.count} 
                                    defaultCurrent={this.params.page + 1}
                                    onChange={this.pageChange}
                                />
                            </Col>
                            <Col span={14} className="text-right">
                                <Button onClick={this.toggle} className="icon-btn">取消</Button>
                                <Button type="primary" onClick={this.sure}>确定</Button>
                            </Col>
                        </Row>
                    </div>

                </FilterModal>
                {/* <Dropdown trigger={['click']} overlay={
                    <Menu onClick={this.handleMenuClick}>
                        {
                            !visible && goods.listTODO ?
                            goods.list.map(item => (
                                <Menu.Item title={item.goods_name} className="ellipsis" key={item.goods_id}>{item.goods_name}</Menu.Item>
                            ))
                            : null
                        }
                    </Menu>
                    }
                >
                    <Input 
                        className="table-input-wrap"
                        placeholder="输入编码/商品名称"
                        value={!!selectedRows ? selectedRows[0].goods_name : kw}
                        readOnly={!!selectedRows}
                        onChange={this.doSearch}
                        suffix={selectedRows ? <Icon onClick={this.empty.bind(this, 'selectedRows')} type="close-circle" /> : <Icon onClick={this.getData} type="ellipsis pointer" />}
                    />
                </Dropdown> */}
                <Select
                    showSearch
                    allowClear={true}
                    showArrow={false}
                    style={{width: '100%'}}
                    className="table-input-wrap"
                    value={selectedRows ? selectedRows[0].goods_id : undefined}
                    placeholder="输入编码/商品名称"
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onChange={this.handleMenuClick}
                    onSearch={this.onSelectSearch}
                >
                    {
                        goods.list ? goods.list.map(item => (
                            <Option key={item.goods_id} value={item.goods_id}>{item.goods_name}</Option>
                        ))
                        : null
                    }
                </Select>
                {selectedRows || kw ? null : <Icon className="more-ellipsis" onClick={this.getData} type="ellipsis" />}
            </div>
            
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    goods: state.app.goods,
    condition: state.app.condition
})

const mapDispatchToProps = {
    getGoods,
    getCondition
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseGoods)
