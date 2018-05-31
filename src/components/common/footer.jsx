import React, { Component } from 'react'
import ReactDOM from 'react-dom'
const renderEl = document.getElementById('dhb-content')

export default class Footer extends Component{
    render(){
        return ReactDOM.createPortal(<div className="fixed-footer">{this.props.children}</div>, renderEl)
    }
}