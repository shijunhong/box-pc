import React, { Component } from 'react';

import { Icon, Divider, Button, Modal, Tabs, Carousel, Input, Upload, message, Popover } from 'antd'

import appCode from '../../assets/img/app_code.jpg'

import axios from 'UTILS/http';

import ScrollBar from 'PAGES/common/scroll_bar'

const TabPane = Tabs.TabPane;
const TextArea = Input.TextArea

const localData = JSON.parse(window.sessionStorage.getItem('_loginData') || window.localStorage.getItem('loginData') || '{}')

const qqLink = localData.company && localData.company.version === 'free' ? 
	'https://admin.qidian.qq.com/template/blue/mp/menu/qr-code-jump.html?linkType=0&env=ol&kfuin=2852063081&kfext=2852063081&fid=44&key=a6d36fc039b75ff43c56acbd9d8cf97e&cate=1&type=16&ftype=1&roleKey=roleQQ&roleValue=1&roleName=&roleData=25&roleUin=25&_type=wpa' 
	: 
	'https://admin.qidian.qq.com/template/blue/mp/menu/qr-code-jump.html?linkType=0&env=ol&kfuin=2852063081&kfext=2852063081&fid=45&key=36e7b2ed325e54cb7a0e4c34a724db8b&cate=1&type=16&ftype=1&roleKey=roleQQ&roleValue=1&roleName=&roleData=65&roleUin=65&_type=wpa'

/**
 * 帮助中心
 */
export default class Help extends Component {
	state = {
		visible: false,
		showAdvise: false
	}
	toggleModal(name, e){
		this.setState({
			[name]: !this.state[name]
		})
	}

	showModal = () => {
	    this.setState({
	      visible: true,
	    });
	}
	feedBack = (e) => {
		this.feedContent = e.target.value
	}
	saveFeedBack = () => {
		if(!this.feedContent){
			message.error('请填写反馈内容')
			return;
		}
		axios.post('Api/v1/feedbacks', {feedback: this.feedContent})
        .then(res => {
            if(res.status === 'T'){
                message.info('保存成功', 3);
				this.toggleModal('showAdvise');
            }
        })
	}

	render() {
		const { showAdvise, visible } = this.state
		return (
			<div style={this.props.style} className="dhb-help">
				<Modal
		          title="意见反馈"
		          visible={showAdvise}
		          width={730}
				  destroyOnClose={true}
				  onOk={this.saveFeedBack}
		          onCancel={this.toggleModal.bind(this, 'showAdvise')}
		        >
					<p>欢迎您反馈：对产品使用的方便性、功能建议、不满足你的业务特性与管理要求、产生疑惑、困扰、看不懂的地方等。</p>
					<TextArea placeholder="最多200字" rows={5} onChange={this.feedBack} />
					<div className="hide" style={{marginTop: '14px'}}>
						<Upload>
							<Button icon="upload">上传图片</Button>
							<span> 上传页面截图，便于我们理解您的问题。(大小不超过2M，最多5张)</span>
						</Upload>
					</div>
				</Modal>
				<ScrollBar>
					<Modal
					title="新手须知"
					visible={visible}
					width={800}
					destroyOnClose={true}
					footer={null}
					onCancel={this.toggleModal.bind(this, 'visible')}
					>
					<p className="color000" style={{fontSize: '20px',lineHeight: '30px',marginBottom: '10px'}}>订货宝针对企业的不同职务人员，产品价值侧重点不同，一切源于您业务场景的需要</p>
					<Tabs defaultActiveKey="1" className="help-tab">
						<TabPane tab="老板和业务高管" key="1">
							<Carousel autoplay>
								<div><img src={require('../../assets/static/guide-01.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-02.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-03.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-04.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-05.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-06.jpg')} alt=""/></div>
							</Carousel>
						</TabPane>
						<TabPane tab="业务员" key="2">
							<Carousel autoplay>
								<div><img src={require('../../assets/static/guide-07.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-08.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-09.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-10.jpg')} alt=""/></div>
							</Carousel>
						</TabPane>
						<TabPane tab="财务" key="3">
							<Carousel autoplay>
								<div><img src={require('../../assets/static/guide-11.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-12.jpg')} alt=""/></div>
							</Carousel>
						</TabPane>
						<TabPane tab="下游订货商" key="4">
							<Carousel autoplay>
								<div><img src={require('../../assets/static/guide-13.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-14.jpg')} alt=""/></div>
							</Carousel>
						</TabPane>
						<TabPane tab="技术与规格" key="5">
							<Carousel autoplay>
								<div><img src={require('../../assets/static/guide-15.jpg')} alt=""/></div>
								<div><img src={require('../../assets/static/guide-16.jpg')} alt=""/></div>
							</Carousel>
						</TabPane>
					</Tabs>
					</Modal>

					<p className="help-title" onClick={() => {window.open('https://manager.dhb168.com/web/helpCenter')}}><Icon type="question-circle-o" />帮助中心</p>
					<div className="help-link" onClick={this.toggleModal.bind(this, 'visible')}><span className="help-icon"></span>新手帮助</div>
					<div className="help-link help-video" onClick={() => {window.open('https://manager.dhb168.com/web/helpCenter/index/classifyId/16')}}><span className="help-icon help-icon-video"></span>视频学习</div>

					<div><Button className="help-button" onClick={() => {window.open('https://manager.dhb168.com/web/helpCenter')}}>帮助中心</Button></div>
					<div className="help-divider"><Divider /></div>

					<div className="help-title"><Icon type="customer-service" />在线客服</div>
					<div className="hide">服务经理</div>
			
					<div style={{margin: '20px 0'}}><Button className="help-button" href={qqLink} target="_blank"><Icon type="qq" style={{fontSize: '18px'}}/>QQ咨询</Button></div>

					<div>
						<Popover content={<div><img src={appCode} alt="" width="130" style={{height: '130px'}} /></div>}>
							<Button className="help-button"><Icon type="wechat" style={{color: '#3EC64C',fontSize: '18px', verticalAlign: 'middle'}} />微信咨询</Button>
						</Popover>
					</div>

					<Divider><Icon type="phone" /></Divider>

					<div className="help-hot-line text-center">400-6311-887</div>

					<div className="help-divider"><Divider /></div>

					<div className="help-title"><Icon type="file-unknown" />意见反馈</div>
					<div><Button className="help-button" onClick={this.toggleModal.bind(this, 'showAdvise')}>立即反馈</Button></div>

					<div className="help-divider"><Divider /></div>

					<div className="help-title"><Icon type="global" />订货宝官网</div>
					<div><Button className="help-button" href="https://www.dhb168.com" target="_blank">立即访问</Button></div>
				</ScrollBar>
			</div>
		);
	}
}

