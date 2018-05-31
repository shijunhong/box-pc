import React, { Component } from 'react';
import { connect } from 'react-redux';


import Header from 'PAGES/common/header';
import Navbar from 'PAGES/common/navbar';
import Help from 'PAGES/common/help';


import { closeTab, getSetting  } from 'REDUX/actions/index';


const mapDispatchToProps = {
    closeTab,
    getSetting
};

const mapStateToProps = ({ app, ...props }) => ({
	globalData: app.globalData,
    sysConfig: app.sysConfig,
    tabs: app.tabs
});

export class Index extends Component {
    componentDidMount(){
        this.props.getSetting()
    }
    componentWillReceiveProps(nextProps){
        const { sysConfig } = nextProps
        if(sysConfig !== this.props.sysConfig){
            if(sysConfig.company && sysConfig.company.is_brand === 'T'){
                document.title = sysConfig.company.system_name   
            }else{
                document.title = '订货宝 让生意更好'
            }
        }
    }
    render() {
        const { globalData, sysConfig, closeTab, showHelp, menus, ...props } = this.props;

        return (
            <div>
            	<Header closeTab={closeTab} sysConfig={sysConfig} {...props} />
            	<Navbar menus={menus} mode={globalData.mode} theme={globalData.theme} {...props} />
                <Help style={{right: showHelp ? 0 : '-194px'}} />
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Index);
