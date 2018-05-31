import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getClient, getCondition } from 'REDUX/actions/index'

import PropTypes from 'prop-types'

import FilterModal from './filterModal'


import { Input, Icon, Dropdown, Menu, Pagination, Row, Col, Button, Table, Select } from 'antd';

const Option = Select.Option;

let _page = 0;

/**
 * 选择客户公共组件
 */
class ChooseClient extends Component{

    static propTypes = {
        onChange: PropTypes.func.isRequired,
        setRef: PropTypes.func
    }
    
    constructor(props){
        super(props)

        this.state = {
            visible: false,
            kw: '',
            selectedRowKeys: [],
            selectedRows: props.defaultValue ? [{client_id: props.defaultValue}] : null,
            type_id: undefined // 赋值为undefined 是因为兼容组件placeholder 赋值为null 或者 '' 都不行
        }
    }
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
            title: '客户编号',
            dataIndex: 'client_num'
        },{
            width: '25%',
            title: '客户名称',
            dataIndex: 'client_name'
        },{
            width: '15%',
            title: '手机号',
            dataIndex: 'mobile'
        },{
            title: '联系人',
            dataIndex: 'contact'
        }/* ,{
            title: '归属地区',
            dataIndex: 'contact2'
        } */
    ];

    componentDidMount(){
        // this.props.getClient(this.params)
        const { client, setRef } = this.props
        client.list.length === 0 && this.getList()

        setRef && setRef(this)
    }
    componentWillUnmount(){
        _page = this.params.page
    }
    getData = () => {
        this.getList()
        this.toggle()
    }
    // 列表
    getList(){
        const { getClient, getCondition, condition } = this.props
        getClient(this.params)
        !condition.client && getCondition({
            client: ['type']
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
        const { getClient } = this.props
        if(value){
            if(this.searchTimer){
                clearTimeout(this.searchTimer)
                this.searchTimer = null
            }
            this.searchTimer = setTimeout(() => {
                getClient({
                    page: 0,
                    pageSize: 10,
                    kw: value
                })
                this.searchTimer = null;
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

        const { client, onChange } = this.props
        const selectedRows = [client.list.find(item => item.client_id  == val)]
        onChange(selectedRows)
        this.setState({
            selectedRows
        })
    }

    onSelectChange = (type_id) => {
        this.params.type_id = type_id;
        this.setState({
            type_id
        })
    }

    sure = () => {
        if(!this.selectedRows){
            message.warn('请先选择数据')
            return
        }
        const { onChange } = this.props
        onChange(this.state.selectedRows = this.selectedRows)
        this.toggle()
    }

    clearSelected(){
        if(!this.state.selectedRows){
            return
        }
        this.selectedRows = null
        this.setState({
            selectedRows: null
        })
    }

    reset = () => {
        this.selectedRows = null;
        this.setState({
            kw: '',
            selectedRows: null,
            type_id: undefined
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
        if(props === 'selectedRows'){
            this.props.onChange()
        }
    }

    toggle = () => {
        this.setState({
            kw: '',
            visible: !this.state.visible
        })
    }
    onRow = (record) => {
        return {
            onClick: () => {
                this.selectedRows = [record]
                this.setState({
                    selectedRowKeys: [ record.client_id + '' ]
                })
            }
        }
    }
    onTableSelected = (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.selectedRows = selectedRows
        this.setState({
            selectedRowKeys
        })
    }
    render(){
        const { visible, kw, selectedRows, type_id, selectedRowKeys } = this.state
        const { condition, client } = this.props

        const rowSelection = {
            selectedRowKeys,
            type: 'radio',
            onChange: this.onTableSelected
        };
        return(
            <div>
                <FilterModal visible={visible} onCancel={this.toggle}>
                    <div>
                        <div className="filter-modal-header">选择客户</div>
                        <div className="filter-modal-body">
                            <div className="filter-wrap">
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Input
                                            placeholder="名称/手机号/编号"
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
                                            style={{ width: '100%' }}
                                            value={type_id}
                                            placeholder="客户类型"
                                            dropdownClassName="filter-select"
                                            defaultActiveFirstOption={false}
                                            filterOption={false}
                                            onChange={this.onSelectChange}
                                        >
                                            {
                                                condition.client ? Object.entries(condition.client.type || {}).map(item => (
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
                                size="middle"
                                onRow={this.onRow}
                                rowSelection={rowSelection} 
                                columns={this.columns} 
                                rowKey="client_id"
                                rowClassName="pointer"
                                dataSource={client.list} />

                        </div>
                    </div>

                    <div className="filter-modal-footer">
                        <Row>
                            <Col span={10}>
                                <Pagination 
                                    defaultPageSize={10} 
                                    total={client.count} 
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
                            !visible && client.list ?
                            client.list.map(item => (
                                <Menu.Item title={item.client_name} className="ellipsis" key={item.client_id}>{item.client_name}</Menu.Item>
                            ))
                            : null
                        }
                    </Menu>
                    }
                >
                    <Input 
                        className="pointer"
                        placeholder="选择客户"
                        value={!!selectedRows ? selectedRows[0].client_name : kw}
                        readOnly={!!selectedRows}
                        onChange={this.doSearch}
                        suffix={selectedRows ? <Icon onClick={this.empty.bind(this, 'selectedRows')} type="close-circle" /> : <Icon onClick={this.getData} type="ellipsis" />}
                    />
                </Dropdown> */}
                <Select
                    showSearch
                    allowClear={true}
                    showArrow={false}
                    value={selectedRows ? selectedRows[0].client_id : undefined}
                    placeholder="选择客户"
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onChange={this.handleMenuClick}
                    onSearch={this.onSelectSearch}
                >
                    {
                        client.list ? client.list.map(item => (
                            <Option key={item.client_id} value={item.client_id}>{item.client_name}</Option>
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
    client: state.app.client,
    condition: state.app.condition
})

const mapDispatchToProps = {
    getClient,
    getCondition
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseClient)
