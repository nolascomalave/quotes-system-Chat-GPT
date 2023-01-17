import { useEffect } from 'react';

// Components:
import List from './List';

// Material Components:
import Button from '@mui/material/Button';

// Material Icons:
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';

// Hooks:
import useList from '../hooks/useList';

export default function AreasListItem({area, indexArea, updateArea, listColumns, removeArea, editFn, selectFn}) {
	const { listParams, addNewRow, removeSelectedRows, setState } = useList([], listColumns);

	useEffect(() => {
		let servicesState = {
			data: listParams.data,
			columns: listParams.columns,
			selection: listParams.selection,
			selectionLength: listParams.selectionLength,
			edditing: listParams.edditing
		};

		// console.log(area.__services !== servicesState, area.__services, servicesState);
		if(area.__services !== servicesState) updateArea(indexArea, {...area, __services: servicesState});
	}, [listParams.data, listParams.selectionLength, listParams.edditing]);

	/* useEffect(() => {
		// if(area.__services !== listParams) setState(area.__services);
	}, [area.__services]); */

	return (
		<li className = 'areas-list__body__item'>
			<fieldset className = 'areas-list__body__item__container'>
				<legend className = 'areas-list__body__item__container__title'>
					<b className = 'areas-list__body__item__container__title__name'>{area.name}</b>
					-
					<span className = 'areas-list__body__item__container__title__type'>{(!!area.id_parent || !!area.parent) ? 'Secondary' : 'Primary'}</span>
				</legend>

				<div className = 'areas-list__body__item__container__principal'>
					<div className = 'areas-list__body__item__container__principal__actions'>
						{!area.id && (
							<Button onClick = {() => editFn(indexArea, area)}>
								<EditIcon/>
							</Button>
						)}
						<Button onClick={() => removeArea(indexArea)}>
							<DeleteIcon/>
						</Button>
					</div>
					{(!!area.id_parent || !!area.parent) && (
						<>
							<b className = 'areas-list__body__item__container__principal__parents'>
								{(!!area.id_parent ? area.parent_concat : ((!!area.parent.id_parent ? (area.parent.parent_concat + '<->') : '') + area.parent.name)).replace(/<->/g, ' > ')}
							</b><br/>
						</>
					)}
					{area.description}
				</div>

				<div className = 'areas-list__body__item__container__services'>
					<div className = "areas-list__body__item__container__services__header">
			            <p className = 'areas-list__body__item__container__services__header__title'>Services:</p>
						<div className='areas-list__body__item__container__services__header__buttons'>
							{!!area.id && (
								<Button className = 'areas-list__body__item__container__services__header__buttons__btn add' onClick = {() => selectFn(indexArea, area.id)}>
									<AddHomeWorkIcon/>
									<p>Select</p>
								</Button>
							)}
							<Button className = 'areas-list__body__item__container__services__header__buttons__btn add' onClick = {() => addNewRow('unit_masurement', 'audio')}>
								<AddIcon/>
								<p>Add</p>
							</Button>
							<Button className = 'areas-list__body__item__container__services__header__buttons__btn delete' disabled = {listParams.selectionLength === 0} onClick = {() => removeSelectedRows(indexArea)}>
								<ClearIcon/>
								<p>Remove</p>
							</Button>
						</div>
					</div>

					<List
						{...listParams}
						selectable = {true}
						extraParams = {{area, indexArea}}

						style = {{
							maxHeight: '50vh'
						}}
					/>
				</div>
			</fieldset>
		</li>
	);
}