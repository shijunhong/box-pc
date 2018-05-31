import React, { Component } from 'react';

import { Link } from 'react-router-dom'

import { Tag, Icon, Button, Dropdown, Menu, Avatar, Badge, Modal, Row, Input, Col, message } from 'antd';

import { triggerRefresh, getCookie } from 'UTILS/utils';
import axios from 'UTILS/http';

import IM from 'bundle-loader?lazy&name=im!PAGES/index/im'

const loginData = JSON.parse(window.sessionStorage.getItem('_loginData') || window.localStorage.getItem('loginData') || '{"accounts":{},"company":{}}')

let HOST = window.location.host;
let customerLogo, dhbLogo;

if(window.devicePixelRatio > 1){
    dhbLogo = require('../../assets/img/logo@2x.png');
}else{
    dhbLogo = require('../../assets/img/logo.png');
}

if(NPM_SCRIPT !== 'build' && NPM_SCRIPT !== 'start' && !HOST.includes('m.dhb168.com')){
    HOST = HOST.split('.')
    HOST.shift()
    HOST = HOST.join('.')
    customerLogo = 'https://public.dhb168.com/brand/' + HOST + '/logo-manager.png';
}


const refreshMenu = (context) => (
    <Menu onClick={context.refreshClick} style={{width: '140px'}}>
        <Menu.Item key="reload">
          <div className="action-item"><Icon type="reload" />刷新当前</div>
        </Menu.Item>
        <Menu.Item key="close_curr">
          <div className="action-item"><Icon type="close" />关闭当前</div>
        </Menu.Item>
        <Menu.Item key="close_all">
          <div className="action-item"><Icon type="poweroff" />关闭全部</div>
        </Menu.Item>
    </Menu>
)
const myMenu = (context) => (
    <Menu onClick={context.accountManager} style={{width: '140px'}}>
        <Menu.Item key="4">
          <div className="action-item user-account">{context.props.sysConfig.account ? context.props.sysConfig.account.accounts_name : null}</div>
        </Menu.Item>
        <Menu.Item key="1">
          <div className="action-item"><Icon type="user" />我的账号</div>
        </Menu.Item>
        <Menu.Item key="2">
          <div className="action-item"><Icon type="lock" />修改密码</div>
        </Menu.Item>
        {
            context.props.sysConfig.account && context.props.sysConfig.account.is_show_swap === "T" ?
            <Menu.Item key="5">
                <div className="action-item"><Icon type="swap" />切换为订货商</div>
            </Menu.Item>
            :null
        }
        
        <Menu.Divider />
        <Menu.Item key="3">
          <div className="action-item"><Icon type="logout" />退出登录</div>
        </Menu.Item>
    </Menu>
)
const msgColors = (count) => ({
    // 订单留言
    orders: {
        color: '#FF6D6D',
        icon: 'message'
    },
    // 留言咨询
    posts: {
        color: '#FF69B7',
        icon: 'message'
    },
    // 站内消息（依次 订单，客户， 付款， 退货， 商品审核）
    inners: {
        orders: {
            key: 'orders',
            color: '#FF7557',
            icon: 'file',
            text: '你有 ' + count + ' 笔新订单待处理'
        },
        client: {
            key: 'client',
            color: '#57A8FF',
            icon: 'user',
            text: '你有 ' + count + ' 个客户注册待处理'
        },
        payment: {
            key: 'payment',
            color: '#FFB300',
            icon: 'pay-circle-o',
            text: '你有 ' + count + ' 笔交易付款待处理'
        },
        returns: {
            key: 'returns',
            color: '#B464FF',
            icon: 'pay-circle-o',
            text: '你有 ' + count + ' 笔退款申请待处理'
        },
        goods: {
            key: 'goods',
            color: '#44C433',
            icon: 'check',
            text: '你有 ' + count + ' 个联营商品待处理'
        }
    }
})

