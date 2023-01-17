import { useState } from 'react';


// Utils:
import {ClientFetch} from '../util/Fetching';

const initialState = {
	data: [],
	errors: null,
	message: null,
	fetcher: new ClientFetch(),
	fetchOpts: {},
	page: 1,
	maxLength: 100,
	isLoading: false,
	fetchFunction: null
};

export default function useLazyLoadSearch({fetchOptions, fetchFunction, maxLength}) {
	const [ state, setState ] = useState({
		...initialState,
		fetchOpts: fetchOptions,
		maxLength: maxLength ?? 100,
		fetchFunction: fetchFunction ?? initialState.fetchFunction,

	});


	// Reinicia el estado:
	const clear = () => {
		if(state.isLoading === true) state.fetcher.abort();
		setState({
			...initialState,
			fetcher: state.fetcher,
			fetchOpts: state.fetchOpts,
			maxLength: state.maxLength,
			fetchFunction: state.fetchFunction
		});
	};

	// Cambia el límite de registros a traer:
	const setMaxLength = (maxLength) => setState({...state, maxLength});

	// Cambia las opciones del fetcher:
	const setFetchOptions = (opts) => setState({...state, fetchOpts: opts});

	const fetchData = async (type, body, params) => {
		setState({...state, isLoading: true});

		let fetchAction;
		let currentPage = (type === 'more') ? (state.page + 1) : 1;
		let opts = {...state.fetchOpts, data: body};

		if(!!body) {
			if(body instanceof FormData) {
				body.append('__page', state.page);
				body.append('__limit', state.maxLength);
			} else {
				body.__page = state.page;
				body.__limit = state.maxLength;
			}
		} else {
			body = state.data ?? {};
		}

		if(!!params) {
			params.__page = state.page;
			params.__limit = state.maxLength;

			let added = 0;

			Object.keys(params).forEach((el) => {
				if(!!params[el]){
					opts.url = `${opts.url}${added === 0 ? '?' : '&'}${el}=${params[el]}`;
					added++;
				}
			});
		}
		console.log(opts);

		try {
			fetchAction = await state.fetcher.get(opts);
		}catch(e){
			return setState({...state, data: state.data, errors: {server: 'Undefined error!'}, message: 'Undefined error!', isLoading: false});
		}

		let exec = state.fetchFunction(fetchAction);

		if('then' in exec) return exec.then((fetchContent) => {
			if(Array.isArray(fetchContent.data)) {
				fetchContent.data = type === 'more' ? [...state.data, fetchContent.data] : fetchContent.data;
			}else{
				fetchContent.data = type === 'more' ? state.data : [];
			}

			setState({...state, data: fetchContent.data, errors: fetchContent.errors, message: fetchContent.message, isLoading: false, page: currentPage});
		});

		if(Array.isArray(exec.data)) {
			exec.data = type === 'more' ? [...state.data, exec.data] : exec.data;
		}else{
			exec.data = type === 'more' ? state.data : [];
		}

		setState({...state, data: exec.data, errors: exec.errors, fetching: exec.message, isLoading: false, page: currentPage});
	};

	const loadData = async ({body, params}) => await fetchData('initial', body, params);

	const getData = async ({body, params}) => {
		/*if(state.data.length >= (state.page * maxLength))*/ await fetchData('more', body, params);
	}

	const abortFetching = () => state.fetcher.abort();

	const isAborted = () => state.fetcher.aboted();

	const setIsLoading = (bool) => setState({...state, isLoading: bool});


	return {
		clear,
		isLoading: state.isLoading,
		maxLength: state.maxLength,
		abortFetching,
		loadData,
		getData,
		isAborted,
		setMaxLength,
		setIsLoading,
		setFetchOptions,
		fetchOpts: state.fetchOpts,

		page: state.page,
		maxLength: state.maxLength,

		content: {
			data: state.data,
			error: state.error,
			message: state.message
		}
	};
}