
import React, { Component } from 'react';
import PropTypes from 'prop-types'


/**
 * 自定义滚动条
 * @Author zyt
 * @Date   2018-01-26
 * @return {[type]}   [description]
 */
export default class ScrollBar extends Component {

	mouseScroll = (e) => {

		e.stopPropagation();

		const { currentTarget: target, deltaY} = e;

		const { scrollTop, offsetHeight, scrollHeight} = target;
		
		if(scrollHeight - offsetHeight < 4){
			return;
		}

		const step = scrollHeight - offsetHeight > 30 ? 30 : scrollHeight - offsetHeight;

		if(deltaY > 0){
			if(scrollTop + offsetHeight === scrollHeight){
				return;
			}
			target.scrollTop = scrollTop + step;
		}
		else{
			if(scrollTop === 0){
				return;
			}
			target.scrollTop = scrollTop - step;
		}
		// this.setTop(target.scrollTop, scrollHeight)
	}
	render() {
		return (
			<div className="scroll-wrap" onWheel={this.mouseScroll}>
				{this.props.children}
			</div>
		);
	}
	/*state = {
		height: 0,
		top:0
	}

	setTop(scrollTop, scrollHeight){
		const height = this.state.height;


		this.setState({
			top: scrollTop + Number.parseInt(height) * scrollTop / scrollHeight + 'px'
		})
	}

	initkScrollBar = (e) => {
		const { offsetHeight, scrollHeight} = this.scrollWrap;

	    if(scrollHeight - offsetHeight > 4){
			this.setState({
				height: Math.pow(offsetHeight, 2) / scrollHeight + 'px'
			})
		}
	}
	hideScrollBar = (e) => {

	}

	render() {
		return (
			<div className="scroll-wrap" ref={node => this.scrollWrap = node} onWheel={this.mouseScroll} onMouseEnter={this.initkScrollBar} onMouseLeave={this.hideScrollBar}>
				{this.props.children}
				<div className="dhb-scroll-bar" style={this.state}></div>
			</div>
		);
	}*/
}