const messageMenu = (context) => {
    const { messages, IMUnread } = context.state
    return (
        <Menu style={{width: '280px'}}>
            {
                messages.inners.map((item, index) => {
                    const _inner = msgColors(item.count_).inners[item.type]
                    return(
                        <Menu.Item key={_inner.key}>
                            <a href={'#/' + item.url} className="action-item msg-action">
                                <Avatar style={{backgroundColor: _inner.color}} icon={_inner.icon} />
                                <div>
                                    <div>{_inner.text}</div>
                                    {/* <div className="header-time">{item.date_str}</div> */}
                                </div>
                            </a>
                        </Menu.Item>
                    )
                })
            }
            
            {
                messages.orders > -1
                ?
                <Menu.Item key="2">
                    <a href="#/Manager/Sale/leaveMsg" className="action-item msg-action">
                        <Avatar style={{backgroundColor: msgColors().orders.color}} icon={msgColors().orders.icon} />
                        <div>
                            <div>你收到 {messages.orders} 条订单消息</div>
                        </div>
                    </a>
                </Menu.Item>
                : null
            }
            {
                messages.posts > -1
                ?
                <Menu.Item key="3">
                    <a href="#/Manager/MsgPost/index" className="action-item msg-action">
                        <Avatar style={{backgroundColor: msgColors().posts.color}} icon={msgColors().posts.icon} />
                        <div>
                            <div>你收到 {messages.posts} 条留言咨询</div>
                        </div>
                    </a>
                </Menu.Item>
                : null
            }
            {
                context.props.sysConfig.im
                ?
                <Menu.Item key="4">
                    <a className="action-item msg-action" onClick={context.goIM}>
                        <Avatar style={{backgroundColor: '#FF69B7'}} icon="message" />
                        <div>
                            <div>你收到 {IMUnread} 条即时消息</div>
                        </div>
                    </a>
                </Menu.Item>
                : null
            }
            {/* <Menu.Divider />
            <Menu.Item key="4">
            <div className="action-item"><Link to="/Manager/RedPacket/top" className="go-msg-center">进入消息中心</Link></div>
            </Menu.Item> */}
        </Menu>
    )
}

export default class Header extends Component {

	/*changeMode = (value) => {
        this.setState({
            mode: value ? 'vertical' : 'inline',
        });
    }*/
    constructor(props) {
      super(props);
      this.state = {
        showTabsCount: this.calShowTabsCount(),
        visible: false,
		showRevise: false,
        IMLoaded: null,
        IMUnread: 0,
        messageCount: 0
      };
    }

    params = {}

    componentWillReceiveProps(nextProps){
        if(nextProps.sysConfig.im && !this.state.IMLoaded){
            IM((arg) => {this.setState({IMLoaded: arg.default})})
        }
    }
    // IM消息通知
    IMNotice = (unread) => {
        this.setState({
            IMUnread: unread
        })
    }
    // 跳转IM
    goIM(){
        let host = window.location.host
        host = host.split('.');
        host.shift()
        host = host.join('.')
        window.open(`//${IM_URL + host}/web/im/main-manager.html`, 'manager');
    }

    toggleModal(name, e){
        this.setState({
            [name] : !this.state[name]
        })
    }

    showModal = () => {
	    this.setState({
	      visible: true,
	    });
	}

    calShowTabsCount(){
        let pageWidth = window.innerWidth;
        pageWidth = pageWidth < 1280 ? 1280 : pageWidth;
        const tabWrapWidth = pageWidth - 400;

        return Math.floor(tabWrapWidth / 110);
    }
    refreshTab = () => {
       triggerRefresh();
    }
    toHome = () => {
        const { history } = this.props;

        history.push('/Manager/home')
    }
    refreshClick = (e) => {
        const { key } = e;
        switch(key){
            case 'reload':
                this.refreshTab();
                break;

            case 'close_curr':
                const { tabs } = this.props;
                const index = tabs.findIndex(item => item.isActive === true);

                if(index > 0){
                    this.closeTab(tabs[index]);
                }
                
                break;

            case 'close_all':
                this.closeTab(key);
                break;
        }
    }
    closeTab(tab, e) {

        e && e.stopPropagation();
    
        const { closeTab, history } = this.props;

        closeTab(tab, history)
        this.postMessage(tab)
    }
    postMessage(tab){
        const win = document.getElementById('pre-version').children[0].contentWindow;
        let content = 'all'

        if(tab !== 'close_all'){
            content = tab.path
        }
        console.log(content)

        win.postMessage(JSON.stringify({
            type: 'closeTab',
            content
        }), '*');
    }
    changeLocation(tab, e){
        if(tab.isActive || e.target.tagName.toLowerCase() === 'i'){
            return;
        }
        const { history } = this.props;
        const to = {
            pathname: tab.url,
            state: {
                path: tab.path,
                name: tab.name
            }
        }
        history.push(to)
    }

