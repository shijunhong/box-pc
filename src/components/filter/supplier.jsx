import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSuppliers } from 'REDUX/actions/index'

import PropTypes from 'prop-types'

import FilterModal from './filterModal'



import { Input, Icon, Dropdown, Menu, Pagination, Row, Col, Button, Table, message, Select } from 'antd';

const Option = Select.Option;

let _page = 0;

/**
 * 选择供应商公共组件
 */
class ChooseSupplier extends Component{

    static propTypes = {
        onChange: PropTypes.func.isRequired,
        setRef: PropTypes.func,
        showTip: PropTypes.bool
    }
    static defaultProps = {
        showTip: false
    }
    

    constructor(props){
        super(props)

        this.state = {
            visible: false,
            selectedRowKeys: [],
            selectedRows: props.defaultValue ? [{base_client_id: props.defaultValue}] : null,
            kw: ''
        }
    }
    // 查询参数
    params = {
        page: 0,
        pageSize: 10
    }
    // 表格列配置
    columns = [{
        width: 50,
        dataIndex: 'sequence',
        render: (text, record, index) => {
            return index + 1;
        }
    },{
        width: 100,
        title: '供应商编号',
        dataIndex: 'client_num'
    }, {
        width: 200,
        title: '供应商名称',
        dataIndex: 'client_name'
    }, {
        width: 100,
        title: '联系人',
        dataIndex: 'contact'
    },{
        width: 100,
        title: '联系电话',
        dataIndex: 'phone'
    }];

    componentDidMount(){
        // this.props.getSuppliers(this.params)
        const { dialogSupplier, setRef } = this.props
        dialogSupplier.list.length === 0 && this.getList()

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
        const { getSuppliers } = this.props
        getSuppliers(this.params)
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

    doSearch = (e) => {
        const { value } = e.target
        const { getSuppliers } = this.props
        if(value){
            if(this.searchTimer){
                clearTimeout(this.searchTimer)
                this.searchTimer = null
            }
            this.searchTimer = setTimeout(() => {
                getSuppliers({
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
    handleMenuClick = (val) => {
        if(!val){
            this.empty('selectedRows');
            return
        }

        const { dialogSupplier, onChange } = this.props
        const selectedRows = [dialogSupplier.list.find(item => item.base_client_id == val)]
        
        onChange(selectedRows)
        this.setState({
            selectedRows
        })
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
        this.selectedRows = null
        this.setState({
            selectedRows: null,
            kw: ''
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
                    selectedRowKeys: [ record.base_client_id ]
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
        const { visible, kw, selectedRows, selectedRowKeys } = this.state
        const { dialogSupplier, showTip } = this.props
        
        const rowSelection = {
            selectedRowKeys,
            type: 'radio',
            onChange: this.onTableSelected
        };

        return(
            <div>
                <FilterModal visible={visible} onCancel={this.toggle}>
                    <div>
                        <div className="filter-modal-header">选择供应商</div>
                        <div className="filter-modal-body">
                            <div className="filter-wrap">
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Input
                                            placeholder="名称/手机号/联系人/编号"
                                            onChange={this.setFilterParams.bind(this, 'kw')}
                                            value={kw}
                                            onPressEnter={this.onSearch}
                                            suffix={kw ? <Icon onClick={this.empty.bind(this, 'kw')} className="pointer" type="close-circle" /> : null}
                                            prefix={<Icon type="search" style={{ color: '#000' }} />}
                                        />
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
                                rowKey="base_client_id"
                                rowClassName="pointer"
                                dataSource={dialogSupplier.list} />
                        </div>
                    </div>

                    <div className="filter-modal-footer">
                        <Row>
                            <Col span={10}>
                                <Pagination 
                                    defaultPageSize={10} 
                                    total={dialogSupplier.count} 
                                    defaultCurrent={this.params.page + 1}
                                    onChange={this.pageChange}
                                />
                            </Col>
                            <Col span={14} className="text-right">
                                {showTip ? <span style={{marginRight: '10px'}} className="theme-color">修改供应商后，将清除已选择的商品数据，确定修改？</span> : null}
                                <Button onClick={this.toggle} className="icon-btn">取消</Button>
                                <Button type="primary" onClick={this.sure}>确定</Button>
                            </Col>
                        </Row>
                    </div>
                    
                </FilterModal>
                {/* <Dropdown trigger={['click']} overlay={
                    <Menu onClick={this.handleMenuClick}>
                        {
                            !visible && dialogSupplier.list ?
                            dialogSupplier.list.map(item => (
                                <Menu.Item title={item.client_name} className="ellipsis" key={item.base_client_id}>{item.client_name}</Menu.Item>
                            ))
                            : null
                        }
                    </Menu>
                    }
                >
                    <Input 
                        className="pointer"
                        placeholder="选择供应商"
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
                    value={selectedRows ? selectedRows[0].base_client_id : undefined}
                    placeholder="选择供应商"
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onChange={this.handleMenuClick}
                    onSearch={this.onSelectSearch}
                >
                    {
                        dialogSupplier.list ? dialogSupplier.list.map(item => (
                            <Option key={item.base_client_id} value={item.base_client_id}>{item.client_name}</Option>
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
    dialogSupplier: state.app.dialogSupplier
})

const mapDispatchToProps = {
    getSuppliers
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseSupplier)
