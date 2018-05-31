import React, { Component } from 'react'

import { connect } from 'react-redux'
import PropTypes from 'prop-types'


/**
 * 控制 数量 金额 订单？的精确度
 * quantitative_accuracy  price_accuracy
 */
class AccuracyCtrl extends Component {
  static defaultProps = {
    type: 'quantity'
  }
  static propTypes = {
    type: PropTypes.string,
  }
  state = { 
    quantity: 0,
    price: 0,
    order: 0,
  }
  componentDidMount(){
    if(!this.props.sysConfig.initialize) return
    const { goods_set } = this.props.sysConfig.initialize
    const {quantitative_accuracy, price_accuracy, order_accuracy} = goods_set
    this.setState({
      quantity: quantitative_accuracy,
      price: price_accuracy,
      order: order_accuracy,
    })
  }
  render() {
    const { type, value } = this.props
    if(!value || !type) return null
    let fixed = this.state[type]
    let newProps = this.props.value
    if(typeof newProps !== 'number' && typeof newProps === 'string') {
      newProps = newProps * 1
    }
    let newValue = newProps.toFixed(fixed)
    return (
      <React.Fragment>
        { newValue }
      </React.Fragment>
    )
  }
}


const mapStateToProps = ( state ) => {
  return {
    // setting: state.app.sysConfig.initialize.goods_set,
    sysConfig: state.app.sysConfig,
  }
}

export default connect(mapStateToProps)(AccuracyCtrl)