    getMessage(){
        axios.get('Api/v1/home/message', {
            params: {
                interval_time: 180
            }
        })
        .then((res) => {
            if(res.status === 'T'){

                let showCount = 0;

                if(res.data.orders > 0){
                    showCount += res.data.orders *1;
                }
                if(res.data.posts > 0){
                    showCount += res.data.posts *1;
                }
                if(res.data.inners){
                    
                    for(let i = 0; i < res.data.inners.length; i++){
                        showCount += res.data.inners[i].count_ *1;
                    }
                   
                }

                this.setState({
                    messages: res.data,
                    messageCount: showCount
                })
            }
        })
    }
    accountManager = (e) => {
        const { key } = e;
        switch(key){
            case '3':
                this.logout();
                break;
            case '2':
                this.setState({showRevise: true});
                break;
            case '1':
                const { history } = this.props;
                const location = {
                    pathname: '/Manager/Accounts/summary', 
			        state: {path: '/Manager/Accounts/summary',name: '我的账号'}
                }
                history.push(location)

                break;
            case '5':
                //切换到订货端
                this.swapClient();
                break;
        }
    }

    //切换到订货端
    swapClient(){
        /*
        const cookie = document.cookie
        const c_name = 'client_session_id'
        console.log(cookie)
        if(cookie.length > 0) {
            let c_start=document.cookie.indexOf(c_name + "=")
            if (c_start!=-1){
                c_start=c_start + c_name.length+1
                let c_end=document.cookie.indexOf(";",c_start)
                if (c_end==-1) c_end=document.cookie.length
                let clientSessionId = unescape(document.cookie.substring(c_start,c_end))　
            }
        }*/
        const clientSessionId = getCookie('client_session_id')
        axios.post('Api/v1/home/switchPlatform', {swap_from: 'manager', client_session_id: clientSessionId})
        .then((res) => {
            if(res.status === "T"){
                window.location.href = res.data.url
            }
        })
        .catch(err => {
           if(err.response.data.error){
                
           }
		})
    }

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

    componentDidMount() {
        if(!loginData.access_token){
            this.logout()
            return;
        }
        this.getMessage()
        window.addEventListener('resize', this.resizeWindow)
    }
    // 动态计算tab标签数量
    resizeWindow = (e) => {
        const showTabsCount = this.calShowTabsCount();
        if(showTabsCount !== this.state.showTabsCount){
            if(this.tabTimer){
                clearTimeout(this.tabTimer);
            }
            this.tabTimer = setTimeout(() => {
                this.setState({showTabsCount});
                this.tabTimer = null;
            }, 170)
        }
    }
    componentWillUnmount() {
      window.removeEventListener('resize', this.resizeWindow)
    }
    toggleHelp = () => {
      const { toggleAffix } = this.props; 
      toggleAffix('showHelp');
    }
   
    setValue = (e) => {
        const { value } = e.target;
        const { name } = e.target.dataset
        this.params[name] = value
    }

    changePassword = () =>{
       
        if(!this.params.old_password){
            message.error('请填写旧密码')
			return;
        }
        if(!this.params.password){
            message.error('请填写新密码')
			return;
        }
        if(!this.params.confirm_password ){
            message.error('请填写确认密码')
			return;
        }

        if(this.params.confirm_password !== this.params.password){
            message.error('新密码与确认密码不一致')
			return;
        }

        axios.post('Api/v1/users/changePassword', {old_password: this.params.old_password, password: this.params.password, confirm_password: this.params.confirm_password})
        .then(res => {
            if(res.status === 'T'){
                message.info(res.data.message, 3);
                this.toggleModal('showRevise');
            }
        })

    }

    getMoreMenu(){
        const tabs = this.props.tabs.filter((tab, index) => index > 0)

        const { showTabsCount } = this.state;
        const moreTabs = tabs.filter((item, index) => index >= showTabsCount - 1);

        const isActiveMore = moreTabs.find(item => item.isActive === true);
        let preActive = isActiveMore;

        if(isActiveMore){
            window.localStorage._preActive_ = JSON.stringify(isActiveMore)
        }
        else{
            preActive = JSON.parse(window.localStorage._preActive_);
            preActive.isActive = false;
        }
        

        let moreMenu;

        if(moreTabs.length > 1){
            moreMenu = (
                <Menu style={{width: '200px'}}>
                    {moreTabs.map((tab, index) => (
                        <Menu.Item key={tab.path}>
                          <div onClick={this.changeLocation.bind(this, tab)} className={`more-tab-item ${tab.isActive?'active':''}`}><Icon onClick={this.closeTab.bind(this, tab)} className="pull-right" type="close"/>{tab.name}</div>
                        </Menu.Item>
                    ))}

                </Menu>
            )
        }

        return moreTabs.length === 1 ? (
            <Tag key={moreTabs[0].path} style={{left: (showTabsCount - 1) * -10 + 'px'}} className={`tab-item ${moreTabs[0].isActive?'active':''}`} onClick={this.changeLocation.bind(this, moreTabs[0])} afterClose={this.closeTab.bind(this, moreTabs[0])} closable={true}>
                <span>{moreTabs[0].name}</span>
            </Tag>
        ) : (
            <Dropdown overlay={moreMenu}>
                <div onClick={this.changeLocation.bind(this, preActive)} style={{left: (showTabsCount - 1) * -10 + 'px', display: 'inline-block', cursor: 'pointer'}} className={`tab-item ${preActive.isActive?'active':''}`}>
                    <span style={{display: 'inline-block', width: '70px'}}>{preActive.name}</span><Icon type="down" />
                </div>
            </Dropdown>
        )
    }

