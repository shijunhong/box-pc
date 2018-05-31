import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';


const mapDispatchToProps = (dispatch) => {
    return {
        action: () => {
            dispatch(actionAction());
        },
    };
};

const mapStateToProps = ({ state }) => ({
   ...state
});

class Login extends Component {
    componentDidMount() {
        console.log(this)
    }
    render() {
        

        return (
            <div>login</div>
        );
    }
}

export default connect( mapStateToProps, mapDispatchToProps )(Login);
