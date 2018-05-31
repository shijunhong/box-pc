import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import SDK from '../../assets/js/NIM_Web_SDK_v4.8.0.js'

import './im.css'

// const nim = SDK.NIM.getInstance({})

export default class IM extends Component{

    static nim = null;
    static sessionsMap = {};

    state = {
        hasMessage: false
    }

    componentDidMount(){
        const { im } = this.props.sysConfig;
        let host = window.location.host
        host = host.split('.');
        host.shift()
        host = host.join('.')

        document.cookie = 'uid=' + im.accid + ';path=/;domain=' + host;
        document.cookie = 'sdktoken=' + im.sdktoken + ';path=/;domain=' + host;

        IM.nim = SDK.NIM.getInstance({
            appKey: im.appkey,
            account: im.accid,
            token: im.sdktoken,
            syncSessionUnread: true,
            /*onconnect: () => {
                alert('connect')
            }, 
            ondisconnect: (error) => {
                console.log('disconnect', error)
            },*/
            onerror: () => {
                alert('IM组件初始化失败！');
            },
            onsessions: (sessions) => {
                for(let i = 0; i < sessions.length; i++){
                    IM.sessionsMap[sessions[i].id] = sessions[i];
                }
                this.renderUnreadMsg();
            },
            onupdatesession: (session) => {
                IM.sessionsMap[session.id] = session;
                this.renderUnreadMsg();
            }
        })
    }
    renderUnreadMsg(){
        const { IMNotice } = this.props
        let unread = 0;
        for(let key of Object.keys(IM.sessionsMap)){
            unread += IM.sessionsMap[key].unread;
        }

        IMNotice(unread)

        this.setState({
            hasMessage: unread > 0
        })
    }
    
    render(){
        const { hasMessage } = this.state

        return ReactDOM.createPortal((
            <div onClick={this.props.goIM}>
                <div className={`pulse-2 ${hasMessage ? 'active-2' : ''}`}></div>
                <div className={`pulse-1 ${hasMessage ? 'active-1' : ''}`}></div>
                <div className="inner-circle triggerIM"></div>
            </div>
        ), document.body)
    }
}