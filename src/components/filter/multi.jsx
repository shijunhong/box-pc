import React, { Component } from 'react'
import axios from 'UTILS/http'
import { Button, Modal, Row, Col, InputNumber } from 'antd'
import PropTypes from 'prop-types'



/**
 * 多规格控件
 */
export default class Multi extends Component{
    state = {
        visible: false,
        count: 0,
        multiData: {},
        matches: {},
        onlyOneOptions: []
    }
    choosedObj = {}
    static propTypes = {
        onChange: PropTypes.func.isRequired
    }

    getOptions = () => {
        const { record, cacheOption } = this.props

        this.initChoosed()

        if(cacheOption[record.goods_id]){
            this.state.multiData = cacheOption[record.goods_id]
            this.initData()
            this.toggleModal()
            return;
        }
        axios.get(`Api/v1/goods/${record.goods_id}/dialogOptions`)
        .then(res => {
            if(res.status === 'T'){
                this.state.multiData = cacheOption[record.goods_id] = res.data;
                this.initData()
            }
        })
    }
    
    initChoosed(){
        const { choosed, record } = this.props
        const _choosed = choosed.filter(item => item.goods_id === record.goods_id)

        _choosed.forEach(item => {
            this.choosedObj[item.options_id] = item
        })

    }
    initData(){
        const { one, two, list } = this.state.multiData;
        const { record } = this.props;
        const onlyOneOptions = [], matches = {};
        
        if(one && two){
            two.options.forEach(twoItem => {
                if(!matches[twoItem.id]){
                    matches[twoItem.id] = []
                }
                one.options.forEach(oneItem => {
                    let value = '', temp = this.choosedObj[oneItem.id + ',' + twoItem.id];
                    if(temp){
                        value = temp.num;
                    }
                    matches[twoItem.id].push({
                        options_id: oneItem.id + ',' + twoItem.id,
                        isMatch: !!list[oneItem.id + ',' + twoItem.id],
                        value
                    })
                })
            })
        }
        else{
            Object.keys(list).forEach(key => {
                let value = '', temp = this.choosedObj[key];
                if(temp){
                    value = temp.num;
                }

                onlyOneOptions.push(list[key]);
                onlyOneOptions.push(Object.assign({},list[key], { isInput: true, value }))
            })
        }
        this.setState({
            onlyOneOptions,
            matches,
            visible: true
        })
    }
    onItemChange = (id, matchIndex, value) => {
        const { two, list } = this.state.multiData;
        const { onlyOneOptions, matches } = this.state
        if(!two){
            onlyOneOptions[id].value = matchIndex;
        }
        else{
            matches[id][matchIndex].value = value;
        }
        
        this.setState({
            onlyOneOptions,
            matches
        })
    }
    // 应用所有输入框
    onAllChange = (value) => {
        this.allValue = value
    }
    // 设置所有
    setAllValue = () => {
        this.setValue(this.allValue)
    }
    // 重置
    resetValue = () => {
        this.setValue('')
    }
    setValue(value){
        const { two, list } = this.state.multiData;
        const { onlyOneOptions, matches } = this.state

        if(!two){
            onlyOneOptions.forEach(item => {
                item.value = value
            });
        }
        else{
            two.options.forEach(twoItem => {
                matches[twoItem.id].forEach(match => {
                    match.value = value
                })
            })
        }
        this.setState({
            onlyOneOptions,
            matches
        })
    }

