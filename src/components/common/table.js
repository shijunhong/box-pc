
import React from 'react';
import { Table } from 'antd';

const _document = document;


/**
 * @Author zyt
 * @Date   2018-01-10
 * [如果需要拖动表头列动态改变表格列宽度 请 import 此组件]
 */
export default class DHBTable extends React.Component {

	componentDidMount() {
		const tableContent = this.tableContent = this.table.getElementsByClassName('ant-table')[0];
		const div = this.resizeProxy = document.createElement('div');
		
		div.className = 'table-resize-proxy';
		tableContent.appendChild(div)
	}
	handleMouseLeave(e) {
		_document.body.style.cursor = ''
	}
	handleMouseMove(event) {
		const { rowSelection, columns } = this.props;
	    if (!this.dragging) {
	        let target = event.target;

			const tagName = target.tagName.toLowerCase();
			const ptagName = target.parentNode.tagName.toLowerCase();

			const bodyStyle = _document.body.style;

			if(tagName !== 'th' && ptagName !== 'th' ){
				bodyStyle.cursor = '';
	        	this.draggingColumn = null;
				return
			}
			if(ptagName === 'th'){
				target = target.parentNode
			}
			if(rowSelection && target.cellIndex < 2){
				return
			}

	        const rect = target.getBoundingClientRect();
	        

	        if (rect.width > 12 && rect.right - event.pageX < 8) {
	            bodyStyle.cursor = 'col-resize';
	            this.draggingColumn = target;
	        } else {
	            bodyStyle.cursor = '';
	        	this.draggingColumn = null;
	        }
	    }
	}

	handleMouseDown(event) {
	    if (this.draggingColumn) {

	        this.dragging = true;

	        const { columns, rowSelection } = this.props;

	        const { tableContent: tableEl, resizeProxy } = this;
	        const tableLeft = tableEl.getBoundingClientRect().left;

	        let columnEl = this.draggingColumn;

	        let column = rowSelection ? columns[columnEl.cellIndex - 1] : columns[columnEl.cellIndex]

	        const columnRect = columnEl.getBoundingClientRect();
	        const minLeft = columnRect.left - tableLeft + 30;

	        const startMouseLeft = event.clientX;
	        const startLeft = columnRect.right - tableLeft;
	        const startColumnLeft = columnRect.left - tableLeft;

	        resizeProxy.style.visibility = 'visible';
	        resizeProxy.style.left = startLeft + 'px';

	        _document.onselectstart = () => false;
	        _document.ondragstart = () => false;
 
	        const handleMouseMove = (event) => {
	            const deltaLeft = event.clientX - startMouseLeft;
	            const proxyLeft = startLeft + deltaLeft;

	            resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px';
	        };

	        const handleMouseUp = (event) => {
	            if (this.dragging) {
	                const finalLeft = parseInt(resizeProxy.style.left, 10);
	                const columnWidth = finalLeft - startColumnLeft;
	                //const oldWidth = column.realWidth;
	                column.width = column.realWidth = columnWidth;

	                this.dragging = false;
	                this.draggingColumn = null;

	                _document.body.style.cursor = '';
	                resizeProxy.style.visibility = 'hidden';
	                _document.removeEventListener('mousemove', handleMouseMove);
	                _document.removeEventListener('mouseup', handleMouseUp);
	                _document.onselectstart = null;
	                _document.ondragstart = null;

	                this.setState({columns})
	            }
	        };

	      _document.addEventListener('mousemove', handleMouseMove);
	      _document.addEventListener('mouseup', handleMouseUp);
	    }
	}

	render(){
		return (
			<div onMouseMove={this.handleMouseMove.bind(this)} 
				 onMouseLeave={this.handleMouseLeave}
                 onMouseDown={this.handleMouseDown.bind(this)} 
                 ref={(table) => {this.table = table}}>
				<Table {...this.props} />
			</div>
		)
	}
}