import React, { Component } from 'react'
import Proptypes from 'prop-types'

import { Input, Icon, Row, Col } from 'antd'

const Textarea = Input.TextArea

class EditCell extends Component {
  state = { 
    editing: true,
    context: '',
  }
  toggleEdit = () => {
    this.setState({
      editing: !this.state.editing
    })
  }
  editHandler = (event) => {
    this.setState({
      context: event.target.value
    })
  }
  save = () => {
    this.toggleEdit()
    this.props.onSave(this.state.context, this.props.index)
  }
  componentDidMount(){
    this.setState({
      context: this.props.context
    })
  }
  static getDerivedStateFromProps(nextProps,prevState){
    if( nextProps.context !== prevState.context ){
      return {
        context: nextProps.context
      }
    }
    return null
  }
  render() {
    const { editing, context } = this.state
    console.log('render')
    return (
      <React.Fragment>
        {
          editing 
            ? (
              <Row gutter={16}>
                <Col span={20}>
                  <div>{context}</div>
                </Col>
                <Col span={4}>
                  <Icon className='pointer' type='edit' onClick={this.toggleEdit} />
                </Col>
              </Row>
            )
            : (
              <Row gutter={16}>
                <Col span={20}>
                  <Textarea autosize={{minRows:1}} defaultValue={context} onChange={this.editHandler}></Textarea>
                </Col>
                <Col span={4}>
                  <Icon className='pointer' type='save' onClick={this.save} />
                </Col>
              </Row>
            )
        }
      </React.Fragment>
    )
  }
}

export default EditCell