    choose = () => {
        const { one, two, list } = this.state.multiData;
        const { onlyOneOptions, matches } = this.state
        const { record, onChange } = this.props
        let count = 0;
        let chooseArr = [];
        if(one && two){
            two.options.forEach(twoItem => {
                matches[twoItem.id].forEach(match => {
                    if(match.isMatch){
                        if(match.value && match.value > 0){
                            count += match.value
                        }
                        
                        chooseArr.push({
                            goods_id: record.goods_id,
                            options_id: match.options_id,
                            options_name: list[match.options_id].options_name,
                            price: list[match.options_id].purchase_price,
                            num: match.value
                        })
                    }
                })
            })
        }
        else{
            onlyOneOptions.forEach(item => {
                if(item.isInput){
                    if(item.value && item.value > 0){
                        count += item.value
                    }
                    
                    chooseArr.push({
                        goods_id: item.goods_id,
                        options_id: item.options_id,
                        options_name: item.options_name,
                        price: item.purchase_price,
                        num: item.value
                    })
                }
            })
        }

        onChange(chooseArr, record)
        this.setState({ count, visible: false })
    }

    toggleModal = (e) => {
        this.setState({
            visible: !this.state.visible
        })
    }
    render(){
        const { visible, multiData, onlyOneOptions, matches } = this.state
        const { record, choosed } = this.props
        let modalWidth = 520;

        let count = this.state.count
 
        if(count === 0 && choosed.length > 0){
            // choosed.filter(item => item.goods_id === record.goods_id).forEach(item => {count += item.num})

            count = choosed.reduce((total, item) => {
                if(item.goods_id === record.goods_id){
                    return total + item.num
                }
                return total
            }, 0)
        }

        if(multiData.one && multiData.one.options.length > 3){
            modalWidth = (multiData.one.options.length + 1) * 123 + 48;
            if(modalWidth > 1000){
                modalWidth = 1000;
            }
        }else if(!multiData.one && multiData.list && multiData.list.length > 3){
            modalWidth = 122 * 6 + 48;
        }

        const footer = (
            <Row gutter={12}>
                <Col className="text-left" span={18}>
                    <span>选择全部规格数量</span>
                    <InputNumber onChange={this.onAllChange} min={0} style={{width: '100px', margin: '0 8px'}} />
                    <Button onClick={this.setAllValue} style={{width: '40px'}} type="primary" icon="check" />
                    <Button onClick={this.resetValue} style={{width: '40px'}} icon="close" />
                </Col>
                <Col span={6}><Button type="primary" onClick={this.choose}>选好了</Button></Col>
            </Row>
        )
        
        return (
            <div>
                <Modal
                    title={this.props.record.goods_name}
                    width={modalWidth}
                    visible={visible}
                    zIndex={1062}
                    bodyStyle={{maxHeight: '500px', padding: '14px 1px', margin: '1px 14px', overflow: 'auto'}}
                    destroyOnClose={true}
                    footer={footer}
		            onCancel={this.toggleModal}
                >
                    {
                        multiData.one ?
                        <div>
                            <div style={{whiteSpace: 'nowrap'}}>
                                <span className="options-item">{multiData.two.name + '/' + multiData.one.name}</span>
                                {multiData.one.options.map(item => (
                                    <span className="options-item" key={item.id}>{item.name}</span>
                                ))}
                            </div>
                            {multiData.two.options.map((item, index) => (
                                <div className="wrap-options-item" key={item.id}>
                                    <span className="options-item">{item.name}</span>
                                    {
                                        matches[item.id].map((match, matchIndex) => (
                                            <span className="options-item options-item-input" key={matchIndex + ''}>
                                                {match.isMatch ? <InputNumber onChange={this.onItemChange.bind(this, item.id, matchIndex)} min={0} value={match.value} /> : null}
                                            </span>
                                        ))
                                    }
                                </div>
                            ))}
                        </div>
                        :
                        <div>
                            {
                                onlyOneOptions.map((item, index) => (
                                    <span className={`options-item ${item.isInput ? 'options-item-input' : ''}`} key={index + ''}>
                                        {item.isInput ? <InputNumber onChange={this.onItemChange.bind(this, index)} min={0} value={item.value} /> : item.options_name}
                                    </span>
                                ))
                            }
                        </div>
                    }
                </Modal>
                <Button style={{width: '103px'}} onClick={this.getOptions}>{count > 0 ? count : '选择规格'}</Button>
            </div>
        )
    }
}