import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

/**
 * 当前DOM之外点击 如弹框 点击弹框外部需要关闭弹框
 */
export default class ClickOutside extends Component{
    static defaultProps = {
        clickOutside: PropTypes.func.isRequired
    }
    
    componentDidMount(){
        document.addEventListener('click', this.handleClickOutside, false);
        this._domNode = ReactDOM.findDOMNode(this);    
    }
    componentWillUnmount(){
        document.removeEventListener('click', this.handleClickOutside, false);
    }
    handleClickOutside = (e) => {
        const { clickOutside } = this.props;
        if(!this._domNode.contains(e.target)){
            clickOutside(e)
        }
    }
    render(){
        const _child = React.Children.only(this.props.children);
        return [_child]
    }
}