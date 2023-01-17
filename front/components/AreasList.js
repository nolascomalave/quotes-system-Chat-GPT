import { useState } from 'react';

// Components:
import AreasListItem from './AreasListItem';

// Material Components:
import Button from '@mui/material/Button';

// Material Icons:
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';

// Areas Lis Reducer:
import { initialListState } from '../reducers/areasListReducer';

export default function AreaList({ title, state, dispatch, setAreas, addArea, updateArea, removeArea, servicesFn, addFn, editFn, columns, selectFn }) {

	return (
		<div className = 'areas-list'>
			<div className = 'areas-list__header'>
				<p className = 'areas-list__header__title'>{title ?? 'Areas'}:</p>
				<div className = "areas-list__header__actions">
					<Button className = 'areas-list__header__actions__btn add' onClick = {addFn}>
						<AddIcon/>
						<p>Add</p>
					</Button>
				</div>
			</div>
			<ul className = 'areas-list__body'>
				{state.areas.length < 1 ? (
					<div className='areas-list__body__message'>
						No Areas to display!
					</div>
				) : state.areas.map((area, index) => (
						<AreasListItem
							key = {index}
							indexArea = {index}
							area = {area}
							listColumns = {columns}
							editFn = {editFn}
							removeArea = {removeArea}
							updateArea = {updateArea}
						/>
					)
				)}
			</ul>
		</div>
	);
}