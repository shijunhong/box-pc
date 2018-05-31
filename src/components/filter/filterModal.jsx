import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import { Icon } from 'antd'

const renderEl = document.getElementById('dhb-content')

/**
 * 筛选自定义弹框
 */
export default class FilterModal extends Component{
    static propTypes = {
        visible: PropTypes.bool,
        onCancel: PropTypes.func.isRequired
    }
    static defaultProps = {
        visible: false
    };

    cancel = (e) => {
        const thisEl = ReactDOM.findDOMNode(this)
        if(e.target !== thisEl && e.target !== thisEl.firstChild){
            return
        }
        const { onCancel } = this.props
        onCancel()
    }

    render(){

        const { visible } = this.props

        if(!visible){
            return null
        }
        
        return ReactDOM.createPortal(
            <div className={`filter-modal`} onClick={this.cancel}>
                <div className="filter-modal-wrap">
                    {this.props.children}
                </div>
            </div>
            ,
            renderEl
        )
    }
    
    
}
