import React from 'react';

import { Modal, Button, Table, Checkbox, Input, Divider } from 'antd';
import axios from 'UTILS/http';

let hasShowDialog = false
export default class HomeDialog extends React.Component{

    constructor(props){
        super(props)
        let { dialog, showDialog } = this.props;
 
        for (let key of Object.keys(dialog)) {
            //TODO 屏蔽易极付设置
            if(dialog[key].status === 'T' && key !== 'bank'){
                showDialog = key;
                break;
            }
        }

        this.showDialog = showDialog;//'need_verificate'; 
        this.state = {
            width: this.showDialog === 'need_verificate' ? 500 : 600,
            title: this.showDialog === 'need_verificate' ? '二次安全验证' : '系统提示',
            maskClosable: this.showDialog === 'need_verificate' ? false : true,
            validateCode : '',
            sendHmtl: '获取验证码',
            visible: !!this.showDialog,
            showCost: false,
            showErr: false,
            showErrDes: ''
        }
    }
    columns = [
        {title: '产品名称', dataIndex: 'product_name'},
        {title: '服务名称', dataIndex: 'service_name', render: () => '单笔费率'},
        {title: '费率', dataIndex: 'cost'}
    ]
    costData = [
        {product_name: '网银支付(单位银行账户)', service_name: '', cost: '8元'},
        {product_name: '网银支付(个人借记卡)', service_name: '', cost: '0.3%'},
        {product_name: '快捷支付(个人借记卡)', service_name: '', cost: '5元'},
        {product_name: '微信支付(公众号)', service_name: '', cost: '0.6%'},
        {product_name: '微信支付(APP)', service_name: '', cost: '0.6%'},
        {product_name: '微信扫码支付', service_name: '', cost: '0.6%'},
        {product_name: '微信刷卡支付', service_name: '', cost: '0.6%'},
        {product_name: '银联支付(聚合支付)', service_name: '', cost: '0.6%'}
    ]
    toggleModal = () => {
        hasShowDialog = true
        this.setState({
            visible: !this.state.visible
        })

        if(this.showDialog === 'need_verificate'){
            this.logout();
        }
    }

    //二次验证
    need_verificate(dialog){
        return(
            <div>
                <div style={{marginTop: '20px'}}>
                    <Input size="large" onPressEnter={this.validateCode} onChange={this.changeValue.bind(this)} suffix={<a style={{color:'#ff8368'}} onClick={this.getValidateCode.bind(this)}>{this.state.sendHmtl}</a>}/>
                    <p style={{color:'#ff6f6f', marginTop: '5px'}} className={this.state.showErr? '' : 'hide'}>{this.state.showErrDes}</p>
               </div>
               <Divider style={{margin:'40px -24px 14px', width:'500px'}} />
                <div className="text-center">
                    <Button type="primary" onClick={this.validateCode}>确定</Button>
                </div>
            </div>
        )
    }

    changeValue(e){
        this.setState({
            validateCode: e.target.value
        });
    }

    //退出登录
    logout(){
        axios.post('Api/v1/users/logout', {})
        .then((res) => {
            if(res.status === 'T'){
                window.localStorage.removeItem('_tabs_')
                //window.localStorage.removeItem('loginData')
                window.location.href = res.data.redirect_url
            }
        })
    }

    //获取二次验证码
    getValidateCode(e) {
       
        if(this.isSending){
            return;
        }
        this.isSending = true;
        let code_timer = null;

        axios.post('Api/v1/sms/verification', {})
		.then((res) => {
          
			if (res.status !== 'T') {
				message.error('获取验证码失败')
			}else{

                this.setState({
                    showErr: true,
                    showErrDes: res.data.message
                });

                let _count = 59;
                this.setState({sendHmtl: _count + 's'})
                
                code_timer=  setInterval(() => {
                    _count--;
                    if(_count > 0 ){
                        this.setState({sendHmtl: _count + 's'})
                    }else{
                        this.setState({sendHmtl: '获取验证码'})
                        this.isSending = false;
                        clearInterval(code_timer);
                    }
                }, 1000);
            }
		})
		.catch(error => {
            this.isSending = false;
			if(err.response.data.error){
                this.setState({
                    showErr: true,
                    showErrDes: err.response.data.error.message
                });
           }
		})
       
    }

    //验证验证码是否正确
    validateCode = () => {
        axios.post('Api/v1/home/verification', {verification_code: this.state.validateCode})
		.then((res) => {
          
			if (res.status !== 'T') {
                this.setState({
                    showErr: true,
                    showErrDes: res.error.message
                });
               
			}else{
                hasShowDialog = true
                this.setState({
                    visible: false
                })
            }
		})
		.catch(err => {
           if(err.response.data.error){
                this.setState({
                    showErr: true,
                    showErrDes: err.response.data.error.message
                });
           }
		})
    }

