import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Popover, Input, Button } from 'antd'
const { TextArea } = Input;
const renderEl = document.getElementById('dhb-wrap')

export default class Remark extends Component{
    static propTypes = {
        onSure: PropTypes.func.isRequired
    }
    
    state = {
        edit: false,
        //enter: false
    }
    toggle = () => {
        this.setState({
            edit: !this.state.edit,
            enter: false
        })
    }
    onSure = () => {
        this.toggle()
        this.props.onSure(this._text)
    }
    mouseHover = () => {
        this.setState({
            enter: !this.state.enter
        })
    }
    change = (e) => {
        this._text = e.target.value
    }

    render(){
        const { edit, enter } = this.state
        let { text } = this.props
        if(!text){
            text = '编辑'
        }

        const content = (
            <div>
                <TextArea rows={4} defaultValue={this.props.text} onChange={this.change} onPressEnter={this.onSure} />
                <div className="remark-footer">
                    <Button onClick={this.toggle} size="small">取消</Button>
                    <Button onClick={this.onSure} type="primary" size="small">确定</Button>
                </div>
            </div>
        )
        return (
            <div>
                {
                    edit ?
                    <Popover 
                        overlayStyle={{width: '250px'}} 
                        trigger="click"
                        visible={edit} title="备注" 
                        content={content} 
                        getPopupContainer={() => renderEl}
                        onVisibleChange={this.toggle} 
                        placement="topRight">
                        {text}
                    </Popover>
                    :
                    <div onMouseEnter={this.mouseHover} onMouseLeave={this.mouseHover} onClick={this.toggle}><a className="list-link">{enter ? '编辑' : text}</a></div>
                }
            </div>
        )
    }
}