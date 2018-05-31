import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';

import axios from 'UTILS/http'

import { Row, Col, Button, Checkbox, Icon } from 'antd'

import ScrollBar from './scroll_bar'

const renderEl = document.getElementById('dhb-content')
/**
 * 表格字段显示以及顺序设置组件
 * author： zyt
 * date：2018-3-1
 */
export default class TableFieldSet extends Component{
    static defaultProps = {
        visible: false
    }
    static propTypes = {
        visible: PropTypes.bool,
        columns: PropTypes.array,
        onOk: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired
    }

    
    constructor(props){
        super(props)
        this.state = {
            columns: props.columns
        }
    }

    componentWillReceiveProps(nextProps){
        const { columns } = nextProps
        if(columns === this.props.columns){
            return
        }
        if(columns && nextProps.columns.length > 0){
            const _columns = []
            columns.forEach(item => {
                _columns.push(Object.assign({}, item))
            })
            this.state.columns = _columns
        }
    }
    shouldComponentUpdate(nextProps, nextState){
        return nextProps.visible !== this.props.visible && nextProps.columns.length > 0 
            || nextProps.columns !== this.props.columns 
            || nextState.columns !== this.state.columns
    }

    // 回复默认
    reset = () => {
        /*axios.post('Api/v1/setting/columnsReset/{tablename}', {})
        .then(res => {
            if(res.status === 'T'){
                message.info('保存成功')
            }
        })*/
    }

    close = () => {
        const onCancel = this.props.onCancel
        onCancel()
    }
    onChange = (e) => {
        const { value, checked } = e.target;
        const { columns } = this.state

        columns[value].show = checked ? 'T' : 'F'

    }
    move(type, index){
        const columns = [...this.state.columns]

        if(type === 'up'){
            [columns[index - 1], columns[index]] = [columns[index], columns[index - 1]]
        }
        else if(type === 'down'){
            [columns[index], columns[index + 1]] = [columns[index + 1], columns[index]]
        }

        this.setState({
            columns
        })
    }
    onSure = () => {
        const { onOk } = this.props;
        onOk(JSON.stringify(this.state.columns))
    }
    render(){
        const { visible } = this.props
        let { columns } = this.state;
        
        if(/*!visible || */!columns || columns.length === 0){
            return null
        }

        return (
            ReactDOM.createPortal(
                <div className="table-field-set" style={{width: visible ? '330px' : 0}}>
                    <div>
                        <Row gutter={28}>
                            <Col span={10} className="text-right">字段</Col>
                            <Col span={14}>
                                <span>显示</span>
                                <span style={{marginLeft: '26px'}}>锁定</span>
                                <span className="table-set-arrow">移动</span>
                            </Col>
                        </Row>
                    </div>
                    <div className="table-field-wrap">
                        <ScrollBar>
                            <ul>
                                {columns.map((item, index) => 
                                    index > 0 
                                    ? 
                                    (
                                        <li key={item.dataIndex}>
                                            <Row gutter={28}>
                                                <Col span={10} className="text-right">
                                                    {index === 1 ? <span style={{verticalAlign: 'middle'}}>{item.title}</span> : <span>{item.title}</span>}    
                                                </Col>
                                                
                                                <Col span={14}>
                                                    <Checkbox disabled={item.switchShow === 'F'} value={index} defaultChecked={item.show ==='T'} onChange={this.onChange} />
                                                    <Icon className={`table-set-lock ${item.switchShow === 'F' ? '' : 'hidden'}`} type="lock" />
                                                    <span className={`table-arrow-wrap ${item.switchShow === 'F' ? 'hidden' : ''}`}>
                                                        <Icon onClick={this.move.bind(this, 'up', index)} type="arrow-up" className="table-set-arrow" />
                                                        <Icon onClick={this.move.bind(this, 'down', index)} type="arrow-down" />
                                                    </span>
                                                </Col>
                                            </Row>
                                        </li>
                                    )
                                    : null
                                )}
                            </ul>
                        </ScrollBar>
                    </div>
                    
                    <div className="table-field-footer">
                        <Row>
                            <Col span={10}><a className="list-link" onClick={this.reset} style={{lineHeight: '32px'}}>恢复默认</a></Col>
                            <Col span={14} className="text-right">
                                <Button onClick={this.close}>取消</Button>
                                <Button type="primary" style={{marginLeft: '10px'}} onClick={this.onSure}>确定</Button>
                            </Col>
                        </Row>
                    </div>
                </div>,
                renderEl
            )
        )
    }
}