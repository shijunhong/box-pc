import React from 'react';

import { Pagination } from 'antd'

const pageSizeOption = ['10', '20', '30', '50', '80', '100']

export default (props) => (
    <Pagination pageSizeOptions={pageSizeOption} {...props} />
)