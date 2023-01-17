import { useContext } from 'react';
import { ClientFetch } from '../util/Fetching';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

// Redux Reducers:
import { removeSession } from '../features/session/sessionSlice.js';

// Contexts:
import globalLoaderContext from '../contexts/globalLoaderContext';

export default function useLogout(){
    const dispatch = useDispatch();
    const {hideGlobalLoader, showGlobalLoader, globalLoaderState} = useContext(globalLoaderContext);
    const { enqueueSnackbar }=useSnackbar();

    return async () => {
    	if(globalLoaderState) return;

    	showGlobalLoader();

    	let ftc = new ClientFetch();

		try{
			let data=null;
			let res = await ftc.get({
				url:'/api/auth/logout',
				timeout: 130000
			});

			dispatch(removeSession());
		}catch(e){
			console.log(e);
			enqueueSnackbar(ftc.aborted() ? 'API request timeout has expired!' : 'Failed to establish connection to server!', {variant: 'error'});
		}

		hideGlobalLoader();
    };
}