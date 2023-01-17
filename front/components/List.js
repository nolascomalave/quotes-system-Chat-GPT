// Components:
import SimpleCheckbox from './SimpleCheckbox';

// Material Components:
import Button from '@mui/material/Button';

// Utils:
import { reformatNum, enUSNumberFormat } from '../util/format';

export default function List({data, columns, selectable, selection, selectionLength, edditing, changeEdditing, changeAllSelection, changeRowSelection, changeCellValue, style, extraParams}) {
	// const [footer, setFooter] = useState({});
	let tempFoot = {};
	let formats = {};

	Object.keys(columns).forEach(col => {
		let format = (value) => value;

		if(typeof columns[col].format === 'function') return formats = {...formats, [col]: columns[col].format};
		if(typeof columns[col].format !== 'string') return formats = {...formats, [col]: format};

		if(columns[col].type === 'number' && (/^f(\d+)?$/).test(columns[col].format)){
			let floats = Number(columns[col].format.replace(/[^\d]/g, ''));
			format = (value) => enUSNumberFormat(value, floats);
		}

		return formats = {...formats, [col]: format};
	});

	return (
		<div className = "table-list" style = {style}>
			<table>
				<thead className = {`table-list__header`}>
					{selectable && (
						<th
							className = {`table-list__header__column table-list__check-list`}
						>
							<SimpleCheckbox
								checked = {(selectionLength === data.length) && data.length > 0}
                                onChange={e => changeAllSelection(e.target.checked)}
                                disabled = {data.length < 1}
                            />
						</th>
					)}
					{/*<th
						key = {`${i}_${col}`}
						className = {`table-list__header__column table-list__check-list`}
					>

					</th>*/}

					{Object.keys(columns).map((col, i) => {
						if(columns[col].hidden) return null;
						return (
							<th
								key = {`${i}_${col}`}
								className = {`table-list__header__column table-list_${col}`}
								style = {{
									textAlign: columns[col].titlealign ?? 'center'
								}}
							>
									{columns[col].title}
							</th>
						);
					})}
				</thead>
				<tbody className = "table-list__body">
					{(!data || (!!data && data.length < 1)) ? null : (
						data.map((row, indexRow) => {
							return (
								<tr key = {indexRow} className = {`table-list__body__row${(selection[indexRow] === true || Object.keys(edditing).some(el => el.startsWith(`${indexRow}-`))) && ' selected'}`}>
									{selectable && (
										<th
											key = {`${indexRow}_check`}
											className = {`table-list__body__row_column table-list__check-list`}
										>
											<SimpleCheckbox
				                                checked={selection[indexRow] === true}
				                                onChange = {e => changeRowSelection(indexRow, e.target.checked)}
				                            />
										</th>
									)}
									{Object.keys(columns).map((col, i) => {
										if(columns[col].hidden) return null;

										columns[col].events = columns[col].events ?? {};

										if(!!columns[col].aggregates){
											columns[col].aggregates = typeof columns[col].aggregates === 'string' ? columns[col].aggregates.toLowerCase() : null;

											if(columns[col].aggregates === 'count'){
												let colCount = !tempFoot[col] ? 1 : tempFoot[col].value + 1,
													colVal = colCount;
													tempFoot = {...tempFoot, [col]: {type: columns[col].aggregates, value: colVal, count: colCount}};
											}else if((columns[col].aggregates === 'sum' || columns[col].aggregates === 'avg') && columns[col].type === 'number'){
												let colCount = !tempFoot[col] ? 1 : tempFoot[col].value + 1,
													val = !columns[col].cellsrender ? reformatNum(row[col]) : columns[col].cellsrender(row, indexRow),
													colVal = !tempFoot[col] ? val : tempFoot[col].value + val;
													tempFoot = {...tempFoot, [col]: {type: columns[col].aggregates, value: colVal, count: colCount}};
											}
										}

										
										if(columns[col].editable || (!columns[col].cellsrender && (!!row.__3d1t4bl3 && row.__3d1t4bl3[col]))) return (
											<td
												key = {`${indexRow}_${col}`}
												className = {`table-list__body__row_column table-list_${col}`}
											>
												<input
													type = 'text'
													value = {(`${indexRow}-${col}` in edditing) ? row[col] : formats[col](row[col])}
													className = {`${columns[col].cellalign ?? 'left'} editable`}
													onChange = {(e) => changeCellValue(indexRow, col, e.target.value)}
													onFocus={((e) => changeEdditing(indexRow, col, true))}
													onBlur={((e) => changeEdditing(indexRow, col, false))}
												/>
											</td>
										);

										return (
											<td
												key = {`${indexRow}_${col}`}
												className = {`table-list__body__row_column table-list_${col}${(columns[col].type === 'button' || (!!row.__butt0n && row.__butt0n[col])) ? ' button' : ''}`}
											>
												{(columns[col].type !== 'button') ? (
													<div
														className={`cell-div truncado`}
														style = {{...(columns[col].style ?? {}), textAlign: columns[col].cellalign ?? 'left' }}
													>
														{formats[col](columns[col].cellsrender ? columns[col].cellsrender(row, indexRow) : row[col])}
													</div>
												) : (
													<Button
														className={`cell-div truncado`}
														style = {{...(columns[col].style ?? {}), textAlign: columns[col].cellalign ?? 'left' }}
														onClick = {(e) => (columns[col].events.onClick ?? (()=> null))(e, row, col, {row: indexRow, column: i}, extraParams)}
													>
														{formats[col](columns[col].cellsrender ? columns[col].cellsrender(row, indexRow) : row[col])}
													</Button>
												)}
											</td>
										);

										/*return (<td
												key = {`${indexRow}_${col}`}
												className = {`table-list__body__row_column table-list_${col}`}
											>
												{(columns[col].editable || (!columns[col].cellsrender && (!!row.__3d1t4bl3 && row.__3d1t4bl3[col]))) ? (
													<input
														type = 'text'
														value = {(`${indexRow}-${col}` in edditing) ? row[col] : formats[col](row[col])}
														className = {`${columns[col].cellalign ?? 'left'} editable`}
														onChange = {(e) => changeCellValue(indexRow, col, e.target.value)}
														onFocus={((e) => changeEdditing(indexRow, col, true))}
														onBlur={((e) => changeEdditing(indexRow, col, false))}
													/>
												) : (
													<div
														className={`${(columns[col].pointable === true || (!!row.__butt0n && row.__butt0n[col])) ? 'pointable ' : ''}cell-div truncado`}
														style = {{...(columns[col].style ?? {}), textAlign: columns[col].cellalign ?? 'left' }}
														onClick = {(e) => (columns[col].events.onClick ?? (()=> null))(e, row, col, {row: indexRow, column: i})}
													>
														{formats[col](columns[col].cellsrender ? columns[col].cellsrender(row, indexRow) : row[col])}
													</div>
												)}
											</td>
										);*/
									})}
								</tr>
							);
						})
					)}
				</tbody>

				{Object.keys(tempFoot).length > 0 ? (
					<tfoot>
						<tr>
							{selectable && (<th className = {`table-list__footer__column table-list_check-list`}></th>)}

							{Object.keys(columns).map((col, i) => {
								if(!!columns[col].hidden) return null;

								if(!tempFoot[col]) return (<th className = {`table-list__footer__column table-list_${col}`}></th>);

								let value = tempFoot[col].type === 'avg' ? (tempFoot[col].value / data.length) : tempFoot[col].value;
								value = formats[col](value);

								return (
									<th
										key = {`foot-${i}`}
										className = {`table-list__footer__column table-list_${col}`}
										style = {{
											textAlign: columns[col].cellalign ?? 'center'
										}}
									>
										{(tempFoot[col].type === 'count' || tempFoot[col].type === 'sum') ? 'Total:' : ''} {value}{tempFoot[col].type === 'avg' && '%'}
									</th>
								);
							})}
						</tr>
					</tfoot>
				) : null}
			</table>

			{(!data || (!!data && data.length < 1)) && (
				<div className = 'table-list__body__message'>
					No data to display!
				</div>
			)}
		</div>
	);
}