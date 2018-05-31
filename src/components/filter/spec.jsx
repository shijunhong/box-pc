import React, { Component } from 'react'
import { InputNumber, Popover } from 'antd'


/**
 * 单规格控件
 */
export default class extends Component{
    
    // 初始化数据
    constructor(props){
        super(props)
        const { choosed, record } = props

        /*if(tempChoosed[record.goods_id]){
            choosed = [...choosed, ...tempChoosed[record.goods_id].list]
            choosed = [...new Set(choosed)]
        }*/

        const currItem = choosed.find( item => item.goods_id === record.goods_id)

        if(currItem && currItem.num > 0){
            if(!record.container_units){
                this.state = {
                    total: currItem.num
                }
            }else{
                const container = Math.floor(currItem.num / record.conversion_number)
                const base = currItem.num % record.conversion_number

                this.state = {
                    total: currItem.num,
                    container,
                    base
                }
            }
        }else{
            this.state = {
                total: '', // 换算后的数量
                base: '', // 小单位数量
                container: '' // 大单位 数量
            }
        }
    }

    totalChange = (value) => {
        const { record } = this.props
        let { total, base, container } = this.state

        total = value

        if(!record.container_units){
            this.setState({
                total
            })
        }else{
            value = value || 0
            container = Math.floor(value / record.conversion_number)
            base = value % record.conversion_number

            this.setState({
                total,
                container,
                base
            })
        }
        this.emitChange(total)
    }
    containerChange = (value) => {
        const { record } = this.props
        let { total, base, container } = this.state

        value = value || 0;
        base = base || 0;

        this.setState({
            container: value,
            base,
            total: value * record.conversion_number + base
        })
        this.emitChange(value * record.conversion_number + base)
    }
    baseChange = (value) => {
        const { record } = this.props
        let { total, base, container } = this.state

        value = value || 0;
        container = (container || 0) + Math.floor(value / record.conversion_number);

        base = value % record.conversion_number

        this.setState({
            container,
            base,
            total: container * record.conversion_number + base
        })
        this.emitChange(container * record.conversion_number + base)
    }
    emitChange(value){
        const { onChange, record } = this.props

        onChange([{
            goods_id: record.goods_id,
            options_id: record.goods_id,
            price: record.purchase_price,
            isSpec: true,
            num: value || 0
        }], record)
    }

    render(){
        const { record } = this.props
        const { total, base, container } = this.state

        const content = (
            <div>
                <InputNumber onChange={this.containerChange} min={0} value={container} style={{width: '60px', marginRight: '6px'}} />{record.container_units} + 
                <InputNumber onChange={this.baseChange} min={0} value={base} style={{width: '60px', margin: '0 6px'}} />{record.base_units} = 
                <InputNumber onChange={this.totalChange} min={0} value={total} style={{width: '60px', margin: '0 6px'}} />{record.base_units}
            </div>
        )
        if(!record.container_units){
            return <InputNumber onChange={this.totalChange} min={0} value={total} style={{width: '103px'}} />
        }
        return (
            <Popover placement="topRight" title={`1${record.container_units} = ${record.conversion_number + record.base_units}`} content={content} overlayStyle={{zIndex: 1062}}>
                <InputNumber onChange={this.totalChange} min={0} value={total} style={{width: '103px'}} />
            </Popover>
        )
    }
}