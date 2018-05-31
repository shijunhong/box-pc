import React from 'react';

import { NavLink } from 'react-router-dom';

import ClickOutside from './click_outside';

import ScrollBar from 'PAGES/common/scroll_bar'

import { Menu, Icon, Input } from 'antd';


const { SubMenu } = Menu;


export default class Navbar extends React.Component {

    constructor(props) {
      super(props);

      const { tabs, menus } = this.props;
      const menuIndex = this.findMenuIndex(tabs, menus);
      const isAffix = window.localStorage._isAffix_ === 'T';

      this.state = {
        showSub: isAffix,
        isAffix: isAffix,
        showSearch: false,
        searchText: '',
        searchMenus: [],
        subs: menuIndex > -1 ? menus[menuIndex].subs : [],
        menuIndex
      };
    }

    findMenuIndex(tabs, menus){
      const tab = tabs.find( item => item.isActive === true );


      if(!tab){
        return -1;
      }

      return menus.findIndex( (item, index) => item.subs.find( subItem => subItem.path === tab.url ) );

    }
    componentWillReceiveProps(nextProps) {
      const { tabs, menus } = nextProps;
      const menuIndex = this.findMenuIndex(tabs, menus);

      if(menuIndex < 0) return

      this.setState({
        subs: menus[menuIndex].subs,
        menuIndex
      })
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.props.tabs !== nextProps.menus || this.props.tabs !== nextProps.tabs || nextState !== this.state;
    }

    resetActive(obj){
      const { tabs, menus } = this.props;
      const index = this.findMenuIndex(tabs, menus);

      if(index > -1 && index !== this.state.menuIndex){
        obj.menuIndex = index;
        obj.subs = menus[index].subs;
      }

      this.setState(obj)
    }

    toggleSubMenu = (e) => {

      const { type } = e;

      if(type === 'mouseenter'){

        // 清除关闭定时器
        this.closeMenuTimer()

        if(this.state.showSub){
          return;
        }
        this.setState({
          showSub: true
        })
      }
      else{
        this.setMenuTimer();
      }

      
    }
    enterSubMenu = (e) => {
      const { type } = e;

      if(type === 'mouseenter'){
        this.closeMenuTimer()
      }
      else{
        this.setMenuTimer();
      }
    }
    // 设置定时器
    setMenuTimer(){
      this.toggleMenuTimer = setTimeout(() => {
        const obj = {}

        if(!this.state.isAffix){
          obj.showSub = false
        }

        this.resetActive(obj);
      }, 200)
    }

    // 关闭定时器
    closeMenuTimer(){
      if(this.toggleMenuTimer){
        clearTimeout(this.toggleMenuTimer)
      }
    }

    switchSubMenu(index, e) {
      const { type } = e;

      if(type === 'mouseenter'){
        this.switchTimer = setTimeout(() => {

          const { menus } = this.props;

          this.setState({
            subs: menus[index].subs,
            menuIndex: index
          })

          this.switchTimer = null;
        }, 200)
      }
      else{
        if(this.switchTimer){
          clearTimeout(this.switchTimer)
        }
      }
      
    }

    handleClickOutside = () => {
      if(this.state.showSearch){
        this.setState({
          showSearch: false
        })
      }
    }

    toggleSeach = () => {
      if(!this.state.showSearch){
        setTimeout(() => {this.searchInput.focus()}, 100)
      }

      this.setState({
        showSearch: !this.state.showSearch
      })

    }
    searchChange = (e) => {
      const value = e.target.value
      this.setState({
        searchText: value
      })

      if(this.searchTimer){
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        this.doSearch(value)
        this.searchTimer = null
      }, 1000)

      
    }
    goAppCenter = () => {
      const { history } = this.props
      history.push('/App/Installer_Index/index')
    }
    doSearch(val){
      const { menus } = this.props;
      let searchMenus = []

      if(val){
        menus.forEach(item => {
          searchMenus.push(...item.subs.filter(sub => !sub.isTitle && sub.name.includes(val)))
        })
      }

      this.setState({searchMenus})

    }

    toggleAffix = () => {
      const { toggleAffix } = this.props; 
      toggleAffix('isAffix');
      this.setState({
        isAffix: !this.state.isAffix
      })
    }

    render() {
      const { menus } = this.props;
      let { subs, isAffix, searchMenus, searchText, menuIndex } = this.state;

      if(isAffix && menus.length > 0 && subs.length === 0){
        menuIndex = 0;
        subs = menus[menuIndex].subs
      }

      return (
        <ClickOutside clickOutside={this.handleClickOutside}>
          <div>
            <div className="dhb-navbar">
              <ScrollBar>
                <ul onMouseEnter={this.toggleSubMenu} onMouseLeave={this.toggleSubMenu}>
                  {menus.map((item, index) => (
                    <li 
                      onMouseEnter={this.switchSubMenu.bind(this, index)} 
                      onMouseLeave={this.switchSubMenu.bind(this, index)} 
                      key={item.rule_id} 
                      className={`menu-item ${index === menuIndex ? 'active' : ''}`}>
                        <span><i className={`menuicon ${item.iconType}`}></i>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </ScrollBar>
              <div className="navbar-footer">
                <ul>
                  <li className="menu-item" onClick={this.goAppCenter}>
                    <span><i className="menuicon icon-app"></i>应用</span>
                  </li>
                  <li className="menu-item" onClick={this.toggleSeach}>
                    <span><i className="menuicon icon-search"></i>搜索</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`menu-search ${this.state.showSearch ? '' : 'hide'}`}>
              <Input 
                size="small"
                prefix={<Icon type="search" />}
                ref={node => {this.searchInput = node}}
                value={searchText}
                onChange={this.searchChange}
                placeholder="输入想访问的栏目" />
            </div>
            
            <div className={`menu-result-wrap ${this.state.showSearch ? '' : 'hide'}`}>
              <div><span style={{fontSize: '12px'}}>搜索结果</span><Icon onClick={this.toggleSeach} className="pull-right" type="close" style={{cursor: 'pointer'}} /></div>
              <div className="menu-search-result">
                <ul>
                  {
                    searchMenus.map(item => (
                      <li key={item.rule_id}><NavLink exact={true} to={item.path}><Icon type="search" />{item.name}<Icon className="pull-right" type="right" /></NavLink></li>
                    ))
                  }
                </ul>
              </div>
            </div>
            
            <div onMouseEnter={this.enterSubMenu} onMouseLeave={this.enterSubMenu} className={`dhb-sub-menu ${this.state.showSub || isAffix ? '' : 'hide-submenu'}`}>
              <div className="dhb-affix" onClick={this.toggleAffix}>
                <div><Icon type={isAffix ? 'swap-left' : 'swap-right'} /></div>
                {isAffix ? '收起' : '固定'}
              </div>
              <ScrollBar>
                <ul>
                  {subs.map((item, index) => ( 
                      item.isTitle 
                      ?
                      <li key={item.path} className="sub-menu-title">{item.name}</li>
                      :
                      <li key={item.path}><NavLink strict className="sub-item" to={item.path}>{item.name}</NavLink></li>
                    )
                  )}  
                </ul>
              </ScrollBar>
            </div>
            
          </div>
        </ClickOutside>
      );
  }
}
