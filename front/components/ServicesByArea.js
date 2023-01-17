import React, { useState, useEffect } from 'react';

// Components:
import List from './List';

// Hooks:
import useList from '../hooks/useList';

// Consts:
const serviceColumns = {
  name:             { title: 'Service',    hidden: false, returnData: true, titlealign: 'left', cellalign: 'left',  type: 'string', aggregates: 'count' },
  unit_masurement:  { title: 'Unit Mas.',  hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'string', pointable: true,   events: {onClick: () => null} },
  price:            { title: 'Price',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
  quantity:         { title: 'Quantity',   hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true },
  total:            { title: 'Total',      hidden: false, returnData: true, titlealign: 'left', cellalign: 'right', type: 'number', aggregates: 'sum', format: 'f2', editable: true }
};

export default function ServicesByArea({area, setArea}) {
	const { listParams, selectionLength, setData } = useList([], serviceColumns);

	useEffect(()=>{
		setArea({...area, services: []});
		setData([]);
	}, []);

	return (
		<div className = 'services-by-area'>
			<List
				{...listParams}
				selectable = {true}
				style = {{maxHeight: '50vh'}}
			/>
		</div>
	)
}