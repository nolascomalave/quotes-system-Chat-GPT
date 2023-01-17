import { useState, useEffect } from 'react';

// Helpers:
import helpUnitMeasurementOrderingList from '../helpers/helpUnitMeasurementOrderingList';

const initialState = {
	isLoading: false,
	message: 'No data to display.',
	list: {__values: []}
};

export default function useUnitMeasurementList() {
	const [ state, setState ] = useState(initialState);
	let [ isOpen, setIsOpen ] = useState(false);

	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);

	const setList = (list) => setState({ ...state, list: list.length > 0 ? helpUnitMeasurementOrderingList(list) : initialState.list, isLoading: false, message: list.length < 1 ? 'No data to display.' : null });

	const setLoading = (bool) => setState({ ...state, isLoading: bool });

	const setMessage = (message) => setState({ ...state, isLoading: false, message: message });

	useEffect(() => console.error(state), [state]);

	return {
		...state,
		isOpen,
		setLoading,
		setList,
		open,
		close,
		setMessage,
		setUnitMeasurementList: setState
	};
};