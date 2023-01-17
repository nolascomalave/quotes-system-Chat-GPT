import React, { useState, useEffect } from 'react';

export default function useList(data, columns){
	const [state, setState] = useState({
		data: data,
		columns,
		selection: {},
		selectionLength: 0,
		edditing: {}
	});

	const setData = (data) => {
		if(!Array.isArray(data)) return;
		setState({...state, data: data, selection: {}, edditing: {}, selectionLength: 0});
	}

	// Función propia:
	const existIndexItem = (i) => {
		return (typeof state.data[i] === null || typeof state.data[i] === 'undefined') === false;
	}

	// Función propia:
	const getRowByIndex = (i) => {
		alert(JSON.stringify(state.data));
		alert(i);
		return state.data[i];
	};

	// Función propia:
	const addNewRow = (...selectable) => {
		let data = {...columns, __3d1t4bl3: {}, __butt0n: {}};

		Object.keys(columns).forEach(el => {
			data[el] = null;

			if(!selectable.some(sel => el === sel)) return data.__3d1t4bl3[el] = true;

			data.__butt0n[el] = true;
		});

		return setState({...state, data: [...state.data, data]});
	};

	const addRow = (rowdata) => {
		let data = state.data;
		data.push(rowdata);
		return setState({...state, data: data});
	};

	const updateRowByIndex = (i, rowdata) => {
		let data = state.data;
		if(typeof data[i] === null || typeof data[i] === 'undefined') return;
		data[i] = rowdata;
		return setState({...state, data: data});
	};

	const removeSelectedRows = () => {
		let data = state.data;

		let count = 0;

		Object.keys(state.selection).sort().forEach(index =>{
			data.splice(Number(index) - count, 1);
			count++;
		});

		setState({...state, data: data, selection: {}, selectionLength: 0});
	};

	const removeRowByIndex = (i) => {
		if(typeof state.data[i] === null || typeof state.data[i] === 'undefined') return;
		let data = state.data;
		data.splice(i, 1);
		return setState({...state, data: data});
	};

	const getSelectedRows = () => {
		let length = state.selectionLength;
		if(length === data.lenght) return state.data;

		if(length === 0) return [];

		return Object.keys(state.selection).map(el => state.data[el]);
	};

	const changeCellValue = (index, column, value) => {
		let rowCol = state.data;
		rowCol[index][column] = value;
		setState({...state, data: rowCol});
	};

	const changeEdditing = (index, column, val) => {
		let edditing = state.edditing;
		let indexEddit = `${index}-${column}`;

		if(!val && (indexEddit in edditing)) delete edditing[indexEddit];
		else if(!!val && !(indexEddit in edditing)) edditing[indexEddit] = true;

		setState({...state, edditing: edditing});
	}

	const changeRowSelection = (i, select) => {
		let selection = state.selection, length = state.selectionLength;

		if(!select && (i in selection)){
			delete selection[i];
			length--;
		}else if(!!select && !(i in selection)){
			selection[i] = true;
			length++;
		}else{
			return;
		}

		setState({...state, selection: selection, selectionLength: length});
	}

	const changeAllSelection = (select) => {
		if(!select) return setState({...state, selection: {}, selectionLength: 0});

		let selection = state.selection;

		state.data.forEach((el, i) => {
			if(i in selection) return;

			if(!select) return delete selection[i];

			selection[i] = true;
		});

		setState({...state, selection: selection, selectionLength: state.data.length});
	}

	return {
		setState,
		addNewRow,
		addRow,
		existIndexItem,
		getRowByIndex,
		updateRowByIndex,
		removeRowByIndex,
		removeSelectedRows,
		getSelectedRows,
		changeCellValue,
		changeRowSelection,
		changeAllSelection,
		selectionLength: state.selectionLength,
		listParams: {...state, changeAllSelection, changeRowSelection, changeCellValue, changeEdditing, setState}
	};
}