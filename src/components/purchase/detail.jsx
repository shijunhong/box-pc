import React, { Component } from 'react'
import { withRouter } from 'react-router'
import axios from 'UTILS/http';
import Slide from '../common/slide';
import AccuracyCtrl from '../common/accuracyCtrl'

import OperateModal from './operateModal'
import { 
    Button, Row, Col, Select, Tooltip, message, Divider,
    Input, Tag, Tabs, Table, Modal, Icon, DatePicker, Form
} from 'antd';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select

// 新建采购单的form
const NewPayment = Form.create()(
    class extends Component {
        render(){
            const { visible, onCancel, onCreate,onSubmit, form, detailMain } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    title="新增付款记录"
                    style={{ top: 40 }}
                    visible={visible}
                    width={800}
                    destroyOnClose={true}
                    onCancel={onCancel}
                    onOk={onSubmit}
                    bodyStyle={{padding: 0}}
                >
                    <Row style={{background:'#FF7557',color:'#fff',fontSize:14,padding:'0 30px'}}>
                        <Col span={12} style={{lineHeight:'72px'}}>
                            <Icon type="pay-circle" style={{color:'#fff',fontSize:24,marginRight:10,verticalAlign:'sub'}}/>
                            <span style={{fontSize:18}}>待付金额：￥ {(detailMain.total - detailMain.account_paid).toFixed(2)}</span>
                        </Col>
                        <Col span={6} style={{lineHeight:'72px',textAlign:'right'}}>
                            <span>应付金额：￥ {detailMain.total}</span>
                        </Col>
                        <Col span={6} style={{lineHeight:'72px',textAlign:'right'}}>
                            <span>已付金额：￥{detailMain.account_paid}</span>
                        </Col>
                    </Row>
                    <div style={{padding: '50px 110px 40px'}}>
                        <Form>
                            <FormItem
                            label="付款方式"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 17 }}
                            >
                            {getFieldDecorator('pay_method', {
                                rules: [{ required: true, message: '请选择付款方式!' }],
                            })(
                                <Select placeholder="选择付款方式">
                                    <Option value="jack">预存款支付</Option>
                                    <Option value="lucy">转账支付</Option>
                                    <Option value="Yiminghe">货到付款</Option>
                                </Select>
                            )}
                            </FormItem>
                            <FormItem
                            label="付款金额"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 17 }}
                            >
                            {getFieldDecorator('money', {
                                rules: [{ required: true, message: '请填写付款金额！' }],
                            })(
                                <Input placeholder='填写付款金额'/>
                            )}
                            </FormItem>
                            <FormItem
                            label="付款账户"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 17 }}
                            >
                            {getFieldDecorator('account', {
                                rules: [{ required: true, message: '请填写付款账户！' }],
                            })(
                                <Input placeholder='填写付款账户'/>
                            )}
                            </FormItem>
                            <FormItem
                            label="付款日期"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 17 }}
                            >
                            {getFieldDecorator('date', {
                                rules: [{ required: true, message: '请选择付款日期！' }],
                            })(
                                <DatePicker placeholder='选择付款日期' style={{width:'100%'}}/>
                            )}
                            </FormItem>
                            <FormItem
                            label="备注"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 17 }}
                            >
                            {getFieldDecorator('remark', {
                                rules: [{ required: false, message: '' }],
                            })(
                                <TextArea rows='4' placeholder='填写付款备注'/>
                            )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
            )
        }
    }
)



