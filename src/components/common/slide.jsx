import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import ClickOutside from './click_outside';

import { Icon } from 'antd'

const renderEl = document.getElementById('dhb-content')

/**
 * 公共侧滑组件
 */
export default class Slide extends Component{
    static propTypes = {
        placement: PropTypes.string,
        onClose: PropTypes.func.isRequired,
        visible: PropTypes.bool
    }
    static defaultProps = {
        placement: 'right',
        visible: false
    }
    state = {
        screen: false
    }

    /*shouldComponentUpdate(nextProps, nextState){
        return nextProps.visible !== this.props.visible || nextState.screen !== this.state.screen
    }*/

    toggleScreen = () => {
        this.setState({
            screen: !this.state.screen
        })
    }

    handleClickOutside = (e) => {
        // body下追加的模态框点击
        const domApp = document.getElementById('app')
        if(!domApp.contains(e.target)){
            return
        }
        const { className } = e.target
        if(className && className.includes('stop-bubble') || this.props.visible === false){
            return
        }
        
        const { onClose } = this.props
        onClose()
    }

    render(){
        const { visible, onClose } = this.props
        const screen = this.state.screen
        const _style = {}
        if(screen){
            _style.left = '16px';
        }
        return ReactDOM.createPortal(
            <ClickOutside clickOutside={this.handleClickOutside}>
                <div className={`dhb-slide ${visible ? 'slide-right' : ''}`} style={_style}>
                    {this.props.children}
                    <div className="dhb-slide-action">
                        <Icon type={screen ? 'swap-right' : 'swap-left'} onClick={this.toggleScreen} />
                        <Icon type="close" onClick={onClose} />
                    </div>
                </div>
            </ClickOutside>
            ,
            renderEl
        )
    }
    
}
