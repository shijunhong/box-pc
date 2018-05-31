import React, { Component } from 'react';

export default (WrappedComponent) => {
    class NewComponent extends Component{

        render(){
            return <WrappedComponent {...this.props} />
        }
    }

    return NewComponent;
}