class Detail extends Component{
    static goodsColumns = [
        {
            title: null,
            width: 50,
            dataIndex: 'sequence',
            render: (text, record, index) => {
                if(record.lastRow){
                    return '合计'
                }
                return index + 1;
            }
        },
        { title: '商品编号', width: 100, dataIndex: 'options_goods_num' }, 
        {
            title: '商品',
            width: 180,
            dataIndex: 'goods_name',
            render: (text, record, index) => {
                if(record.lastRow){
                    return null
                }
                return (
                    <div>
                        <img className="list-goods-pic" src={record.goods_picture} alt=""/>
                        <div className="ellipsis">{record.goods_name}</div>
                    </div>
                )
            }
        }, 
        { title: '规格', width: 100, dataIndex: 'options_name' }, 
        {
            title: '单位',
            width: 80,
            dataIndex: 'base_units',
            render: (text, record, index) => {
                if(record.container_units){
                    return '1' + record.container_units + '=' + record.conversion_number + record.base_units
                }
                return record.base_units;
            }
        }, {
            title: '辅助数量',
            checked: true,
            width: 150,
            className: 'text-right',
            dataIndex: 'wh_number',
            render: (text, record) => {
                if(record.lastRow){
                    return text
                }
                if(record.container_units){
                    return Math.floor(record.number / record.conversion_number) + record.container_units + '+' + (record.number % record.conversion_number) + record.base_units
                }
                return record.number + record.base_units;
            }
        }, 
        { title: '采购数量', width: 150, className: 'text-right', dataIndex: 'number' }, 
        { title: '进货价', width: 150, className: 'text-right', dataIndex: 'price' }, 
        { title: '金额', width: 150, className: 'text-right', dataIndex: 'amount' }, 
        { title: '备注', width: 200, dataIndex: 'remark' }
    ];
    static warehouseColumns = [
        { title: null, width: 50, dataIndex: 'sequence',render: (text, record, index) => index + 1 },
        { title: '商品编号', width: 100, dataIndex: 'goods_id' }, 
        { title: '商品', width: 230, dataIndex: 'goods_name', 
            render: (text, record, index)=> {
                return (
                    <React.Fragment>
                      <img className="list-goods-pic" src={record.goods_picture} alt=""/>
                      <div className="ellipsis" style={{lineHeight: '32px'}}>{record.goods_name}</div>
                    </React.Fragment>
                )
            }
         }, 
        { title: '规格', width: 100, dataIndex: 'options_name' }, 
        { title: '备注', width: 100, dataIndex: 'remark', 
            render: (text,record, index) => {
                if(!text) return '-'
                return text
            }
        }, 
        { title: '单位', width: 100, dataIndex: 'base_units' ,
            render: (text, record, index) => {
                if( !!record.container_units ){
                    return `1${record.container_units}=${record.conversion_number}${text}`
                }
                return text
            }
        },
        { title: '辅助数量', width: 150, dataIndex: 'status_name', className:'text-right', 
            render: (text, record, index) => {
                if( !! record.container_units){
                    return Math.floor(record.warehousing_number / record.conversion_number) + record.container_units + '+' + (record.warehousing_number % record.conversion_number) + record.base_units
                }
                return record.warehousing_number + record.base_units;
            } 
        },
        { 
            title: '入库数量', width: 150, dataIndex: 'warehousing_number', className: 'text-right',
            render: (text) => {
                return (
                    <AccuracyCtrl type='quantity' value={text * 1} />
                )
            }
        },
    ]
    
    static logColumns = [
        { title: null, width: 50, dataIndex: 'sequence',render: (text, record, index) => index + 1 },
        { title: '操作时间', width: 150, dataIndex: 'create_date' }, 
        { title: '操作人员', width: 100, dataIndex: 'account_name' }, 
        { title: '用户名称', width: 100, dataIndex: 'options_name' }, 
        { title: '操作类型', width: 100, dataIndex: 'operation_name_cn' }, 
        { title: '操作日志', width: 300, dataIndex: 'remark' },
    ];
    static paymentColumns = [
        { title: null, width: 50, dataIndex: 'sequence',render: (text, record, index) => index + 1 },
        { title: '单号', width: 130, dataIndex: 'payment_num' }, 
        { title: '支付时间', width: 130, dataIndex: 'receipts_date' }, 
        { title: '付款金额', className: "text-right", width: 130, dataIndex: 'amount', 
            render: (text) => {
                <AccuracyCtrl type='price' value={text} />
            }
        }, 
        { title: '支付方式', width: 130, dataIndex: 'type_id_name' }, 
        { title: '付款账户', width: 160, dataIndex: 'account_name' },
        { title: '备注', width: 160, dataIndex: 'remark',
            render: (text) => { 
                if(!text) return '-'
                return text
            }
        },
        { title: '操作', dataIndex: 'operate', render: () => {return <a className="list-link">查看</a>} }
    ];
    

    state = {
        tabKey: '1',
        showCheck: false,
        modalType: 'cancel',
        wareList: [],              // 入库收货
        payment: [],
        showNewPayment: false,       // 新增付款记录
    }
    

    // 审核弹框
    getCheck( type ) {
        const { detail } = this.props
        console.log(detail)
        this.setState({
            showCheck: true,
            modalType: type,
        })
    }
    closeModal = () => {
        this.setState({
            showCheck: false,
        })
    }
    