    // 过期
    already_expiry(dialog){
        return (
            <div>
                <div>
                    <p>亲爱的订货宝客户：</p>
                    <p>您的系统使用期限已经到期</p>
                </div>
                {
                dialog.notice === 'realname'
                ?
                <div className="text-center">
                
                    <p>亲，划重点啦！请按照规范上传实名认证资料哟</p>
                    <p>实名认证，上传您的营业执照，可获得30天的免费试用时间</p>
                    <p>官方咨询电话：<span className="theme-color">400-8066-081</span></p>
                    <Button type="primary" href="#/Manager/System/credentials">实名认证</Button>
                    
                
                </div>
                :
                <div className="text-center">
                    <p>请尽快续费购买，以免影响您的正常使用！</p>
                    <Button type="primary" target="_blank" href="https://manager.dhb168.com/index.php?module=Manager&controller=Buy&action=index">去续费</Button>
                </div>
                }
            </div>
        )
    }
    // 支付
    bank(){
        return (
            <div>
                <div>
                    <p><span></span></p>
                    <div>开通在线收款，您的客户可以通过支付宝、微信支付、银行卡、聚合支付等多种方式向您付款！<a onClick={this.toggleCost}>资费介绍>></a></div>
                </div>
                <div>
                    <div className="text-center">仅需一步，即可使用在线收款：</div>
                    <div>
                        <div>
                            <div>
                                <p>个人用户</p>
                                <p>绑卡便捷，自动、即时结算到卡</p>
                            </div>
                            <Button type="primary">管理账户</Button>
                        </div>
                        <div>
                            <div>
                                <p>企业用户</p>
                                <p>提现免手续费、便捷省心</p>
                            </div>
                            <Button type="primary">管理账户</Button>
                        </div>
                    </div>
                    <div className="text-center">
                        <label>
                            <Checkbox>不再提示</Checkbox>
                        </label>
                    </div>
                </div>
            </div>
        )
    }
    // 剩余时间提醒
    free_version(dialog){
        return (
            <div>
                <div>
                    <p>亲爱的订货宝客户：</p>
                    <p>您的系统还可以{dialog.is_free === 'T' ? '免费试用' : '使用'}<span className="theme-color">{dialog.days_remaining}</span>天</p>
                </div>
                {dialog.company_status === 'T'
                ?
                <div className="text-center">
                    <p>也许您还没来得及购买，或刚刚度假归来。感谢您的关注和青睐、我们一直在等您~</p>
                    <p>官方咨询电话：<span className="theme-color">400-8066-081</span></p>
                    <Button type="primary" target="_blank" href="https://manager.dhb168.com/index.php?module=Manager&controller=Buy&action=index">立即购买</Button>
                </div>
                :
                <div className="text-center">
                    <p>实名认证，上传您的营业执照，可获得30天的免费试用时间</p>
                    <p>实名认证审核通过后，成为正式用户，开启全部功能权限</p>
                    <p>期待您对我们更深入的了解~</p>
                    <p>官方咨询电话：<span className="theme-color">400-8066-081</span></p>
                    <Button type="primary" href="#/Manager/System/credentials">实名认证</Button>
                </div>
                }
            </div>
        )
    }
    // 通知
    notice(dialog){
        return (
            <div>
                <div>
                    <p className="theme-color">{dialog.notice.create_time}</p>
                    <p style={{fontSize: '18px'}}>{dialog.notice.notice_title}</p>
                </div>

                <div>
                    <div>{dialog.notice.notice_summary}</div>
                    <div className="text-center"><Button style={{marginTop: '16px'}} type="primary" onClick={this.goNoticeView.bind(this, dialog.notice.notice_id)}>查看公告</Button></div>
                </div>
            </div>
        )
    }
    goNoticeView(id, e){
		const location = {
			pathname: `/Manager/PlatformNotice/view?id=${id}`, 
			state: {path: '/Manager/PlatformNotice/view',name: '通知详情'}
		}
		const { history } = this.props
		history.push(location)
	}
    // 未确认的合同
    unsign_contract(){
        return (
            <div>
                <div>
                    <p>亲爱的订货宝客户：</p>
                    <p>您购买的服务已生成电子合同，请查阅、签字！</p>
                </div>
                <div className="text-center">
                    <p>电子合同与纸质合同具有一样的法律效应，请放心使用</p>
                    <p>登录平台、拖动盖章、填写验证码，即可完成合同签署</p>
                    <p>签署完成，即可开户。因合同是对您的保障，希望您能在7天内，完成合同的签署</p>
                    <p>官方咨询电话：<span className="theme-color">400-8066-081</span></p>
                    <Button type="primary" target="_blank" href="https://manager.dhb168.com/index.php?module=Manager&controller=EContract&action=index">签署合同</Button>
                </div>
            </div>
        )
    }
    getShowContent(){

        const showDialog = this.showDialog
        const { dialog } = this.props

        if(!showDialog){
            return null
        }
        
        return this[showDialog](dialog[showDialog])
    }

    toggleCost = () => {
        this.setState({
            showCost: !this.state.showCost
        })
    }
    
    render(){
        return (
            <Modal
                visible={this.state.visible && !hasShowDialog}
                width={this.state.width}
                title={this.state.title}
                maskClosable={this.state.maskClosable}
                destroyOnClose={true}
                footer={null}
                onCancel={this.toggleModal}
            >
                {this.getShowContent()}
                <Modal
                    width={800}
                    footer={null}
                    destroyOnClose={true}
                    onCancel={this.toggleCost}
                    visible={this.state.showCost}
                >
                    <Table pagination={false} columns={this.columns} dataSource={this.costData} />
                </Modal>
            </Modal>
        )
    }
}
