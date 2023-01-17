import React, { useState, useRef, useEffect } from 'react';

// Hooks:
import useLazyLoadSearch from '../hooks/useLazyLoadSearch';

// Utils:
import { isStatus } from '../util/functionals';

const initialState = {
	list: [],
	isOpen: false,
	value: null,
	selected: {},
	unselectable: {}
};

export default function useSearchSelector(list, onlyOneSelection, url){
	const inputRef = useRef();
	const searchTimer = useRef();
	const [state, setState] = useState({...initialState});

	const fetchHandler = async (res) => {
		try{
            if(isStatus(res.status, 200, 403, 404, 406, 500)) return await res.json();

			let msg = 'Unexpected response!';
        }catch(e){
        	return {data: null, message: msg, errors: {server: 'Undefined error!'} };
        }
	};

	const lazyLoadParams = useLazyLoadSearch({
		fetchOptions: {
			url: url ?? null,
			timeout: 130000
		},
		fetchFunction: fetchHandler
	});

	const setUrl = (url) => lazyLoadParams.setFetchOptions({...lazyLoadParams.fetchOpts, url: url});

	const setIsOpen = (value) => {
		setState({
			...state,
			isOpen: !!value,
			selected: (!value ? {} : state.selected),
			unselectable: (!value ? {} : state.unselectable),
			value: (!value ? null : value)
		});

		if(!value) inputRef.current.value = '';
	};

	const changeLoading = (bool) => setState({...state, isLoading: bool});

	// const setList = (list) => setState({...state, list: list, selected: {}});

	const changeSelect = (index, value) => {
		let selected;

		if(state.unselectable[index] === true) return;

		if(!value) {
			selected = state.selected;
			if(selected[index] === true) delete selected[index];
		} else {
			selected = (onlyOneSelection !== true) ? {...state.selected, [index]: true} : {[index]: true};
		}

		setState({...state, selected: selected});
	};

	const changeInputData = () => {
		if(!lazyLoadParams.isLoading) {
			lazyLoadParams.setIsLoading(true);
			lazyLoadParams.abortFetching();
		}

		if(!!searchTimer.current) searchTimer.current = clearInterval(searchTimer.current);

		searchTimer.current = setTimeout(() => {
			setState({...state, selected: {}});
			lazyLoadParams.loadData({params: {search: inputRef.current.value.trim(), ...((typeof state.value === 'object' && !Array.isArray(state.value)) ? state.value : {})}});
		}, 1500);
	}

	const getMoreData = () => {
		if(!!lazyLoadParams.isLoading && (lazyLoadParams.content.data.length >= (Number(lazyLoadParams.content.page) * Number(lazyLoadParams.content.maxLength)))) return;

		lazyLoadParams.setIsLoading(true);
		lazyLoadParams.abortFetching();

		if(!!searchTimer.current) searchTimer.current = clearInterval(searchTimer.current);
	}

	const addSelection = (selection, unselectablePreselected) => {
		setState({...state, selected: {...state.selected, ...selection}, unselectable: !!unselectablePreselected ? selection : {}});
	}

	const getSelectedItems = () => {
		let selected = Object.keys(state.selected).sort(),
			selectedList = [];

		selected.forEach((selectedIndex) => {
			if(!!state.unselectable[selectedIndex]) return;
			selectedList.push(lazyLoadParams.content.data[selectedIndex]);
		});

		return selectedList;
	};

	useEffect(() => {
		if(!state.isOpen) {
			setState({...initialState, url: lazyLoadParams.fetchOpts.url ?? null, list: state.list});
			return lazyLoadParams.clear();
		}
		lazyLoadParams.loadData({params: {search: inputRef.current.value, ...((typeof state.value === 'object' && !Array.isArray(state.value)) ? state.value : {})}});
		inputRef.current.focus();
		// lazyLoadParams.loadData({params: {search: inputRef.current.value.trim()}});
	}, [state.isOpen]);

	useEffect(() => {
	}, [lazyLoadParams.content.data]);

	return {
		...state,
		setUrl,
		changeInputData,
		setIsOpen,
		changeLoading,
		//setList,
		inputRef,
		searchSelectorParams: {...state, changeSelect, setIsOpen, inputRef, lazyLoadParams, changeInputData, getMoreData, getSelectedItems, addSelection},
		lazyLoadParams,
		getMoreData,
		getSelectedItems
	};
}