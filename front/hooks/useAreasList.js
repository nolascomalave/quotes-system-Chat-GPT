import { useEffect, useState } from 'react';

// Areas Lis Reducer:
import areasListReducer, { TYPES, initialListState, initialState } from '../reducers/areasListReducer';

export default function useAreasList(data, columns) {
	// const [ state, dispatch ] = useReducer(areasListReducer, {...initialState, areas: (data ?? initialState),  serviceColumns: (list_columns ?? initialcolumns)});
	const [ state, dispatchEvent ] = useState({...initialState, areas: (data ?? initialState.areas)});

	const dispatch = (action) => {
		dispatchEvent(areasListReducer(state, action));
	}

	// ------------------------------------------------------------------------------------------------------------------------
	// Funciones de la lista de los servicios: --------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------

	const setAreas = (data) => {
		dispatch({type: TYPES.UPDATE_DATA, payload: data});
	};

	const addMultipleAreas = (data) => {
		dispatch({type: TYPES.UPDATE_DATA, payload: [...state.areas, ...data]});
	};

	const addArea = (data) => {
		dispatch({type: TYPES.ADD_AREA, payload: data});
	};

	const updateArea = (index, data) => {
		dispatch({type: TYPES.UPDATE_AREA, payload: {index: index, row: data}});
	};

	const removeArea = (index) => {
		dispatch({type: TYPES.REMOVE_AREA, payload: index});
	};


	// ------------------------------------------------------------------------------------------------------------------------
	// Funciones de la lista de los servicios: --------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------

	const servicesFn = {
		setServicesData: (indexArea, data) => {
			if(!Array.isArray(data) || !state.areas[indexArea]) return;
			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, data: data, selection: {}, edditing: {}, selectionLength: 0}
					}
				}
			});
		},

		// Función propia:
		existServiceIndexItem: (indexArea, i) => {
			if(!state.areas[indexArea]) return false;
			if(!state.areas[indexArea].__services) return false;
			return (typeof state.areas[indexArea].__services[i] === null || typeof state.areas[indexArea].__services[i] === 'undefined') === false;
		},

		// Función propia:
		getServiceRowByIndex: (indexArea, i) => {
			if(!state.areas[indexArea]) return;
			if(!state.areas[indexArea].__services) return false;
			return state.areas[indexArea].__services[i];
		},

		// Función propia:
		addNewServiceRow: (indexArea, selectable) => {
			if(!state.areas[indexArea]) return;
			let data = {...columns, __3d1t4bl3: {}, __butt0n: {}};

			Object.keys(columns).forEach(el => {
				data[el] = null;

				if(!selectable.some(sel => el === sel)) return data.__3d1t4bl3[el] = true;

				data.__butt0n[el] = true;
			});

			let __services = state.areas[indexArea].__services ?? {...initialListState, columns: columns};

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...__services, data: [...__services.data, data]}
					}
				}
			});
		},

		addServiceRow: (indexArea, rowdata) => {
			if(!state.areas[indexArea]) return;
			let __services = state.areas[indexArea].__services ?? {...initialListState, columns: columns};
			let data = __services.data;

			data.push(rowdata);

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...__services, data: data}
					}
				}
			});
		},

		updateServiceRowByIndex: (indexArea, i, rowdata) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;

			let data = state.areas[indexArea].__services.data;

			if(typeof data[i] === null || typeof data[i] === 'undefined') return;

			data[i] = rowdata;

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, data: data}
					}
				}
			});
		},

		removeSelectedServiceRows: (indexArea) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;
			let data = state.areas[indexArea].__services.data;

			let count = 0;

			Object.keys(state.areas[indexArea].__services.selection).sort().forEach(index =>{
				data.splice(Number(index) - count, 1);
				count++;
			});

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, data: data, selection: {}, selectionLength: 0}
					}
				}
			});
		},

		removeServiceRowByIndex: (indexArea, i) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;
			if(typeof state.areas[indexArea].__services.data[i] === null || typeof state.areas[indexArea].__services.data[i] === 'undefined') return;

			let data = state.areas[indexArea].__services.data;
			data.splice(i, 1);

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, data: data}
					}
				}
			});
		},

		getSelectedServiceRows: (indexArea) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return [];
			let length = state.areas[indexArea].__services.selectionLength;
			if(length === state.areas[indexArea].__services.data.lenght) return state.areas[indexArea].__services.data;

			if(length === 0) return [];

			return Object.keys(state.areas[indexArea].__services.selection).map(el => state.areas[indexArea].__services.data[el]);
		},

		changeServiceCellValue: (indexArea, index, column, value) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;
			let data = state.areas[indexArea].__services.data;
			data[index][column] = value;

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, data: data}
					}
				}
			});
		},

		changeEdditingService: (indexArea, index, column, val) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;
			let edditing = state.areas[indexArea].__services.edditing;
			let indexEddit = `${index}-${column}`;

			if(!val && (indexEddit in edditing)) delete edditing[indexEddit];
			else if(!!val && !(indexEddit in edditing)) edditing[indexEddit] = true;

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, edditing: edditing}
					}
				}
			});
		},

		changeServiceRowSelection: (indexArea, i, select) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;
			let selection = state.areas[indexArea].__services.selection, length = state.areas[indexArea].__services.selectionLength;

			if(!select && (i in selection)){
				delete selection[i];
				length--;
			}else if(!!select && !(i in selection)){
				selection[i] = true;
				length++;
			}else{
				return;
			}

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, selection: selection, selectionLength: length}
					}
				}
			});
		},

		changeAllServiceSelection: (indexArea, select) => {
			if(!state.areas[indexArea] || !state.areas[indexArea].__services) return;
			if(!select){
				dispatch({
					type: TYPES.UPDATE_AREA,
					payload: {
						index: indexArea,
						row: {
							...state.areas[indexArea],
							__services: {...state.areas[indexArea].__services, selection: {}, selectionLength: 0}
						}
					}
				});
				return;
			}

			let selection = state.areas[indexArea].__services.selection;

			state.areas[indexArea].__services.data.forEach((el, i) => {
				if(i in selection) return;

				if(!select) return delete selection[i];

				selection[i] = true;
			});

			dispatch({
				type: TYPES.UPDATE_AREA,
				payload: {
					index: indexArea,
					row: {
						...state.areas[indexArea],
						__services: {...state.areas[indexArea].__services, selection: selection, selectionLength: state.areas[indexArea].__services.data.length}
					}
				}
			});
		}
	};

	return {
		state: state,
		dispatch,
		setAreas,
		addArea,
		updateArea,
		removeArea,
		servicesFn,
		addMultipleAreas,
		areasParams: {
			state: state,
			dispatch,
			setAreas,
			addArea,
			updateArea,
			removeArea,
			servicesFn,
			columns: columns
		}
	}
}