    tabChange = (tabKey) => {
        if(tabKey === '3' && this.state.payment.length === 0){
            this.getPayment(tabKey);
            return;
        }
        if(tabKey === '2' && this.state.wareList.length === 0){
            this.getWarehouse(tabKey);
            return;
        }
        console.log(this.props.detail)
        this.setState({tabKey})
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.detail !== this.props.detail){
            this.addLastRow(nextProps.detail.list)
        }
    }
    
    getWarehouse(tabKey){
        const { detail } = this.props

        axios.get(`Api/v1/purchases/${detail.main.purchase_id}/purchaseWarehousingList`)
        .then((res) => {
            console.log(res.data)
            this.setState({
                wareList: res.data.ware_list || [],
                tabKey
            })
        })
    }
    getPayment(tabKey){
        const { detail } = this.props

        axios.get(`Api/v1/purchases/${detail.main.purchase_id}/financeList`)
        .then((res) => {
            this.setState({
                payment: res.data.payment || [],
                tabKey
            })
        })
    }
    addLastRow(list){
        if(list){
            let totalPrice = 0, totalNum = 0;
            list.forEach(item => {
                totalPrice += Number(item.amount)
                totalNum += Number(item.number)
            })
            list.push({
                purchase_list_id: 'last_row',
                lastRow: true,
                amount: totalPrice.toFixed(2),
                number: totalNum
            })
        }
    }
    toggleModal(e){
        
        const tabKey = Number(this.state.tabKey)
        if(tabKey === 3) {
            this.setState({
                showNewPayment: !this.state.showNewPayment
            })
        }else if (tabKey === 2){
            this.props.history.push(`/Manager/Purchase/waitlists/${this.props.detail.main.purchase_id}`)
        }
        
    }
    submitForm(){
        /**
         * 提交formdata
         */
        this.props.form.validateFields ((err, fieldsValue) => {
            if (err) {
                console.log(err)
                return;
            }

            const date = this.formRef.props.form.getFieldValue('date').format('YYYY-MM-DD')
            const formData = Object.assign({},this.formRef.props.form.getFieldsValue(),{date:date})
        })   
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    }
    render(){
        const { detail, ...props } = this.props
        const { tabKey, payment, wareList, showNewPayment, showCheck, modalType } = this.state
        if(!detail){
            return <Slide visible={false} onClose={() => {}} />
        }
        
        return (
            <div>
                <OperateModal visible={showCheck} onCancel={this.closeModal}  refresh={props.refresh} detail={detail} modalType={modalType} />
                <Slide {...props}>
                    <div className="slide-content">
                        <div>
                            <span className="dhb-info-num">采购单号：{detail.main.purchase_num}</span>
                            <Tag color="volcano">{detail.main.status_name}</Tag>
                            <Tag color="volcano">{detail.main.pay_status_name}</Tag>
                        </div>
                        <Row className="view-item-wrap" style={{margin: '19px 0 16px'}}>
                            <Col span={9}>供应商：{detail.main.supplier_name}</Col>
                            <Col span={6}>采购员：{detail.main.staff_name}</Col>
                            <Col span={9}>创建时间：{detail.main.create_date}</Col>
                            <Col span={9}>联系人：{detail.main.supplier_name}</Col>
                            <Col span={6}>入库仓库：{detail.main.stock_name}</Col>
                            <Col span={9}>交货日期：{detail.main.delivery_date}</Col>
                        </Row>
                        <Tabs activeKey={tabKey} onChange={this.tabChange}>
                            <TabPane tab="订单详情" key="1">
                                <Row style={{marginBottom: '10px'}}>
                                    <Col span={8}><span style={{fontSize: '18px',fontWeight:700}}>商品清单</span></Col>
                                    <Col span={16} className="text-right">
                                        <Select className="hide" placeholder="排序" style={{width: '260px'}}>
                                            <Option value="jack">按下单时间排序</Option>
                                            <Option value="lucy">Lucy</Option>
                                            <Option value="disabled" disabled>Disabled</Option>
                                            <Option value="Yiminghe">yiminghe</Option>
                                        </Select>
                                    </Col>
                                </Row>
                                <Table 
                                    pagination={false} 
                                    rowKey="purchase_list_id" 
                                    columns={Detail.goodsColumns} 
                                    size="middle"
                                    dataSource={detail.list} 
                                />
                               
                                <div style={{fontSize: '18px', marginTop: '20px'}}>单据备注</div>
                                <div className="order-remark">订单备注：{detail.main.remark}</div>
                                <div className="order-remark">内部沟通：{detail.main.internal_comtion}</div>
                            </TabPane>
                            <TabPane tab="入库收货" key="2">
                                <div><span style={{fontSize: '18px',fontWeight:700}}>收货入库记录</span></div>
                                
                                {
                                    wareList.map( v => {
                                        return ( 
                                            <div style={{marginTop: '20px'}} key={v.main.warehousing_id}>
                                                <Row gutter={16} style={{marginBottom: '10px'}}>
                                                    <Col span={12}>
                                                        <div style={{lineHeight: '32px'}}>
                                                            <span className='colorf75'>{v.main.warehousing_num}</span>
                                                            &nbsp;
                                                            {v.main.storage_date}
                                                            &nbsp;
                                                            {v.main.stock_name}
                                                        </div>
                                                        
                                                    </Col>
                                                    <Col span={12} className='text-right'>
                                                        <Button className="icon-btn" icon="edit">编辑</Button>
                                                    </Col>
                                                </Row>
                                                <Table 
                                                    pagination={false} 
                                                    rowKey="goods_id"
                                                    columns={Detail.warehouseColumns} 
                                                    size="middle"
                                                    dataSource={v.list} 
                                                />
                                            </div>
                                        )
                                    })
                                }
                                
                            </TabPane>
                            <TabPane tab="付款记录" key="3">
                                <Row style={{marginBottom: '10px',fontWeight:700}}>
                                    <Col span={8}>
                                        <Icon type="pay-circle" style={{color:'#ff7557',fontSize:24,marginRight:10,verticalAlign:'sub'}}/>
                                        <span style={{fontSize: '18px'}}>待付金额：￥
                                            <AccuracyCtrl type='price' value={(detail.main.total*1 - detail.main.account_paid*1)} />
                                        </span>
                                    </Col>
                                    <Col span={16} className="text-right"  style={{fontSize: '16px'}}>
                                        <span style={{marginRight: '30px'}}>应付金额：￥
                                            <AccuracyCtrl type='price' value={detail.main.total} />
                                        </span>
                                        <span>已付金额：￥
                                            <AccuracyCtrl type='price' value={detail.main.account_paid} />
                                        </span>
                                    </Col>
                                </Row>
                                <Table 
                                    pagination={false} 
                                    rowKey="payment_id"
                                    columns={Detail.paymentColumns} 
                                    size="middle"
                                    dataSource={payment} 
                                />
                            </TabPane>
                            <TabPane tab="操作记录" key="4">
                                <div><span style={{fontSize: '18px',fontWeight:700}}>操作日志</span></div>
                                <Table 
                                    pagination={false} 
                                    rowKey="create_date"
                                    columns={Detail.logColumns} 
                                    size="middle"
                                    dataSource={detail.log} 
                                />
                            </TabPane>
                        </Tabs>
                    </div>
                    {
                        tabKey !== '4'  
                        ? <div className="slide-footer">
                            <Row>
                                <Col span={12}>
                                    {
                                        tabKey === '1' && detail.main.status === 'pending' && <Button href={`#/Manager/Purchase/purchase/${detail.main.purchase_id}`} className="icon-btn" icon="edit">编辑</Button>
                                    }
                                    <Tooltip placement="top" title="打印">
                                        <Button className="icon-btn hide" icon="printer" />
                                    </Tooltip>
                                    {
                                        tabKey === '1' && (
                                            <Tooltip placement="top" title="复制订单">
                                                <Button className="icon-btn hide" icon="copy" />
                                            </Tooltip>
                                        )
                                    }
                                    {
                                        tabKey !== '3' && (
                                            <Tooltip placement="top" title="导出Excel文件">
                                                <Button className="icon-btn hide" icon="file-excel" />
                                            </Tooltip>
                                        )
                                    }
                                    {
                                        tabKey === '3' && (
                                            <Tooltip placement="top" title="???">
                                                <Button className="icon-btn hide" icon="upload" />
                                            </Tooltip>
                                        )
                                    }
                                </Col>
                                <Col span={12} className="text-right">
                                    {
                                        tabKey === '1' &&
                                        <React.Fragment>
                                            <Button className="icon-btn" onClick={ () => {this.getCheck('cancel')} } >取消订单</Button>
                                            {
                                                detail.main.status === 'pending' 
                                                    ? <Button type='primary' className="icon-btn"  onClick={ () => {this.getCheck('approved')} } >通过审核</Button>
                                                    : <Button type='primary' className="icon-btn" onClick={ () => {this.getCheck('undo')} } >撤销订单</Button>
                                            }
                                        </React.Fragment>
                                    }
                                    
                                    {
                                        tabKey === '2' || tabKey === '3' 
                                        ? <Button type="primary" icon="plus" onClick={this.toggleModal.bind(this)}>新增</Button>
                                        : null
                                    }
                                </Col>
                            </Row>
                        </div>
                        : null
                    }
                    
                    
                </Slide>
                <div>
                    <NewPayment 
                        wrappedComponentRef={this.saveFormRef}
                        visible={showNewPayment}
                        onCancel={this.toggleModal.bind(this)}
                        onCreate={this.toggleModal.bind(this)}
                        onSubmit={this.submitForm.bind(this)}
                        detailMain={detail.main}
                    />
                </div>
            </div>
        )
    }
}

export default Detail = withRouter(Form.create()(Detail))