    render() {
        const { toggleTheme, closeTab, sysConfig } = this.props;
        const { showRevise, visible, messages, messageCount, IMLoaded, IMUnread } = this.state
        const tabs = this.props.tabs.filter((tab, index) => index > 0)

        return (
            <div className="dhb-header">

                {IMLoaded ? <IMLoaded sysConfig={sysConfig} IMNotice={this.IMNotice} goIM={this.goIM} /> : null}
                <Modal
		          title="修改密码"
		          visible={showRevise}
		          width={500}
				  destroyOnClose={true}
				  onOk={this.changePassword}
		          onCancel={this.toggleModal.bind(this, 'showRevise')}
		        >
                    <Row><Col span={5} style={{textAlign: 'right', lineHeight: '32px'}}>旧密码：</Col><Col span={18}><Input type="password" data-name="old_password" onChange={this.setValue} /></Col> </Row>
                    <Row style={{marginTop: '10px'}} gutter={10}><Col span={5} style={{textAlign: 'right', lineHeight: '32px'}}>新密码：</Col><Col span={18}><Input data-name="password" type="password" onChange={this.setValue}/></Col> </Row>
                    <Row style={{marginTop: '10px'}} gutter={10}><Col span={5} style={{textAlign: 'right', lineHeight: '32px'}}>确认密码：</Col><Col span={18} ><Input data-name="confirm_password" type="password" onChange={this.setValue}/></Col> </Row>
                </Modal>
                <div className={`dhb-logo ${customerLogo ? 'brand' : ''}`} onClick={this.toHome}>
                    <span className=""><img src={customerLogo || dhbLogo} alt="" /></span>
                    <span className="dhb-version-type">{sysConfig.company ? sysConfig.company.version_cn : null}</span>
                    <span><Icon type="rollback" />首页</span>
                </div>
                <div className="tab-wrap" ref={(tabWrap) => {this.tabWrap = tabWrap}}>
                    <div>
                        {tabs.filter((item, index) => index < (this.state.showTabsCount - 1)).map((tab, index) => (
                            <Tag key={tab.path} style={{zIndex: 200 - index, left: index * -10 + 'px'}} className={`tab-item ${tab.isActive?'active':''}`} onClick={this.changeLocation.bind(this, tab)} afterClose={this.closeTab.bind(this, tab)} closable={true}>
                                <span>{tab.name}</span>
                            </Tag>
                        ))}

                        {tabs.length > this.state.showTabsCount - 1 ? this.getMoreMenu() : ''}
                        
                    </div>
                </div>
                <div>
                    <Dropdown overlay={refreshMenu(this)}>
                        <span className="header-action" onClick={this.refreshTab}><Icon type="reload" /></span>
                    </Dropdown>
                    {
                        messages 
                        ?
                        <Dropdown overlay={messageMenu(this)} placement="bottomCenter">
                            <span className="header-action">
                            <Badge count={messageCount + IMUnread} offset={[-3,3]}>
                                <a href="#" className="head-example"><Icon type="bell" /></a>
                            </Badge>
                           
                            </span>
                        </Dropdown>
                        : null
                    }
                    <span onClick={this.toggleHelp} className="header-action"><Icon type="question-circle-o" /></span>
                    <Dropdown overlay={myMenu(this)} placement="bottomRight">
                        <span className="header-action"><Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>{sysConfig.account && sysConfig.account.true_name ? sysConfig.account.true_name[0] : 'U'}</Avatar></span>
                    </Dropdown>
                </div>
            </div>
        );
    }
}
