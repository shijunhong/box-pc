import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'

/**
 * @Author zyt
 * @Date   2018-02-01
 */
export default class Chart extends Component {
	static propTypes = {
		options: PropTypes.object.isRequired,
		callback: PropTypes.func
	}
	
	componentDidMount() {
	  const { options, callback } = this.props;

	  this.chart = new Highcharts.Chart(this.chartEl, options, () => {
	  	if(callback){
	  		callback(this.chart);
	  	}
	  })
	}
	componentWillMount() {
		this.chart && this.chart.destroy();
	}
	render() {
		return (
			<div ref={node => this.chartEl = node}></div>
		);
	}
}
